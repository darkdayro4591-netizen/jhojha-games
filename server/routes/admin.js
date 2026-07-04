const express = require('express');
const router = express.Router();
const pool = require('../db');

function authMiddleware(req, res, next) {
  const password = req.headers['x-admin-password'];
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(503).json({ error: 'Admin password not configured' });
  if (password !== expected) return res.status(401).json({ error: 'Invalid admin password' });
  next();
}

router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let query = `SELECT
      id, razorpay_order_id, razorpay_payment_id,
      customer_name, instagram, email, telegram,
      game_name, game_price, steam_username,
      payment_method, payment_status, failure_reason,
      created_at, verified_at
    FROM orders`;
    const params = [];
    if (status) { query += ' WHERE payment_status = $1'; params.push(status); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      status ? 'SELECT COUNT(*) FROM orders WHERE payment_status=$1' : 'SELECT COUNT(*) FROM orders',
      status ? [status] : []
    );
    res.json({ orders: result.rows, total: Number(countResult.rows[0].count) });
  } catch (err) {
    console.error('Admin orders error:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE payment_status='verified') AS verified,
        COUNT(*) FILTER (WHERE payment_status='pending') AS pending,
        COUNT(*) FILTER (WHERE payment_status='failed') AS failed,
        COALESCE(SUM(game_price) FILTER (WHERE payment_status='verified'), 0) AS total_revenue,
        COUNT(*) AS total_orders
      FROM orders
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.delete('/orders/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
