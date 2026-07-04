const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { getCanonicalPrice } = require('../gamePrices');
const { consumeOcrToken }   = require('../ocrToken');

const AMOUNT_MISMATCH_MESSAGE =
  'Incorrect payment amount. Please pay the exact amount shown for this game.';

// ── Per-IP rate limiter: 5 order submissions per 10 minutes ──────────────────
const orderRateMap = new Map();
const ORDER_WINDOW  = 10 * 60 * 1000; // 10 minutes
const ORDER_MAX     = 5;

function orderRateLimiter(req, res, next) {
  const ip  = (req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim();
  const now = Date.now();
  let e     = orderRateMap.get(ip);

  if (!e || now - e.start > ORDER_WINDOW) e = { start: now, count: 0 };
  e.count++;
  orderRateMap.set(ip, e);

  // Prune stale IPs periodically
  if (orderRateMap.size > 5000) {
    for (const [k, v] of orderRateMap) {
      if (now - v.start > ORDER_WINDOW) orderRateMap.delete(k);
    }
  }

  if (e.count > ORDER_MAX) {
    return res.status(429).json({
      error: 'Too many order attempts. Please wait 10 minutes before trying again.',
    });
  }
  next();
}

// ── Sanitise a plain string field ─────────────────────────────────────────────
function sanitize(val, maxLen = 255) {
  if (val == null) return null;
  return String(val).trim().slice(0, maxLen) || null;
}

// ── Manual order submission ───────────────────────────────────────────────────
router.post('/orders/manual', orderRateLimiter, async (req, res) => {
  try {
    const {
      amount, game_name,
      customer_name, instagram, email, telegram,
      steam_username, steam_password, payment_method,
      ocr_token,
    } = req.body;

    // ── Input validation & sanitisation ─────────────────────────────────
    const safeGameName = sanitize(game_name, 255);
    const safeName     = sanitize(customer_name, 255);
    const safeIg       = sanitize(instagram?.replace(/^@/, ''), 30);
    const safeEmail    = sanitize(email, 254);
    const safeTg       = sanitize(telegram?.replace(/^@/, ''), 32);
    const safeSteamU   = sanitize(steam_username, 100);
    const safeSteamP   = sanitize(steam_password, 200);
    const safeMethod   = sanitize(payment_method, 30);

    if (!amount || Number(amount) < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (!safeGameName) {
      return res.status(400).json({ error: 'Game name is required' });
    }
    if (!safeName) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!safeIg) {
      return res.status(400).json({ error: 'Instagram username is required' });
    }
    // Reject clearly invalid Instagram handles
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(safeIg)) {
      return res.status(400).json({ error: 'Invalid Instagram username' });
    }
    // Prevent negative or astronomical amounts
    const submittedAmount = Number(amount);
    if (submittedAmount < 1 || submittedAmount > 100_000) {
      return res.status(400).json({ error: 'Amount out of allowed range' });
    }

    // ── Server-side price validation (prevents browser-devtools manipulation) ─
    const canonicalPrice = await getCanonicalPrice(safeGameName);
    if (canonicalPrice !== null && Math.round(submittedAmount) !== Math.round(canonicalPrice)) {
      return res.status(400).json({ error: AMOUNT_MISMATCH_MESSAGE });
    }
    const expectedAmount = canonicalPrice !== null ? canonicalPrice : submittedAmount;

    // ── Resolve verification from signed, single-use OCR token ──────────
    // consumeOcrToken() verifies HMAC + expiry + marks JTI as spent (anti-replay).
    let verificationMode   = 'pending';
    let upi_transaction_id = null;
    let ocr_amount         = null;
    let ocr_date           = null;
    let ocr_time           = null;
    let ocr_receiver       = null;
    let ocr_raw_status     = null;

    if (ocr_token) {
      const verified = consumeOcrToken(ocr_token);

      if (!verified) {
        return res.status(400).json({
          error: 'Screenshot verification token is invalid, expired, or already used. ' +
                 'Please re-upload your payment screenshot.',
        });
      }

      // Context binding: token must have been issued for this exact game
      if (verified.gameName && verified.gameName !== safeGameName) {
        return res.status(400).json({
          error: 'Screenshot verification does not match the selected game. Please re-upload.',
        });
      }

      // Block any client-side "rejected" token from being submitted
      if (verified.verificationMode === 'rejected') {
        return res.status(400).json({
          error: 'Screenshot verification failed. Please upload a clear payment screenshot ' +
                 'showing the transaction ID, amount, and success status.',
        });
      }

      // Double-check OCR amount against canonical price server-side
      if (
        verified.amount != null &&
        canonicalPrice  != null &&
        Math.round(verified.amount) !== Math.round(canonicalPrice)
      ) {
        return res.status(400).json({ error: AMOUNT_MISMATCH_MESSAGE });
      }

      verificationMode   = verified.verificationMode;           // auto_matched | pending_review
      upi_transaction_id = sanitize(verified.transactionId, 64) || null;
      ocr_amount         = verified.amount != null ? Number(verified.amount) : null;
      ocr_date           = sanitize(verified.date, 30)          || null;
      ocr_time           = sanitize(verified.time, 20)          || null;
      ocr_receiver       = sanitize(verified.receiverName, 255) || null;
      ocr_raw_status     = sanitize(verified.rawStatus, 50)     || null;
    }

    const paymentStatus =
      verificationMode === 'auto_matched'   ? 'auto_matched'   :
      verificationMode === 'pending_review' ? 'pending_review' :
      'pending';

    const manualRef = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const result = await pool.query(
      `INSERT INTO orders
        (razorpay_order_id, customer_name, instagram, email, telegram,
         game_name, game_price, steam_username, steam_password,
         payment_method, payment_status,
         upi_transaction_id, ocr_amount, ocr_date, ocr_time,
         ocr_receiver, ocr_raw_status, verification_mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING id, created_at`,
      [
        manualRef, safeName, safeIg, safeEmail, safeTg,
        safeGameName, expectedAmount, safeSteamU, safeSteamP,
        safeMethod || 'upi', paymentStatus,
        upi_transaction_id, ocr_amount, ocr_date, ocr_time,
        ocr_receiver, ocr_raw_status, verificationMode,
      ]
    );

    const messages = {
      auto_matched:   'Payment screenshot verified automatically. Your order has been recorded.',
      pending_review: 'Order received. Our team will review the screenshot details shortly.',
      pending:        'Order received. It will be processed after manual payment verification.',
    };

    res.json({
      order_db_id:       result.rows[0].id,
      status:            paymentStatus,
      verification_mode: verificationMode,
      message:           messages[verificationMode] || messages.pending,
    });
  } catch (err) {
    if (err.code === '23505') {
      // Duplicate UPI transaction ID
      return res.status(409).json({
        error: 'This payment has already been registered. Contact support if you believe this is an error.',
      });
    }
    console.error('Manual order error:', err.message);
    res.status(500).json({ error: 'Failed to submit order. Please try again or contact support.' });
  }
});

module.exports = router;
