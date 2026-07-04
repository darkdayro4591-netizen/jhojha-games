/**
 * Public game catalog API.
 * GET /api/games — returns all active, in-stock games ordered by sort_order.
 */
const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const fallbackGames = require('../fallbackGames');

const { mergeCatalog } = fallbackGames;

router.get('/games', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id, title, category,
        image_url,
        sale_price,
        original_price,
        discount, rating, badge, description,
        steam_url,
        is_featured,
        in_stock
      FROM games
      WHERE is_active = true
      ORDER BY sort_order ASC, id ASC
    `);

    const catalog = mergeCatalog(rows || []);
    return res.json(catalog);
  } catch (err) {
    console.error('Games fetch error:', err.message);
    return res.json(mergeCatalog([]));
  }
});

module.exports = router;
