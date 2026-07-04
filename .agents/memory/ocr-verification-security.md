---
name: OCR verification security
description: Security model for OCR-based payment verification — token design decisions and invariants
---

The OCR endpoint signs its result with HMAC-SHA256 using SESSION_SECRET. The signed token is sent to the client and must be returned with the order submission so the server can determine verification_mode and OCR fields without trusting any client-supplied values.

**Why:** This prevents a client from forging `"auto_matched"` status for any payment amount by submitting raw verification fields directly.

**Key invariants — never break these:**
- **Fail-closed secret:** `getSecret()` throws if SESSION_SECRET is absent. No hardcoded fallback. If the env var is missing, the server refuses to sign or verify anything.
- **Single-use JTI:** every token contains a random nonce (jti). `consumeOcrToken()` marks it spent on first use; replay within the TTL window is rejected.
- **Game binding:** token payload embeds `gameName`; orders route rejects tokens where `token.gameName !== submitted game_name`.
- **30-minute TTL:** tokens expire; use `consumeOcrToken()` (not `verifyOcrToken()`) in the orders route — it enforces both expiry and anti-replay.
- **Double amount check:** both the OCR route and the orders route independently validate extracted OCR amount against the canonical price catalog.
