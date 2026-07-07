import type { Config, Context } from "@netlify/functions";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import crypto from "node:crypto";
import { createWorker } from "tesseract.js";
import { db } from "../../db/index.js";
import { auditLogs, games, ocrTokenUses, orders } from "../../db/schema.js";

const TOKEN_TTL_MS = 30 * 60 * 1000;
const PAYMENT_MAX_AGE_MS = 48 * 60 * 60 * 1000;

const FALLBACK_GAMES = [
  ["GTA VI Pre-Order", "Action", "/gta6-cover.jpeg", 5999, 7999, 25, "PRE-ORDER", "Pre-order Grand Theft Auto VI and get access to upcoming bonus content and launch perks."],
  ["The Last of Us Part I", "RPG", "https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/library_600x900.jpg", 279, 999, 72, null, "Experience the emotional journey of Joel and Ellie in this acclaimed survival adventure."],
  ["The Last of Us Part II", "RPG", "https://cdn.cloudflare.steamstatic.com/steam/apps/2531310/library_600x900.jpg", 329, 1299, 75, null, "Continue the gripping survival story with Ellie in this intense sequel."],
  ["Resident Evil 4", "Horror", "/re-requiem-cover.jpeg", 249, 1999, 88, null, "A tense survival-horror classic with action-heavy combat and atmospheric terror."],
  ["Resident Evil Village", "Horror", "/re-requiem-cover.jpeg", 399, 1999, 80, null, "Return to a gothic village full of horror, mystery, and relentless enemies."],
  ["God of War", "Action", "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg", 299, 1999, 85, "HOT DEAL", "Join Kratos on a brutal and emotional journey through Norse mythology."],
  ["God of War Ragnarök", "Action", "https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_600x900.jpg", 349, 2499, 86, "NEW", "The epic continuation of Kratos and Atreus in the Norse saga."],
  ["Outlast Trials", "Horror", "/outlast-trials-cover.jpeg", 499, 1799, 72, null, "Survive the Murkoff Corporation's twisted experiments in this terrifying co-op horror experience."],
  ["Forza Horizon Series", "Racing", "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg", 349, 1599, 78, null, "The latest Forza Horizon installment with hundreds of cars and open-world racing."],
  ["Assassin's Creed Black Flag Resynced", "Open World", "/ac-black-flag-cover.jpeg", 799, 1499, 47, "PRE-ORDER", "Sail the Caribbean as Edward Kenway in this remastered pirate adventure."],
] as const;

const json = (body: unknown, init?: ResponseInit) => Response.json(body, init);
const clean = (value: unknown, max = 255) => String(value ?? "").trim().slice(0, max);
const money = (value: unknown) => Number.parseFloat(String(value ?? "0"));
const normalizeIg = (value: unknown) => clean(value, 30).replace(/^@/, "");

function requireAdmin(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = clean(req.headers.get("x-admin-password"), 500);
  if (!expected) return { ok: false, response: json({ error: "Admin password not configured" }, { status: 503 }) };
  if (!provided || provided !== expected) return { ok: false, response: json({ error: "Invalid admin password" }, { status: 401 }) };
  return { ok: true as const };
}

async function seedGamesIfEmpty() {
  const [{ value }] = await db.select({ value: count() }).from(games);
  if (Number(value) > 0) return;
  await db.insert(games).values(FALLBACK_GAMES.map((g, index) => ({
    title: g[0], category: g[1], imageUrl: g[2], salePrice: String(g[3]), originalPrice: String(g[4]),
    discount: g[5], badge: g[6], description: g[7], isFeatured: true, inStock: true, isActive: true, sortOrder: index,
  }))).onConflictDoNothing();
}

async function getCanonicalPrice(title: string) {
  await seedGamesIfEmpty();
  const [row] = await db.select({ salePrice: games.salePrice }).from(games).where(and(eq(games.title, title), eq(games.isActive, true))).limit(1);
  return row ? money(row.salePrice) : null;
}

function parsePaymentText(text: string) {
  const isSuccess = [/payment\s+successful/i, /transaction\s+successful/i, /paid\s+successfully/i, /successfully\s+paid/i, /money\s+sent/i, /sent\s+successfully/i, /transfer\s+successful/i, /\bsuccess(?:ful)?\b/i, /\bcompleted?\b/i, /\bpaid\b/i].some((p) => p.test(text));
  const failedStatus = /\b(pending|processing|failed|cancelled|canceled)\b/i.test(text);
  let amount: number | null = null;
  for (const pattern of [/(?:₹|rs\.?|inr)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi, /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?|inr)/gi, /(?:amount|paid|total|deducted|debited)[:\s]+(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi]) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) {
      const parsed = money(match[1].replace(/,/g, ""));
      if (parsed > 0) { amount = parsed; break; }
    }
  }
  let transactionId: string | null = null;
  for (const pattern of [/(?:utr|upi\s*ref(?:erence)?(?:\s*no\.?)?|transaction\s*id|txn\s*(?:id)?|ref(?:erence)?\s*(?:no\.?|id)?|order\s*id)[:\s#-]*([A-Z0-9]{8,})/i, /\b([0-9]{10,16})\b/, /\b([A-Z]{2,6}[0-9]{6,})\b/]) {
    const match = text.match(pattern);
    if (match) { transactionId = match[1].toUpperCase(); break; }
  }
  const date = text.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})|(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:,?\s*\d{2,4})?)|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i)?.[0]?.trim() ?? null;
  const time = text.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/i)?.[1]?.trim() ?? null;
  const receiverName = text.match(/(?:to|paid to|recipient|merchant|payee)[:\s]+([A-Za-z][A-Za-z\s.]{2,40}?)(?:\n|\r|$|[,|])/im)?.[1]?.trim() ?? null;
  return { amount, transactionId, date, time, receiverName, isSuccess: isSuccess && !failedStatus, rawStatus: isSuccess && !failedStatus ? "Success" : failedStatus ? "Failed or pending" : "Unknown" };
}

function paymentDateIsTooOld(date: string | null, time: string | null) {
  if (!date || !time) return false;
  const parsed = Date.parse(`${date} ${time}`);
  if (Number.isNaN(parsed)) return false;
  return Date.now() - parsed > PAYMENT_MAX_AGE_MS || parsed - Date.now() > 10 * 60 * 1000;
}

function looksManipulated(file: File, text: string) {
  const reasons: string[] = [];
  if (file.size < 20_000) reasons.push("screenshot file is unusually small or cropped");
  if (!/(upi|transaction|payment|paid|success|utr|ref)/i.test(text)) reasons.push("payment UI details are missing");
  if (/(edited|photoshop|canva|pixellab|screenshot\s+editor)/i.test(text)) reasons.push("possible editor artifact detected");
  return reasons;
}

function signToken(payload: Record<string, unknown>) {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("SESSION_SECRET or ADMIN_PASSWORD is required");
  const jti = crypto.randomBytes(16).toString("hex");
  const data = JSON.stringify({ ...payload, issuedAt: Date.now(), jti });
  const sig = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ data, sig })).toString("base64");
}

async function consumeToken(token: string) {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  try {
    const { data, sig } = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(data);
    if (Date.now() - Number(parsed.issuedAt) > TOKEN_TTL_MS) return null;
    await db.insert(ocrTokenUses).values({ jti: parsed.jti, expiresAt: new Date(Number(parsed.issuedAt) + TOKEN_TTL_MS) });
    return parsed;
  } catch {
    return null;
  }
}

async function analyze(req: Request) {
  const form = await req.formData();
  const file = form.get("screenshot");
  const gameName = clean(form.get("game_name"), 255);
  if (!(file instanceof File)) return json({ error: "No screenshot uploaded" }, { status: 400 });
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return json({ error: "Only image files are allowed" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return json({ error: "Screenshot is too large" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const screenshotHash = crypto.createHash("sha256").update(buffer).digest("hex");
  const existingImage = await db.select({ id: orders.id }).from(orders).where(eq(orders.screenshotHash, screenshotHash)).limit(1);
  if (existingImage.length) {
    return json({ approved: false, verificationMode: "rejected", rejectionReason: "This payment screenshot was already submitted.", fraud_detected: true, reason: "Duplicate screenshot" }, { status: 409 });
  }

  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    worker = await createWorker("eng", 1, { logger: () => {} });
    const result = await worker.recognize(buffer);
    const text = result.data.text || "";
    await worker.terminate();
    worker = null;
    const parsed = parsePaymentText(text);
    const canonicalPrice = gameName ? await getCanonicalPrice(gameName) : null;
    const fraudReasons = looksManipulated(file, text);
    const missing = [];
    if (parsed.amount == null) missing.push("payment amount");
    if (!parsed.transactionId) missing.push("transaction ID");
    if (!parsed.date) missing.push("date");
    if (!parsed.time) missing.push("time");
    if (!parsed.isSuccess) missing.push("successful payment status");
    if (canonicalPrice != null && parsed.amount != null && Math.round(parsed.amount) !== Math.round(canonicalPrice)) missing.push("exact payment amount");
    if (paymentDateIsTooOld(parsed.date, parsed.time)) missing.push("valid recent payment timestamp");

    let verificationMode = "pending_review";
    let rejectionReason: string | null = null;
    if (missing.length || fraudReasons.length) {
      verificationMode = "rejected";
      rejectionReason = `Could not verify: ${[...missing, ...fraudReasons].join(", ")}`;
    } else {
      const duplicateTxn = await db.select({ id: orders.id }).from(orders).where(eq(orders.upiTransactionId, parsed.transactionId!)).limit(1);
      if (duplicateTxn.length) {
        verificationMode = "rejected";
        rejectionReason = "This transaction ID was already used.";
      }
    }

    const ocrToken = signToken({ verificationMode, gameName, screenshotHash, fileName: file.name, ...parsed });
    return json({
      approved: verificationMode !== "rejected",
      amount_detected: parsed.amount ?? "",
      transaction_id: parsed.transactionId ?? "",
      payment_date: parsed.date ?? "",
      payment_time: parsed.time ?? "",
      status: parsed.rawStatus,
      fraud_detected: fraudReasons.length > 0,
      reason: rejectionReason ?? "",
      verificationMode,
      rejectionReason,
      ocrToken,
      extracted: parsed,
    });
  } catch {
    if (worker) await worker.terminate().catch(() => {});
    return json({ error: "OCR analysis failed. Please try again." }, { status: 500 });
  }
}

async function createOrder(req: Request) {
  const body = await req.json();
  const gameName = clean(body.game_name, 255);
  const customerName = clean(body.customer_name, 255);
  const instagram = normalizeIg(body.instagram);
  const submittedAmount = money(body.amount);
  if (!gameName || !customerName || !instagram || !/^[a-zA-Z0-9._]{1,30}$/.test(instagram)) return json({ error: "Valid customer name, Instagram username, and game are required" }, { status: 400 });
  const expectedAmount = await getCanonicalPrice(gameName);
  if (expectedAmount != null && Math.round(submittedAmount) !== Math.round(expectedAmount)) return json({ error: "Incorrect payment amount. Please pay the exact amount shown for this game." }, { status: 400 });
  const verified = body.ocr_token ? await consumeToken(String(body.ocr_token)) : null;
  if (!verified) return json({ error: "Screenshot verification token is invalid, expired, or already used. Please re-upload your payment screenshot." }, { status: 400 });
  if (verified.gameName && verified.gameName !== gameName) return json({ error: "Screenshot verification does not match the selected game. Please re-upload." }, { status: 400 });
  if (verified.verificationMode === "rejected") return json({ error: "Screenshot verification failed. Please upload a clear successful payment screenshot with amount, date, time, and transaction ID." }, { status: 400 });

  const orderRef = `JG-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const status = "pending_review";
  try {
    const [row] = await db.insert(orders).values({
      orderRef, customerName, instagram, email: clean(body.email, 254) || null, telegram: normalizeIg(body.telegram) || null,
      gameName, expectedAmount: String(expectedAmount ?? submittedAmount), submittedAmount: String(submittedAmount),
      screenshotFile: clean(verified.fileName, 255) || null, screenshotHash: clean(verified.screenshotHash, 128) || null,
      steamUsername: clean(body.steam_username, 100) || null, steamPassword: clean(body.steam_password, 200) || null,
      paymentMethod: clean(body.payment_method, 30) || "upi", paymentStatus: status,
      upiTransactionId: clean(verified.transactionId, 80) || null, ocrAmount: verified.amount != null ? String(verified.amount) : null,
      ocrDate: clean(verified.date, 40) || null, ocrTime: clean(verified.time, 30) || null,
      ocrReceiver: clean(verified.receiverName, 255) || null, ocrRawStatus: clean(verified.rawStatus, 50) || null,
      verificationMode: "pending_review", verificationResult: "OCR passed, pending admin review", fraudDetected: false,
    }).returning();
    await db.insert(auditLogs).values({ orderId: row.id, orderRef, transactionId: row.upiTransactionId, customerName, verificationResult: "Pending Admin Review", details: "Payment screenshot passed automated checks and awaits owner approval." });
    return json({ order_db_id: row.id, order_ref: orderRef, status, verification_mode: "pending_review", message: "Order received. Our team will review the payment record shortly." });
  } catch (error: any) {
    if (String(error?.message || "").includes("duplicate")) return json({ error: "This payment proof has already been registered." }, { status: 409 });
    return json({ error: "Failed to submit order. Please try again or contact support." }, { status: 500 });
  }
}

function orderSelect() {
  return {
    id: orders.id, order_ref: orders.orderRef, customer_name: orders.customerName, instagram: orders.instagram, email: orders.email, telegram: orders.telegram,
    game_name: orders.gameName, game_price: orders.expectedAmount, expected_amount: orders.expectedAmount, submitted_amount: orders.submittedAmount,
    screenshot_file: orders.screenshotFile, payment_method: orders.paymentMethod, payment_status: orders.paymentStatus, failure_reason: orders.failureReason,
    upi_transaction_id: orders.upiTransactionId, ocr_amount: orders.ocrAmount, ocr_date: orders.ocrDate, ocr_time: orders.ocrTime,
    ocr_receiver: orders.ocrReceiver, ocr_raw_status: orders.ocrRawStatus, verification_mode: orders.verificationMode,
    created_at: orders.createdAt, submitted_at: orders.submittedAt, verified_at: orders.verifiedAt,
  };
}

async function adminOrders(req: Request) {
  const url = new URL(req.url);
  const status = clean(url.searchParams.get("status"), 50);
  const search = clean(url.searchParams.get("search"), 100);
  const limit = Math.min(Number(url.searchParams.get("limit") || 200), 500);
  const filters = [];
  if (status) filters.push(eq(orders.paymentStatus, status));
  if (search) filters.push(or(eq(orders.orderRef, search), eq(orders.upiTransactionId, search), ilike(orders.instagram, `%${search}%`), ilike(orders.customerName, `%${search}%`))!);
  const where = filters.length ? and(...filters) : undefined;
  const rows = where
    ? await db.select(orderSelect()).from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit)
    : await db.select(orderSelect()).from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  return json({ orders: rows, total: rows.length });
}

async function stats() {
  const rows = await db.select({ status: orders.paymentStatus, amount: orders.expectedAmount }).from(orders);
  const out: Record<string, string> = { verified: "0", approved: "0", auto_matched: "0", pending: "0", pending_review: "0", rejected: "0", failed: "0", total_revenue: "0", total_orders: String(rows.length) };
  let revenue = 0;
  for (const row of rows) {
    out[row.status] = String(Number(out[row.status] || 0) + 1);
    if (["approved", "verified"].includes(row.status)) revenue += money(row.amount);
  }
  out.verified = String(Number(out.verified) + Number(out.approved));
  out.total_revenue = String(revenue);
  return json(out);
}

async function updateOrder(req: Request, id: number, action: "approve" | "reject" | "delete") {
  if (action === "delete") {
    await db.delete(orders).where(eq(orders.id, id));
    return json({ success: true });
  }
  const body = req.method === "PATCH" ? await req.json().catch(() => ({})) : {};
  const status = action === "approve" ? "approved" : "rejected";
  const reason = action === "reject" ? clean(body.reason, 500) || "Rejected by admin" : null;
  const [row] = await db.update(orders).set({ paymentStatus: status, failureReason: reason, verifiedAt: new Date(), updatedAt: new Date(), verificationResult: action === "approve" ? "Approved by admin" : reason }).where(eq(orders.id, id)).returning();
  if (!row) return json({ error: "Order not found" }, { status: 404 });
  await db.insert(auditLogs).values({ orderId: row.id, orderRef: row.orderRef, transactionId: row.upiTransactionId, customerName: row.customerName, verificationResult: status, adminAction: action, details: reason });
  return json({ success: true, id: row.id, payment_status: status });
}

async function listGames(admin = false) {
  await seedGamesIfEmpty();
  const rows = admin
    ? await db.select().from(games).orderBy(games.sortOrder, games.id)
    : await db.select().from(games).where(and(eq(games.isActive, true), eq(games.inStock, true))).orderBy(games.sortOrder, games.id);
  return json(rows.map((g) => ({
    id: g.id, title: g.title, category: g.category, image_url: g.imageUrl, sale_price: g.salePrice, original_price: g.originalPrice,
    discount: g.discount, rating: g.rating, badge: g.badge, description: g.description, steam_url: g.steamUrl,
    is_featured: g.isFeatured, in_stock: g.inStock, is_active: g.isActive, sort_order: g.sortOrder, created_at: g.createdAt,
  })));
}

async function saveGame(req: Request, id?: number) {
  const body = await req.json();
  const sale = money(body.sale_price);
  const original = money(body.original_price || body.sale_price);
  if (!clean(body.title) || sale <= 0 || original <= 0) return json({ error: "Game title and prices are required" }, { status: 400 });
  const values = {
    title: clean(body.title), category: clean(body.category) || "Action", imageUrl: clean(body.image_url, 20000),
    salePrice: String(sale), originalPrice: String(original), discount: Number(body.discount ?? Math.max(0, Math.round((1 - sale / original) * 100))),
    rating: Math.min(5, Math.max(1, Number(body.rating || 5))), badge: clean(body.badge) || null, description: clean(body.description, 2000),
    steamUrl: clean(body.steam_url, 1000) || null, isFeatured: !!body.is_featured, inStock: body.in_stock !== false, isActive: body.is_active !== false,
    sortOrder: Number(body.sort_order || 0), updatedAt: new Date(),
  };
  const [row] = id ? await db.update(games).set(values).where(eq(games.id, id)).returning() : await db.insert(games).values(values).returning();
  return json(row, { status: id ? 200 : 201 });
}

export default async function handler(req: Request, context: Context) {
  const path = new URL(req.url).pathname.replace(/^\/api/, "");
  if (req.method === "GET" && path === "/games") return listGames(false);
  if (req.method === "POST" && path === "/ocr/analyze") return analyze(req);
  if (req.method === "POST" && path === "/orders/manual") return createOrder(req);
  if (req.method === "GET" && path === "/customer/orders") {
    const ig = normalizeIg(new URL(req.url).searchParams.get("instagram"));
    if (!ig) return json({ error: "Instagram username is required" }, { status: 400 });
    return json({ orders: await db.select(orderSelect()).from(orders).where(eq(orders.instagram, ig)).orderBy(desc(orders.createdAt)).limit(100) });
  }

  if (path.startsWith("/admin/")) {
    const auth = requireAdmin(req);
    if (!auth.ok) return auth.response;
    if (req.method === "GET" && path === "/admin/stats") return stats();
    if (req.method === "GET" && path === "/admin/orders") return adminOrders(req);
    const orderMatch = path.match(/^\/admin\/orders\/(\d+)(?:\/(verify|reject))?$/);
    if (orderMatch) {
      const id = Number(orderMatch[1]);
      if (req.method === "DELETE") return updateOrder(req, id, "delete");
      if (req.method === "PATCH" && orderMatch[2] === "verify") return updateOrder(req, id, "approve");
      if (req.method === "PATCH" && orderMatch[2] === "reject") return updateOrder(req, id, "reject");
    }
    if (req.method === "GET" && path === "/admin/games") return listGames(true);
    if (req.method === "POST" && path === "/admin/games") return saveGame(req);
    const gameMatch = path.match(/^\/admin\/games\/(\d+)$/);
    if (gameMatch && req.method === "PUT") return saveGame(req, Number(gameMatch[1]));
    if (gameMatch && req.method === "PATCH") {
      const body = await req.json();
      const [row] = await db.update(games).set({ isFeatured: body.is_featured, inStock: body.in_stock, isActive: body.is_active, updatedAt: new Date() }).where(eq(games.id, Number(gameMatch[1]))).returning();
      return row ? json(row) : json({ error: "Game not found" }, { status: 404 });
    }
    if (gameMatch && req.method === "DELETE") {
      await db.delete(games).where(eq(games.id, Number(gameMatch[1])));
      return json({ success: true });
    }
  }
  return json({ error: "Not found" }, { status: 404 });
}

export const config: Config = {
  path: "/api/*",
};
