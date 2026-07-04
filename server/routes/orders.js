const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../db');

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post('/create-order', async (req, res) => {
  try {
    const { amount, game_name } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ error: 'Payment gateway not configured. Please contact the admin.' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `jhojha_${Date.now()}`,
      notes: { game: game_name || '' },
    });

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
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      customer_name, instagram, email, telegram,
      game_name, game_price, steam_username, steam_password, payment_method,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details', status: 'failed' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({ error: 'Payment gateway not configured', status: 'failed' });
    }

    const generated = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature', status: 'failed' });
    }

    const existing = await pool.query(
      'SELECT id FROM orders WHERE razorpay_payment_id = $1',
      [razorpay_payment_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Duplicate payment detected', status: 'failed' });
    }

    const result = await pool.query(
      `INSERT INTO orders
        (razorpay_order_id, razorpay_payment_id, customer_name, instagram, email,
         telegram, game_name, game_price, steam_username, steam_password,
         payment_method, payment_status, verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'verified',NOW())
       RETURNING id, created_at`,
      [
        razorpay_order_id, razorpay_payment_id, customer_name, instagram, email,
        telegram || null, game_name, game_price, steam_username || null,
        steam_password || null, payment_method || 'upi',
      ]
    );

    res.json({
      status: 'verified',
      order_db_id: result.rows[0].id,
      message: '✅ Payment verified successfully. Order accepted. Your game delivery is being processed.',
    });
  } catch (err) {
    console.error('Verify payment error:', err.message);
    res.status(500).json({ error: 'Verification failed', status: 'failed' });
  }
});

module.exports = router;
