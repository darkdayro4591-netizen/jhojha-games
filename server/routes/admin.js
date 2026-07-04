const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { invalidatePriceCache } = require('../gamePrices');

// ── Auth ──────────────────────────────────────────────────────────────────────

function authMiddleware(req, res, next) {
  const password = String(req.headers['x-admin-password'] || '').trim();
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(503).json({ error: 'Admin password not configured' });
  if (!password || password.length < 8 || password !== expected) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }
  next();
}

// ── Orders ────────────────────────────────────────────────────────────────────

router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { status, limit = 200, offset = 0 } = req.query;
    let query = `
      SELECT
        id, razorpay_order_id AS order_ref,
        customer_name, instagram, email, telegram,
        game_name, game_price, steam_username,
        payment_method, payment_status, failure_reason,
        upi_transaction_id, ocr_amount, ocr_date, ocr_time,
        ocr_receiver, ocr_raw_status, verification_mode,
        created_at, verified_at
      FROM orders`;
    const params = [];
    if (status) { query += ' WHERE payment_status = $1'; params.push(status); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result      = await pool.query(query, params);
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
        COUNT(*) FILTER (WHERE payment_status='verified')       AS verified,
        COUNT(*) FILTER (WHERE payment_status='auto_matched')   AS auto_matched,
        COUNT(*) FILTER (WHERE payment_status='pending')        AS pending,
        COUNT(*) FILTER (WHERE payment_status='pending_review') AS pending_review,
        COUNT(*) FILTER (WHERE payment_status='rejected')       AS rejected,
        COUNT(*) FILTER (WHERE payment_status='failed')         AS failed,
        COALESCE(SUM(game_price) FILTER (
          WHERE payment_status IN ('verified','auto_matched')
        ), 0) AS total_revenue,
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

// Verify an order (mark as verified)
router.patch('/orders/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE orders
         SET payment_status = 'verified', verified_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING id, payment_status`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify order' });
  }
});

// Reject an order with an optional reason
router.patch('/orders/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { id }     = req.params;
    const reason     = String(req.body.reason || '').slice(0, 500).trim() || 'Rejected by admin';
    const result     = await pool.query(
      `UPDATE orders
         SET payment_status = 'rejected', failure_reason = $2, updated_at = NOW()
       WHERE id = $1 RETURNING id, payment_status`,
      [id, reason]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

// ── Games ─────────────────────────────────────────────────────────────────────

/** List all games (including inactive), for admin management */
router.get('/games', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, title, category, image_url, sale_price, original_price,
             discount, rating, badge, description, steam_url,
             is_featured, in_stock, is_active, sort_order, created_at
      FROM games
      ORDER BY sort_order ASC, id ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

/** Create a new game */
router.post('/games', authMiddleware, async (req, res) => {
  try {
    const {
      title, category = 'Action', image_url = '', sale_price, original_price,
      discount, rating = 5, badge, description = '', steam_url,
      is_featured = false, in_stock = true, sort_order = 0,
    } = req.body;

    if (!title || title.length > 255) return res.status(400).json({ error: 'Game title is required (max 255 chars)' });
    if (!sale_price || Number(sale_price) <= 0) return res.status(400).json({ error: 'Sale price must be > 0' });
    if (!original_price || Number(original_price) <= 0) return res.status(400).json({ error: 'Original price must be > 0' });

    const disc = discount != null
      ? Math.min(100, Math.max(0, Number(discount)))
      : Math.round((1 - Number(sale_price) / Number(original_price)) * 100);

    const result = await pool.query(
      `INSERT INTO games
         (title, category, image_url, sale_price, original_price, discount,
          rating, badge, description, steam_url, is_featured, in_stock, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        title.trim(), (category || 'Action').trim(), (image_url || '').trim(),
        Number(sale_price), Number(original_price), disc,
        Math.min(5, Math.max(1, Number(rating) || 5)),
        badge ? badge.trim() : null,
        (description || '').trim(),
        steam_url ? steam_url.trim() : null,
        !!is_featured, !!in_stock,
        Number(sort_order) || 0,
      ]
    );
    invalidatePriceCache();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A game with that title already exists' });
    console.error('Create game error:', err.message);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

/** Full update of a game */
router.put('/games/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category, image_url, sale_price, original_price,
      discount, rating, badge, description, steam_url,
      is_featured, in_stock, is_active, sort_order,
    } = req.body;

    if (!title || title.length > 255) return res.status(400).json({ error: 'Game title is required (max 255 chars)' });
    if (!sale_price || Number(sale_price) <= 0) return res.status(400).json({ error: 'Sale price must be > 0' });

    const disc = discount != null
      ? Math.min(100, Math.max(0, Number(discount)))
      : Math.round((1 - Number(sale_price) / Number(original_price)) * 100);

    const result = await pool.query(
      `UPDATE games SET
         title=$1, category=$2, image_url=$3,
         sale_price=$4, original_price=$5, discount=$6,
         rating=$7, badge=$8, description=$9, steam_url=$10,
         is_featured=$11, in_stock=$12, is_active=$13, sort_order=$14,
         updated_at=NOW()
       WHERE id=$15 RETURNING *`,
      [
        title.trim(), (category || 'Action').trim(), (image_url || '').trim(),
        Number(sale_price), Number(original_price || sale_price), disc,
        Math.min(5, Math.max(1, Number(rating) || 5)),
        badge ? badge.trim() : null,
        (description || '').trim(),
        steam_url ? steam_url.trim() : null,
        !!is_featured, !!in_stock,
        is_active !== false,
        Number(sort_order) || 0,
        id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Game not found' });
    invalidatePriceCache();
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A game with that title already exists' });
    res.status(500).json({ error: 'Failed to update game' });
  }
});

/** Partial toggle: is_featured, in_stock, or is_active */
router.patch('/games/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['is_featured', 'in_stock', 'is_active'];
    const updates = [];
    const values  = [];

    for (const key of allowed) {
      if (key in req.body) {
        updates.push(`${key} = $${values.length + 1}`);
        values.push(!!req.body[key]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(id);
    const result = await pool.query(
      `UPDATE games SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`,
      values
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Game not found' });
    invalidatePriceCache();
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update game' });
  }
});

/** Delete a game permanently */
router.delete('/games/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM games WHERE id = $1 RETURNING title', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Game not found' });
    invalidatePriceCache();
    res.json({ success: true, title: result.rows[0].title });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

module.exports = router;
