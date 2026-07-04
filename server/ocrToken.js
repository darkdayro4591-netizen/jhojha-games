/**
 * Short-lived HMAC-signed, single-use OCR verification tokens.
 *
 * Security properties:
 *  1. Fail-closed — throws at startup if SESSION_SECRET is absent.
 *  2. Context-bound — token embeds the game name so it cannot be reused
 *     for a different game purchase.
 *  3. Anti-replay — each token carries a random JTI (nonce); once consumed
 *     via consumeOcrToken() the JTI is marked spent for the remainder of the TTL.
 *  4. Time-limited — tokens expire after TOKEN_TTL_MS (30 minutes).
 *  5. Timing-safe comparison — uses crypto.timingSafeEqual to resist
 *     timing side-channel attacks on the HMAC.
 */
const crypto = require('crypto');

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    // Fail closed — never fall back to a hardcoded value for an authz-critical secret.
    throw new Error(
      '[ocrToken] SESSION_SECRET environment variable is required. ' +
      'Set it in Replit Secrets before starting the server.'
    );
  }
  return s;
}

// ── Anti-replay store ─────────────────────────────────────────────────────────
// In-memory: safe for single-process deployments. Maps JTI → expiry epoch.
const consumedJtis = new Map();

function pruneConsumedJtis() {
  const now = Date.now();
  for (const [jti, exp] of consumedJtis) {
    if (now > exp) consumedJtis.delete(jti);
  }
}

// ── Sign ──────────────────────────────────────────────────────────────────────

/**
 * Sign an OCR result and return a base64-encoded token.
 * Embeds a random JTI for one-time-use enforcement.
 * @param {object} payload  Server-determined OCR result (no user-supplied fields).
 * @returns {string}
 */
function signOcrToken(payload) {
  const secret = getSecret(); // throws if absent
  const jti    = crypto.randomBytes(16).toString('hex');
  const data   = JSON.stringify({ ...payload, issuedAt: Date.now(), jti });
  const sig    = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, sig })).toString('base64');
}

// ── Verify (read-only — does NOT consume the JTI) ─────────────────────────────

/**
 * Verify the token signature and expiry. Does NOT mark the JTI as consumed.
 * Use consumeOcrToken() for the authoritative, one-time check.
 * @param {string} token
 * @returns {object|null}
 */
function verifyOcrToken(token) {
  try {
    const secret = getSecret();
    const { data, sig } = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');

    const sigBuf = Buffer.from(sig,      'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const parsed = JSON.parse(data);
    if (Date.now() - parsed.issuedAt > TOKEN_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ── Consume (single-use enforcement) ─────────────────────────────────────────

/**
 * Verify the token AND atomically mark its JTI as consumed.
 * Returns the verified payload on first use; null on tampered/expired/replayed token.
 * @param {string} token
 * @returns {object|null}
 */
function consumeOcrToken(token) {
  const payload = verifyOcrToken(token);
  if (!payload) return null;

  const { jti, issuedAt } = payload;
  if (!jti) return null; // tokens without a JTI are invalid

  if (consumedJtis.has(jti)) return null; // replay detected

  // Mark spent for the remainder of the TTL
  consumedJtis.set(jti, issuedAt + TOKEN_TTL_MS);

  // Prune periodically to bound memory growth
  if (consumedJtis.size > 10_000) pruneConsumedJtis();

  return payload;
}

module.exports = { signOcrToken, verifyOcrToken, consumeOcrToken };
