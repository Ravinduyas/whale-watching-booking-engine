/* ─────────────────────────────────────────────────────────────
   OPERATOR SETTINGS — the editable control surface for the whole
   system: fleet, departure schedule, pricing, business info and the
   staff login. Persisted to localStorage, seeded from config defaults.
   ───────────────────────────────────────────────────────────── */
import { YACHTS, SLOTS, PRICE_PER_SEAT, CURRENCY, OPERATOR, OPERATOR_USER, OPERATOR_PASSWORD } from "./config.js";

const KEY = "ww:settings:v1";
const clone = (v) => JSON.parse(JSON.stringify(v));
const dayOffset = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export function defaultSettings() {
  return {
    operatorName: OPERATOR,
    tagline: "Operator dashboard · staff only",
    currency: CURRENCY,
    pricePerSeat: PRICE_PER_SEAT,
    yachts: clone(YACHTS),
    slots: clone(SLOTS),
    closedDates: [dayOffset(5), dayOffset(11)],
    user: OPERATOR_USER,
    password: OPERATOR_PASSWORD,
  };
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return defaultSettings();
}

export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
}

// Build a currency formatter for a given settings object.
export const makeMoney = (currency) => (n) => currency + Number(n).toLocaleString();

// slugify a yacht/slot name into a stable-ish id
export const slugId = (name) =>
  (name || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 24) +
  "-" + Math.random().toString(36).slice(2, 5);
