---
name: Order status model
description: The payment_status values stored in the orders table, their meaning, and admin stats behavior
---

| Status           | Set when                                                       |
|------------------|----------------------------------------------------------------|
| `auto_matched`   | OCR token verified: amount + txn ID + success all found and match |
| `pending_review` | OCR token verified: amount + success found, txn ID unreadable  |
| `pending`        | Order submitted without a valid OCR token (no screenshot)      |
| `verified`       | Admin manually confirmed payment received                      |
| `rejected`       | OCR check failed — order is NOT created; client shows an error |
| `failed`         | Legacy pre-OCR submission failure                              |

**Why `rejected` is different:** When OCR rejects (amount mismatch, missing success/amount), no DB row is written — the API returns 4xx and the frontend blocks submission. `rejected` can appear in admin stats only if future code writes it explicitly; the current flow does not.

**Admin revenue stat:** counts `verified` + `auto_matched` only. Do not include `pending_review` or `pending` in revenue totals.

**Do not aggregate statuses:** each status has distinct admin urgency. Keep them separate in filters and stats — merging `auto_matched`/`pending_review`/`pending` into one bucket hides actionable signal.
