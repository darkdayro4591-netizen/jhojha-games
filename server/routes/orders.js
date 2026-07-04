const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../db');
const { getCanonicalPrice } = require('../gamePrices');

const AMOUNT_MISMATCH_MESSAGE = 'Incorrect payment amount. Please pay the exact amount shown for this game.';
const VERIFICATION_FAILED_MESSAGE = 'Payment could not be verified. Please try again or contact support.';

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// Rupees -> paise, rounded to avoid floating point drift.
function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

router.post('/create-order', async (req, res) => {
  try {
    const {
      amount, game_name,
      customer_name, instagram, email, telegram,
      steam_username, steam_password, payment_method,
    } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!game_name || !customer_name || !instagram || !email) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    // Server-side price validation against the canonical catalog. Never
    // trust the client-supplied amount for known games.
    const canonicalPrice = getCanonicalPrice(game_name);
    if (canonicalPrice !== null && Number(amount) !== Number(canonicalPrice)) {
      return res.status(400).json({ error: AMOUNT_MISMATCH_MESSAGE });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ error: 'Payment gateway not configured. Please contact the admin.' });
    }

    const expectedAmount = canonicalPrice !== null ? canonicalPrice : Number(amount);

    const order = await razorpay.orders.create({
      amount: toPaise(expectedAmount),
      currency: 'INR',
      receipt: `jhojha_${Date.now()}`,
      notes: { game: game_name },
    });

    // Record the order as "pending" immediately, storing the server-trusted
    // expected amount. Verification later can never rely on client-resent
    // amounts — only on what's stored here.
    await pool.query(
      `INSERT INTO orders
        (razorpay_order_id, customer_name, instagram, email, telegram,
         game_name, game_price, steam_username, steam_password,
         payment_method, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')`,
      [
        order.id, customer_name, instagram, email, telegram || null,
        game_name, expectedAmount, steam_username || null,
        steam_password || null, payment_method || 'upi',
      ]
    );

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const razorpay = getRazorpay();
    if (!keySecret || !razorpay) {
      return res.status(503).json({ error: 'Payment gateway not configured', status: 'failed' });
    }

    // Look up the order we created (and trust ONLY this stored data —
    // never the client's resent game_name/amount — for verification).
    const orderRow = await pool.query(
      'SELECT * FROM orders WHERE razorpay_order_id = $1',
      [razorpay_order_id]
    );
    if (orderRow.rows.length === 0) {
      return res.status(404).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
    }
    const order = orderRow.rows[0];

    if (order.payment_status === 'verified') {
      // Already verified (e.g. duplicate callback) — return prior success.
      return res.json({
        status: 'verified',
        order_db_id: order.id,
        message: '✅ Payment verified successfully. Order accepted. Your game delivery is being processed.',
      });
    }

    const markFailed = async (reason) => {
      await pool.query(
        `UPDATE orders SET payment_status = 'failed', failure_reason = $1 WHERE id = $2`,
        [reason, order.id]
      );
    };

    // 1. Verify the HMAC signature to confirm this callback genuinely came
    //    from Razorpay for this exact order/payment pair. A screenshot or a
    //    forged client-side "success" claim can never produce a valid
    //    signature, so this alone rules out screenshot-based approval.
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await markFailed('Invalid payment signature');
      return res.status(400).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
    }

    // Duplicate payment_id re-use check.
    const existingPayment = await pool.query(
      'SELECT id FROM orders WHERE razorpay_payment_id = $1',
      [razorpay_payment_id]
    );
    if (existingPayment.rows.length > 0) {
      await markFailed('Duplicate payment detected');
      return res.status(409).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
    }

    // 2. Fetch the authoritative payment record from Razorpay itself and
    //    confirm the amount actually captured/authorized matches exactly
    //    what we expected when the order was created. This is the
    //    server-side "amount must exactly match the game price" check —
    //    it never trusts anything the client sends at this step.
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (fetchErr) {
      console.error('Razorpay payment fetch error:', fetchErr.message);
      await markFailed('Could not confirm payment with gateway');
      return res.status(502).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
    }

    if (!payment || payment.order_id !== razorpay_order_id) {
      await markFailed('Payment/order mismatch');
      return res.status(400).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
    }

    if (!['captured', 'authorized'].includes(payment.status)) {
      await markFailed(`Payment status not successful: ${payment.status}`);
      return res.status(400).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
    }

    const expectedPaise = toPaise(order.game_price);
    if (Number(payment.amount) !== expectedPaise) {
      await markFailed('Amount mismatch between paid amount and expected game price');
      return res.status(400).json({ error: AMOUNT_MISMATCH_MESSAGE, status: 'failed' });
    }

    // All checks passed — mark verified.
    await pool.query(
      `UPDATE orders
         SET razorpay_payment_id = $1, payment_status = 'verified', verified_at = NOW(), failure_reason = NULL
       WHERE id = $2`,
      [razorpay_payment_id, order.id]
    );

    res.json({
      status: 'verified',
      order_db_id: order.id,
      message: '✅ Payment verified successfully. Order accepted. Your game delivery is being processed.',
    });
  } catch (err) {
    console.error('Verify payment error:', err.message);
    try {
      if (razorpay_order_id) {
        await pool.query(
          `UPDATE orders SET payment_status = 'failed', failure_reason = $1
           WHERE razorpay_order_id = $2 AND payment_status = 'pending'`,
          ['Unexpected server error during verification', razorpay_order_id]
        );
      }
    } catch (updateErr) {
      console.error('Failed to mark order failed:', updateErr.message);
    }
    res.status(500).json({ error: VERIFICATION_FAILED_MESSAGE, status: 'failed' });
  }
});

module.exports = router;
