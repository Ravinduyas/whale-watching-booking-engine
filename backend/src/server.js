import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { getDb } from "./db.js";
import { defaultSettings, seedBookings, mkBooking, computeAvailability, publicSettings } from "./domain.js";

const app = express();
app.use(cors());
app.use(express.json());

// in-memory session tokens (cleared on restart — staff re-login)
const tokens = new Set();

function auth(req, res, next) {
  const t = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (t && tokens.has(t)) return next();
  return res.status(401).json({ error: "unauthorized" });
}

// Ensure the settings doc + demo bookings exist; returns settings.
async function ensureSeed(db) {
  const settingsCol = db.collection("settings");
  let s = await settingsCol.findOne({ _id: "app" });
  if (!s) {
    s = { _id: "app", ...defaultSettings() };
    await settingsCol.insertOne(s);
  }
  const bookingsCol = db.collection("bookings");
  if ((await bookingsCol.countDocuments()) === 0) {
    const seed = seedBookings(s);
    if (seed.length) await bookingsCol.insertMany(seed);
  }
  return s;
}

const getSettings = async (db) => db.collection("settings").findOne({ _id: "app" });
const listBookings = async (db) => db.collection("bookings").find({}, { projection: { _id: 0 } }).toArray();

/* ── auth ── */
app.post("/api/auth/login", async (req, res) => {
  const db = await getDb();
  const s = await getSettings(db);
  const { user, password } = req.body || {};
  if (s && (user || "").trim() === s.user && password === s.password) {
    const token = crypto.randomBytes(24).toString("hex");
    tokens.add(token);
    return res.json({ token });
  }
  return res.status(401).json({ error: "invalid credentials" });
});

/* ── settings ── */
app.get("/api/settings/public", async (req, res) => {
  const s = await getSettings(await getDb());
  res.json(publicSettings(s));
});

app.get("/api/settings", auth, async (req, res) => {
  const s = await getSettings(await getDb());
  const { _id, ...rest } = s;
  res.json(rest);
});

app.put("/api/settings", auth, async (req, res) => {
  const db = await getDb();
  const { _id, ...incoming } = req.body || {};
  await db.collection("settings").updateOne({ _id: "app" }, { $set: incoming }, { upsert: true });
  const s = await getSettings(db);
  const { _id: __, ...rest } = s;
  res.json(rest);
});

/* ── bookings ── */
app.get("/api/bookings", auth, async (req, res) => {
  res.json(await listBookings(await getDb()));
});

app.get("/api/availability", async (req, res) => {
  const db = await getDb();
  const s = await getSettings(db);
  const bookings = await listBookings(db);
  const { date, slot } = req.query;
  res.json(computeAvailability(bookings, s, date, slot));
});

// public: customers book here; operator also uses it for manual bookings
app.post("/api/bookings", async (req, res) => {
  const db = await getDb();
  const s = await getSettings(db);
  const booking = mkBooking(req.body || {}, s);
  await db.collection("bookings").insertOne({ ...booking });
  res.status(201).json(booking);
});

app.patch("/api/bookings/:ref", auth, async (req, res) => {
  const db = await getDb();
  const { _id, ref, ...patch } = req.body || {};
  await db.collection("bookings").updateOne({ ref: req.params.ref }, { $set: patch });
  const updated = await db.collection("bookings").findOne({ ref: req.params.ref }, { projection: { _id: 0 } });
  res.json(updated);
});

app.delete("/api/bookings/:ref", auth, async (req, res) => {
  const db = await getDb();
  await db.collection("bookings").deleteOne({ ref: req.params.ref });
  res.json({ ok: true });
});

app.delete("/api/bookings", auth, async (req, res) => {
  const db = await getDb();
  await db.collection("bookings").deleteMany({});
  res.json({ ok: true });
});

app.post("/api/bookings/reset", auth, async (req, res) => {
  const db = await getDb();
  const s = await getSettings(db);
  await db.collection("bookings").deleteMany({});
  const seed = seedBookings(s);
  if (seed.length) await db.collection("bookings").insertMany(seed.map((b) => ({ ...b })));
  res.json(await listBookings(db));
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

getDb()
  .then((db) => ensureSeed(db))
  .then(() => app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("[api] failed to start:", err.message);
    process.exit(1);
  });
