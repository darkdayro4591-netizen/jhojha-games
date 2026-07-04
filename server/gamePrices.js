/**
 * Canonical server-side game prices.
 * Source of truth for payment amount validation.
 *
 * DB-backed with an in-memory cache (5-minute TTL).
 * Falls back to hardcoded values if the DB is unavailable.
 */
const pool = require('./db');

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let _cache    = null;
let _cacheAt  = 0;

// Hardcoded fallback — kept in sync when new games are added via admin panel.
const FALLBACK_PRICES = {
  'GTA VI Pre-Order Standard Edition':               5999,
  'The Last of Us Part I':                           279,
  'The Last of Us Part II':                          329,
  'Resident Evil Requiem':                           499,
  "Assassin's Creed Black Flag Resynced Pre-Order":  799,
  'Forza Horizon Series':                            349,
  'Outlast Trials':                                  499,
  'Resident Evil 4':                                 249,
  'God of War':                                      299,
  'God of War Ragnarök':                             349,
  'Resident Evil Village':                           399,
};

async function loadPriceCache() {
  const now = Date.now();
  if (_cache && now - _cacheAt < CACHE_TTL) return _cache;
  try {
    const { rows } = await pool.query(
      'SELECT title, sale_price FROM games WHERE is_active = true'
    );
    _cache = {};
    for (const r of rows) _cache[r.title] = parseFloat(r.sale_price);
    _cacheAt = now;
    return _cache;
  } catch {
    return FALLBACK_PRICES;
  }
}

/** Call after any game price or active-status change via admin. */
function invalidatePriceCache() {
  _cache   = null;
  _cacheAt = 0;
}

/** Returns the canonical sale price for a game, or null if unknown. */
async function getCanonicalPrice(gameName) {
  if (!gameName) return null;
  const prices = await loadPriceCache();
  return Object.prototype.hasOwnProperty.call(prices, gameName)
    ? prices[gameName]
    : null;
}

module.exports = { getCanonicalPrice, invalidatePriceCache };
