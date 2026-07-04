---
name: Game price catalog
description: Where game prices are defined and how price validation works
---

**Source of truth:** `server/gamePrices.js` — the `GAME_PRICES` object maps exact game name strings to INR prices.

**Why:** The app uses manual UPI payments (no payment gateway). The server must validate the submitted amount against the catalog to prevent customers from paying less. `getCanonicalPrice(gameName)` returns the expected price or `null` if the game is not in the catalog (unknown games pass through without server-side validation).

**How to apply:**
- Add a game: add an entry to `GAME_PRICES` in `server/gamePrices.js`.
- Keep game name strings in sync with what the frontend passes in `game_name` on checkout.
- OCR route also uses `getCanonicalPrice` to cross-check the amount extracted from the screenshot.
- Both the OCR route and the orders route independently validate amounts — defense in depth.
