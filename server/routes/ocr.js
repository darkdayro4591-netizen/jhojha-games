const express = require('express');
const router  = require('express').Router();
const multer  = require('multer');
const { createWorker } = require('tesseract.js');
const { getCanonicalPrice } = require('../gamePrices');
const { signOcrToken }      = require('../ocrToken');

// ── File upload ──────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ── In-memory IP rate limiter: 15 OCR requests / minute ─────────────────────

const rateMap  = new Map();
const WINDOW   = 60_000;
const MAX_REQS = 15;

function rateLimiter(req, res, next) {
  const ip  = (req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim();
  const now = Date.now();
  let e     = rateMap.get(ip);

  if (!e || now - e.start > WINDOW) e = { start: now, count: 0 };
  e.count++;
  rateMap.set(ip, e);

  if (rateMap.size > 5000) {
    for (const [k, v] of rateMap) {
      if (now - v.start > WINDOW) rateMap.delete(k);
    }
  }

  if (e.count > MAX_REQS) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  }
  next();
}

// ── OCR text parsing ─────────────────────────────────────────────────────────

function parsePaymentText(text) {
  // Success status
  const isSuccess = [
    /payment\s+successful/i, /transaction\s+successful/i, /paid\s+successfully/i,
    /successfully\s+paid/i, /money\s+sent/i, /sent\s+successfully/i,
    /transfer\s+successful/i, /\bsuccess\b/i, /\bpaid\b/i,
    /payment\s+complete/i, /transaction\s+complete/i,
    /amount\s+debited/i, /debited\s+successfully/i,
  ].some(p => p.test(text));

  // Amount
  let amount = null;
  for (const pattern of [
    /(?:₹|rs\.?|inr)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?|inr)/gi,
    /(?:amount|paid|total|deducted|debited)[:\s]+(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
  ]) {
    pattern.lastIndex = 0;
    const m = pattern.exec(text);
    if (m) {
      const v = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(v) && v > 0) { amount = v; break; }
    }
  }

  // Transaction ID
  let transactionId = null;
  for (const pattern of [
    /(?:utr|upi\s*ref(?:erence)?(?:\s*no\.?)?|transaction\s*id|txn\s*(?:id)?|ref(?:erence)?\s*(?:no\.?|id)?|order\s*id)[:\s#]*([A-Z0-9]{8,})/i,
    /\b([0-9]{10,16})\b/,
    /\b([A-Z]{2,6}[0-9]{6,})\b/,
  ]) {
    const m = text.match(pattern);
    if (m) {
      const c = m[1];
      if (c.length >= 10 || /[A-Z]/i.test(c)) { transactionId = c; break; }
    }
  }

  // Date
  let date = null;
  for (const p of [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:,?\s*\d{2,4})?)/i,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  ]) {
    const m = text.match(p);
    if (m) { date = m[1].trim(); break; }
  }

  // Time
  const timeM = text.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/i);
  const time   = timeM ? timeM[1].trim() : null;

  // Receiver
  let receiverName = null;
  const rM = text.match(/(?:to|paid to|recipient|merchant|payee)[:\s]+([A-Za-z][A-Za-z\s.]{2,40}?)(?:\n|\r|$|[,|])/im);
  if (rM) receiverName = rM[1].trim();

  return { isSuccess, amount, transactionId, date, time, receiverName };
}

// ── Analyse endpoint ──────────────────────────────────────────────────────────

router.post('/ocr/analyze', rateLimiter, upload.single('screenshot'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No screenshot uploaded' });

  const gameName = typeof req.body.game_name === 'string' ? req.body.game_name.trim() : '';

  let worker;
  try {
    worker = await createWorker('eng', 1, { logger: () => {} });
    const { data: { text } } = await worker.recognize(req.file.buffer);
    await worker.terminate();
    worker = null;

    const parsed         = parsePaymentText(text);
    // DB-backed price lookup (async)
    const canonicalPrice = gameName ? await getCanonicalPrice(gameName) : null;

    // Determine verification mode
    const hasAmount  = parsed.amount !== null;
    const hasTxnId   = parsed.transactionId !== null;
    const hasSuccess = parsed.isSuccess;

    let verificationMode;
    let rejectionReason = null;

    if (!hasAmount || !hasSuccess) {
      verificationMode = 'rejected';
      const missing = [];
      if (!hasAmount)  missing.push('payment amount');
      if (!hasSuccess) missing.push('success status');
      if (!hasTxnId)   missing.push('transaction ID');
      rejectionReason = `Could not detect: ${missing.join(', ')}`;
    } else if (canonicalPrice !== null && Math.round(parsed.amount) !== Math.round(canonicalPrice)) {
      verificationMode = 'rejected';
      rejectionReason  = `Amount mismatch: screenshot shows ₹${parsed.amount}, expected ₹${canonicalPrice}`;
    } else if (!hasTxnId) {
      verificationMode = 'pending_review'; // amount + success visible but no txn ID
    } else {
      verificationMode = 'auto_matched';   // all three present and amount matches
    }

    const tokenPayload = {
      verificationMode,
      gameName,
      amount:        parsed.amount,
      transactionId: parsed.transactionId,
      date:          parsed.date,
      time:          parsed.time,
      receiverName:  parsed.receiverName,
      isSuccess:     parsed.isSuccess,
      rawStatus:     parsed.isSuccess ? 'Success' : 'Unknown',
    };
    const ocrToken = signOcrToken(tokenPayload);

    res.json({
      verificationMode,
      rejectionReason,
      ocrToken,
      extracted: {
        amount:        parsed.amount,
        transactionId: parsed.transactionId,
        date:          parsed.date,
        time:          parsed.time,
        receiverName:  parsed.receiverName,
        isSuccess:     parsed.isSuccess,
        rawStatus:     parsed.isSuccess ? 'Success' : 'Unknown',
      },
    });
  } catch (err) {
    if (worker) { try { await worker.terminate(); } catch (_) {} }
    console.error('OCR error:', err.message);
    res.status(500).json({ error: 'OCR analysis failed. Please try again.' });
  }
});

module.exports = router;
