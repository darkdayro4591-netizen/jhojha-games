# Jhojha Games

A game reselling storefront (India-focused, UPI payments) with an automated payment screenshot OCR verification system.

## Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite (port 5000)
- **Backend**: Node.js/Express (port 3001), CommonJS (`require`)
- **Database**: Replit built-in PostgreSQL (`DATABASE_URL` env var — runtime-managed, do not set manually)
- **OCR**: Tesseract.js (server-side, via `server/routes/ocr.js`)
- **File uploads**: Multer (memory storage, 10 MB limit)

## How to run
```
npm run dev        # Vite dev server on port 5000
npm run server     # Express backend on port 3001
npm run dev:all    # Both concurrently
```

## Architecture
```
src/           Frontend (React/TSX)
  components/  CheckoutModal, Navbar, Hero, etc.
  pages/       AdminDashboard
server/
  index.js          Entry point
  db.js             pg Pool
  gamePrices.js     Canonical game price catalog (source of truth)
  ocrToken.js       HMAC signing/verification for OCR results
  routes/
    ocr.js          POST /api/ocr/analyze — Tesseract OCR + signed token
    orders.js       POST /api/orders/manual — order submission
    admin.js        GET/DELETE /api/admin/* — admin dashboard API
public/        Static assets (QR code, game cover images)
dist/          Production build output
```

## Payment & OCR flow
1. Customer selects game → fills details → pays via UPI QR
2. Uploads payment screenshot → `POST /api/ocr/analyze`
3. Server runs Tesseract OCR, extracts amount/txn ID/status, compares against canonical price
4. Returns HMAC-signed token + extracted data
5. Frontend shows extracted details and verification result
6. Customer submits order with the signed token → `POST /api/orders/manual`
7. Server verifies token (cannot be forged by client), stores OCR fields, sets payment_status

## Order statuses
| Status         | Meaning                                              |
|----------------|------------------------------------------------------|
| `auto_matched` | OCR verified amount + txn ID + success status        |
| `pending_review` | Amount + success found, txn ID unclear (manual check) |
| `pending`      | Submitted without OCR (no screenshot)                |
| `verified`     | Admin manually confirmed                             |
| `rejected`     | OCR found mismatch or missing required fields        |
| `failed`       | Order submission failed                              |

## Environment secrets
- `SESSION_SECRET` — required for HMAC-signing OCR tokens (set via Replit Secrets)
- `ADMIN_PASSWORD` — admin dashboard password (set via Replit Secrets)
- `DATABASE_URL` — managed by Replit, do not set manually

## Admin dashboard
Visit `/admin` — password-protected, shows all orders with OCR data, filters by status.

## Game price catalog
Edit `server/gamePrices.js` to add/change game prices. The server always validates submitted amounts against this catalog.

## User preferences
- Keep the black and gold Jhojha Games theme throughout all UI changes.
- Never trust client-supplied `verification_mode` — always use the server-signed `ocr_token`.
