// Canonical server-side game prices — the single source of truth for payment
// amount validation. This MUST be kept in sync with the `salePrice` values in
// `src/data/games.ts`. Never trust a client-supplied price for these games;
// always look up the expected amount here before creating/verifying an order.
//
// Every game sold on the site comes from this manually curated catalog —
// there is no automated import from any third-party source. If a game name
// somehow isn't in this list, the server trusts the client-reported amount
// since there is no payment gateway to independently verify it against — the
// admin must manually confirm the amount received matches the order before
// marking it Verified.
const GAME_PRICES = {
  'GTA VI Pre-Order Standard Edition': 5999,
  'The Last of Us Part I': 279,
  'The Last of Us Part II': 329,
  'Resident Evil Requiem': 499,
  "Assassin's Creed Black Flag Resynced Pre-Order": 799,
  'Forza Horizon Series': 349,
  'Outlast Trials': 499,
};

function getCanonicalPrice(gameName) {
  if (!gameName) return null;
  return Object.prototype.hasOwnProperty.call(GAME_PRICES, gameName)
    ? GAME_PRICES[gameName]
    : null;
}

module.exports = { GAME_PRICES, getCanonicalPrice };
