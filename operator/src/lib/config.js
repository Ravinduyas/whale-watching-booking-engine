/* ─────────────────────────────────────────────────────────────
   CONFIG — change these to match your real operation.
   Shared by both the booking engine and the operator dashboard.
   ───────────────────────────────────────────────────────────── */
export const CURRENCY = "Rs ";          // e.g. "Rs ", "$", "€"
export const PRICE_PER_SEAT = 995;      // per-seat price
export const OPERATOR = "Ocean Drift Whale Watching";

// Operator dashboard login (demo). Swap these for real auth before production —
// this is a client-side gate only, not real security.
export const OPERATOR_USER = "operator";
export const OPERATOR_PASSWORD = "whales123";
export const AUTH_KEY = "ww:auth:v1";

// 3 yachts: 2 wide + 1 long. Wide = short & fat grid, Long = tall & narrow grid.
// `charter` = flat whole-boat price (edit these to your real charter rates).
export const YACHTS = [
  { id: "serenity", name: "Serenity",  type: "wide", rows: 8,  cols: 6, charter: 42000 }, // 48 seats
  { id: "marina",   name: "Marina",    type: "wide", rows: 8,  cols: 6, charter: 42000 }, // 48 seats
  { id: "voyager",  name: "Voyager",   type: "long", rows: 12, cols: 3, charter: 32000 }, // 36 seats
];

export const SLOTS = [
  { id: "0630", label: "6:30 AM", tag: "Sunrise" },
  { id: "0930", label: "9:30 AM", tag: "Morning" },
];

export const cap = (y) => y.rows * y.cols;
export const money = (n) => CURRENCY + Number(n).toLocaleString();
export const todayStr = () => new Date().toISOString().slice(0, 10);
