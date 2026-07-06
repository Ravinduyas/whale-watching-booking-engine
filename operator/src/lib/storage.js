/* ─────────────────────────────────────────────────────────────
   STORAGE — bookings persist across sessions via localStorage,
   with an in-memory fallback. This is the single data seam:
   swap these functions for HTTP calls when a backend exists.
   ───────────────────────────────────────────────────────────── */
import { YACHTS, PRICE_PER_SEAT, cap } from "./config.js";

const KEY = "ww:bookings:v2";
let memStore = null;

// date string N days from today
const dayOffset = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

// `ctx` lets the operator build bookings against the CURRENT editable fleet /
// pricing (from settings) rather than the static defaults used for seeding.
export function mkBooking(b, ctx = {}) {
  const yachts = ctx.yachts || YACHTS;
  const pricePerSeat = ctx.pricePerSeat ?? PRICE_PER_SEAT;
  const y = yachts.find((x) => x.id === b.yachtId) || { charter: 0, rows: 0, cols: 0 };
  const seats = b.type === "charter" ? cap(y) : (b.seats && b.seats.length ? b.seats.length : b.groupSize || 1);
  const groupSize = b.type === "charter" ? (b.groupSize || cap(y)) : seats;
  const total = b.type === "charter" ? y.charter : seats * pricePerSeat;
  return {
    ref: b.ref || ("WW" + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(Math.random() * 90 + 10)),
    date: b.date, slot: b.slot, yachtId: b.yachtId, type: b.type,
    seats: b.seats || [], groupSize, total,
    customerName: b.customerName, phone: b.phone,
    channel: b.channel, agentName: b.agentName || "",
    status: b.status || "confirmed",
    createdAt: b.createdAt || Date.now(),
  };
}

function seed() {
  const d0 = dayOffset(0), d1 = dayOffset(1), d2 = dayOffset(2), d3 = dayOffset(3), dm1 = dayOffset(-1), dm2 = dayOffset(-2);
  return [
    // today
    mkBooking({ date: d0, slot: "0630", yachtId: "serenity", type: "seat", seats: ["A1", "A2", "A3", "B1", "B2"], customerName: "Perera Family", phone: "+94 77 123 4567", channel: "online" }),
    mkBooking({ date: d0, slot: "0630", yachtId: "serenity", type: "seat", seats: ["D4", "D5"], customerName: "J. Fernando", phone: "+94 71 998 2210", channel: "agent", agentName: "Lanka Tours" }),
    mkBooking({ date: d0, slot: "0930", yachtId: "marina", type: "charter", groupSize: 40, customerName: "Sunset Resort Group", phone: "+94 76 540 1188", channel: "agent", agentName: "Sunset Resort" }),
    mkBooking({ date: d0, slot: "0630", yachtId: "voyager", type: "seat", seats: ["A1", "A2", "B1", "C3", "D2", "D3"], customerName: "Müller & friends", phone: "+49 152 22119", channel: "online" }),
    mkBooking({ date: d0, slot: "0930", yachtId: "serenity", type: "seat", seats: ["A1", "A2"], customerName: "Silva Couple", phone: "+94 70 445 1200", channel: "online" }),
    // tomorrow
    mkBooking({ date: d1, slot: "0630", yachtId: "serenity", type: "charter", groupSize: 44, customerName: "Ceylon Roots Retreat", phone: "+94 76 220 9911", channel: "agent", agentName: "Ceylon Roots" }),
    mkBooking({ date: d1, slot: "0930", yachtId: "voyager", type: "seat", seats: ["A1", "A2", "A3", "B1"], customerName: "The Nguyen Party", phone: "+84 90 112 3344", channel: "online" }),
    mkBooking({ date: d1, slot: "0930", yachtId: "marina", type: "seat", seats: ["C1", "C2", "C3", "C4"], customerName: "Wickramasinghe", phone: "+94 77 651 2098", channel: "agent", agentName: "Blue Ocean Travels" }),
    // in two days
    mkBooking({ date: d2, slot: "0630", yachtId: "marina", type: "seat", seats: ["A1", "A2", "A3", "A4", "A5", "A6"], customerName: "Tanaka Group", phone: "+81 80 3312 7788", channel: "agent", agentName: "Global Getaways" }),
    mkBooking({ date: d2, slot: "0630", yachtId: "voyager", type: "charter", groupSize: 30, customerName: "Bright Star School Trip", phone: "+94 71 300 5566", channel: "agent", agentName: "Lanka Tours" }),
    mkBooking({ date: d2, slot: "0930", yachtId: "serenity", type: "seat", seats: ["B3", "B4"], customerName: "A. Bandara", phone: "+94 78 909 1123", channel: "online" }),
    // in three days
    mkBooking({ date: d3, slot: "0630", yachtId: "serenity", type: "seat", seats: ["A1", "A2", "A3"], customerName: "Rossi Family", phone: "+39 340 556 7788", channel: "online" }),
    mkBooking({ date: d3, slot: "0930", yachtId: "marina", type: "seat", seats: ["A1", "A2"], customerName: "K. Jayasuriya", phone: "+94 77 222 8890", channel: "online" }),
    // history
    mkBooking({ date: dm1, slot: "0630", yachtId: "marina", type: "charter", groupSize: 48, customerName: "Horizon Cruises", phone: "+94 76 118 4400", channel: "agent", agentName: "Sunset Resort" }),
    mkBooking({ date: dm1, slot: "0930", yachtId: "serenity", type: "seat", seats: ["A1", "A2", "A3", "A4"], customerName: "Dias Family", phone: "+94 70 771 3322", channel: "online" }),
    mkBooking({ date: dm2, slot: "0630", yachtId: "voyager", type: "seat", seats: ["A1", "A2", "A3", "B1", "B2"], customerName: "Smith & Co.", phone: "+44 7700 900123", channel: "online" }),
    // cancelled examples
    mkBooking({ date: d1, slot: "0630", yachtId: "marina", type: "seat", seats: ["F1", "F2"], customerName: "Weather hold — Khan", phone: "+94 77 000 0000", channel: "online", status: "cancelled" }),
    mkBooking({ date: d0, slot: "0930", yachtId: "voyager", type: "seat", seats: ["L1", "L2"], customerName: "No-show — Gupta", phone: "+91 98 7654 3210", channel: "agent", agentName: "Global Getaways", status: "cancelled" }),
  ];
}

export async function loadBookings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* not found or unavailable */ }
  const s = seed();
  await saveBookings(s);
  return s;
}

export async function saveBookings(list) {
  memStore = list;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* memory fallback */ }
}

// Wipe stored bookings and regenerate the demo seed.
export async function resetBookings() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  return loadBookings();
}
