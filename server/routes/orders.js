const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getCanonicalPrice } = require('../gamePrices');

const AMOUNT_MISMATCH_MESSAGE = 'Incorrect payment amount. Please pay the exact amount shown for this game.';

// Manual order flow: the customer pays via UPI/QR outside the app, then
// submits their order details here. This creates a "pending" order record
// for the admin to manually verify against the payment received (in their
// UPI/bank app) before marking it Verified. We never auto-approve based on
// a screenshot — a screenshot upload only signals "pending verification".
router.post('/orders/manual', async (req, res) => {
  try {
    const {
      amount, game_name,
      customer_name, instagram, email, telegram,
      steam_username, steam_password, payment_method,
    } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!game_name || !customer_name || !instagram) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    // Server-side price validation against the canonical catalog. Never
    // trust the client-supplied amount for known games.
    const canonicalPrice = getCanonicalPrice(game_name);
    if (canonicalPrice !== null && Number(amount) !== Number(canonicalPrice)) {
      return res.status(400).json({ error: AMOUNT_MISMATCH_MESSAGE });
    }
    const expectedAmount = canonicalPrice !== null ? canonicalPrice : Number(amount);

    const manualRef = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const result = await pool.query(
      `INSERT INTO orders
        (razorpay_order_id, customer_name, instagram, email, telegram,
         game_name, game_price, steam_username, steam_password,
         payment_method, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')
       RETURNING id, created_at`,
      [
        manualRef, customer_name, instagram, email || null, telegram || null,
        game_name, expectedAmount, steam_username || null,
        steam_password || null, payment_method || 'upi',
      ]
    );

    res.json({
      order_db_id: result.rows[0].id,
      status: 'pending',
      message: 'Order received. It will be processed only after we manually verify your payment.',
    });
  } catch (err) {
    console.error('Manual order error:', err.message);
    res.status(500).json({ error: 'Failed to submit order. Please try again or contact support.' });
  }
});

module.exports = router;
