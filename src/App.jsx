// Aesthetic: Luxury Coastal — deep-ocean teal base, sunrise coral/amber accent (for "morning only" tours),
// elegant Fraunces display + clean Outfit body. Built for a Sri Lankan whale-watching operator.

import { useState, useEffect, useMemo } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   CONFIG — change these to match your real operation
   ───────────────────────────────────────────────────────────── */
const CURRENCY = "Rs ";          // e.g. "Rs ", "$", "€"
const PRICE_PER_SEAT = 995;      // per-seat price
const OPERATOR = "Ocean Drift Whale Watching";

// Operator dashboard login (demo). Swap these for real auth before production —
// this is a client-side gate only, not real security.
const OPERATOR_USER = "operator";
const OPERATOR_PASSWORD = "whales123";
const AUTH_KEY = "ww:auth:v1";

// 3 yachts: 2 wide + 1 long. Wide = short & fat grid, Long = tall & narrow grid.
// `charter` = flat whole-boat price (edit these to your real charter rates).
const YACHTS = [
  { id: "serenity", name: "Serenity",  type: "wide", rows: 8,  cols: 6, charter: 42000 }, // 48 seats
  { id: "marina",   name: "Marina",    type: "wide", rows: 8,  cols: 6, charter: 42000 }, // 48 seats
  { id: "voyager",  name: "Voyager",   type: "long", rows: 12, cols: 3, charter: 32000 }, // 36 seats
];

const SLOTS = [
  { id: "0630", label: "6:30 AM", tag: "Sunrise" },
  { id: "0930", label: "9:30 AM", tag: "Morning" },
];

const cap = (y) => y.rows * y.cols;
const money = (n) => CURRENCY + Number(n).toLocaleString();
const todayStr = () => new Date().toISOString().slice(0, 10);

/* ─────────────────────────────────────────────────────────────
   STORAGE (persists across sessions via localStorage; falls back to memory)
   ───────────────────────────────────────────────────────────── */
const KEY = "ww:bookings:v1";
let memStore = null;

function seed() {
  const d = todayStr();
  return [
    mkBooking({ date: d, slot: "0630", yachtId: "serenity", type: "seat", seats: ["A1","A2","A3","B1","B2"], customerName: "Perera Family", phone: "+94 77 123 4567", channel: "online" }),
    mkBooking({ date: d, slot: "0630", yachtId: "serenity", type: "seat", seats: ["D4","D5"], customerName: "J. Fernando", phone: "+94 71 998 2210", channel: "agent", agentName: "Lanka Tours" }),
    mkBooking({ date: d, slot: "0930", yachtId: "marina", type: "charter", groupSize: 40, customerName: "Sunset Resort Group", phone: "+94 76 540 1188", channel: "agent", agentName: "Sunset Resort" }),
    mkBooking({ date: d, slot: "0630", yachtId: "voyager", type: "seat", seats: ["A1","A2","B1","C3","D2","D3"], customerName: "Müller & friends", phone: "+49 152 22119", channel: "online" }),
  ];
}

function mkBooking(b) {
  const y = YACHTS.find((x) => x.id === b.yachtId);
  const seats = b.type === "charter" ? cap(y) : (b.seats ? b.seats.length : b.groupSize || 1);
  const groupSize = b.type === "charter" ? (b.groupSize || cap(y)) : seats;
  const total = b.type === "charter" ? y.charter : seats * PRICE_PER_SEAT;
  return {
    ref: b.ref || ("WW" + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(Math.random()*90+10)),
    date: b.date, slot: b.slot, yachtId: b.yachtId, type: b.type,
    seats: b.seats || [], groupSize, total,
    customerName: b.customerName, phone: b.phone,
    channel: b.channel, agentName: b.agentName || "",
    status: b.status || "confirmed",
    createdAt: b.createdAt || Date.now(),
  };
}

async function loadBookings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* not found or unavailable */ }
  const s = seed();
  await saveBookings(s);
  return s;
}
async function saveBookings(list) {
  memStore = list;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* memory fallback */ }
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function App() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(memStore || []);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(() => {
    try { return localStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return false; }
  });

  // booking flow state
  const [date, setDate] = useState(todayStr());
  const [slot, setSlot] = useState("0630");
  const [yachtId, setYachtId] = useState(null);
  const [mode, setMode] = useState("seat"); // 'seat' | 'charter'
  const [picked, setPicked] = useState([]);
  const [charterSize, setCharterSize] = useState(2);
  const [cust, setCust] = useState({ name: "", phone: "", channel: "online", agentName: "" });
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    loadBookings().then((b) => { setBookings(b); setReady(true); });
  }, []);

  const yacht = YACHTS.find((y) => y.id === yachtId) || null;

  // availability for a given yacht at current date/slot
  const availFor = (yId) => {
    const y = YACHTS.find((x) => x.id === yId);
    const rel = bookings.filter((b) => b.status === "confirmed" && b.date === date && b.slot === slot && b.yachtId === yId);
    const chartered = rel.some((b) => b.type === "charter");
    const taken = new Set();
    rel.forEach((b) => (b.seats || []).forEach((s) => taken.add(s)));
    const remaining = chartered ? 0 : cap(y) - taken.size;
    return { chartered, taken, remaining };
  };

  const seatIds = (y) => {
    const ids = [];
    for (let r = 0; r < y.rows; r++) {
      const L = String.fromCharCode(65 + r);
      for (let c = 1; c <= y.cols; c++) ids.push(L + c);
    }
    return ids;
  };

  // reset picks when context changes
  useEffect(() => { setPicked([]); }, [yachtId, date, slot, mode]);

  const total = useMemo(() => {
    if (!yacht) return 0;
    if (mode === "charter") return yacht.charter;
    return picked.length * PRICE_PER_SEAT;
  }, [yacht, mode, picked]);

  const canConfirm = () => {
    if (!yacht || !cust.name.trim() || !cust.phone.trim()) return false;
    if (cust.channel === "agent" && !cust.agentName.trim()) return false;
    if (mode === "seat") return picked.length > 0;
    return charterSize >= 1 && charterSize <= cap(yacht);
  };

  async function confirmBooking() {
    const b = mkBooking({
      date, slot, yachtId, type: mode,
      seats: mode === "seat" ? picked : [],
      groupSize: mode === "charter" ? charterSize : picked.length,
      customerName: cust.name.trim(), phone: cust.phone.trim(),
      channel: cust.channel, agentName: cust.agentName.trim(),
    });
    const next = [...bookings, b];
    setBookings(next);
    await saveBookings(next);
    setConfirmation(b);
  }

  function resetFlow() {
    setConfirmation(null);
    setYachtId(null); setMode("seat"); setPicked([]); setCharterSize(2);
    setCust({ name: "", phone: "", channel: "online", agentName: "" });
  }

  async function cancelBooking(ref) {
    const next = bookings.map((b) => (b.ref === ref ? { ...b, status: "cancelled" } : b));
    setBookings(next);
    await saveBookings(next);
  }

  function login(u, p) {
    if (u.trim() === OPERATOR_USER && p === OPERATOR_PASSWORD) {
      setAuthed(true);
      try { localStorage.setItem(AUTH_KEY, "1"); } catch (e) { /* ignore */ }
      return true;
    }
    return false;
  }
  function logout() {
    setAuthed(false);
    try { localStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ }
    navigate("/");
  }

  /* ── styles ── */
  const S = {
    page: { minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Outfit', sans-serif" },
    wrap: { maxWidth: 1080, margin: "0 auto", padding: "0 20px 80px" },
    card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Outfit:wght@300;400;500;600;700&display=swap');
        :root{
          --bg:#06202b; --surface:#0d3142; --surface2:#114a5e; --border:rgba(255,255,255,.10);
          --line:rgba(255,255,255,.06); --text:#eaf6f8; --muted:rgba(234,246,248,.58);
          --teal:#34d8c4; --coral:#ff8a5b; --amber:#ffc15e; --good:#4ade80; --bad:#fb7185;
          --sun:linear-gradient(135deg,#ffc15e,#ff7a59);
        }
        *{box-sizing:border-box} body{margin:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .fu{animation:fadeUp .55s ease both}
        .display{font-family:'Fraunces',serif}
        .pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:5px 11px;border-radius:999px}
        .seat{width:30px;height:30px;border-radius:8px 8px 7px 7px;border:1px solid var(--line);
          background:var(--surface2);cursor:pointer;transition:transform .12s,background .15s,box-shadow .15s;
          font-size:9px;color:var(--muted);display:flex;align-items:center;justify-content:center}
        .seat:hover:not(.taken){transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.35)}
        .seat.sel{background:var(--sun);color:#3a1d00;border-color:transparent;font-weight:600}
        .seat.taken{background:rgba(255,255,255,.04);cursor:not-allowed;opacity:.45;color:transparent}
        .ycard{transition:transform .15s,border-color .15s,box-shadow .15s;cursor:pointer}
        .ycard:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,0,0,.35)}
        .btn{font-family:inherit;font-size:15px;font-weight:600;border:none;border-radius:12px;
          padding:14px 18px;cursor:pointer;transition:transform .12s,opacity .15s}
        .btn:active{transform:scale(.98)}
        .btn-primary{background:var(--sun);color:#3a1d00}
        .btn-primary:disabled{opacity:.4;cursor:not-allowed}
        .btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border)}
        .inp{width:100%;font-family:inherit;font-size:15px;background:var(--bg);color:var(--text);
          border:1px solid var(--border);border-radius:11px;padding:12px 14px;outline:none}
        .inp:focus{border-color:var(--teal)}
        .seg{display:flex;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:4px;gap:4px}
        .seg button{flex:1;border:none;background:transparent;color:var(--muted);font-family:inherit;
          font-size:14px;font-weight:600;padding:10px;border-radius:9px;cursor:pointer;transition:.15s}
        .seg button.on{background:var(--surface2);color:var(--text)}
        .navlink{background:none;border:none;color:var(--muted);font-family:inherit;font-size:15px;
          font-weight:600;cursor:pointer;padding:8px 4px;border-bottom:2px solid transparent;
          text-decoration:none;display:inline-block}
        .navlink.on{color:var(--text);border-color:var(--coral)}
        .label{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:9px;font-weight:600}
        a{color:var(--teal)}
        @media(max-width:760px){.hide-sm{display:none}}
      `}</style>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(180deg,#0a2c3a,transparent)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ ...S.wrap, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--sun)", display: "grid", placeItems: "center", fontSize: 20 }}>🐋</div>
            <div>
              <div className="display" style={{ fontSize: 19, lineHeight: 1.1 }}>{OPERATOR}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Morning whale-watching tours · Mirissa coast</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <NavLink to="/" end className={({ isActive }) => `navlink ${isActive ? "on" : ""}`}>Book a tour</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `navlink ${isActive ? "on" : ""}`}>Operator dashboard</NavLink>
            {authed && (
              <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={logout}>Log out</button>
            )}
          </nav>
        </div>
      </header>

      <main style={S.wrap}>
        {!ready ? (
          <p style={{ color: "var(--muted)", marginTop: 40 }}>Loading bookings…</p>
        ) : (
          <Routes>
            <Route path="/" element={
              <BookFlow {...{ S, date, setDate, slot, setSlot, yachtId, setYachtId, yacht, mode, setMode, picked, setPicked, charterSize, setCharterSize, cust, setCust, total, availFor, seatIds, canConfirm, confirmBooking }} />
            } />
            <Route path="/login" element={<Login S={S} authed={authed} onLogin={login} />} />
            <Route path="/dashboard" element={
              <RequireAuth authed={authed}>
                <Dashboard {...{ S, bookings, date, setDate, slot, setSlot, availFor, cancelBooking }} />
              </RequireAuth>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      {/* CONFIRMATION MODAL — replaces manual WhatsApp confirmation */}
      {confirmation && (
        <div onClick={resetFlow} style={{ position: "fixed", inset: 0, background: "rgba(3,16,22,.7)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }}>
          <div className="fu" onClick={(e) => e.stopPropagation()} style={{ ...S.card, maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 46 }}>✅</div>
            <h2 className="display" style={{ fontSize: 26, margin: "8px 0 4px" }}>Booking confirmed</h2>
            <p style={{ color: "var(--muted)", marginTop: 0 }}>Instant confirmation — no manual follow-up needed.</p>
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, margin: "16px 0", textAlign: "left" }}>
              <Row k="Reference" v={confirmation.ref} mono />
              <Row k="Yacht" v={YACHTS.find((y) => y.id === confirmation.yachtId).name} />
              <Row k="Date / time" v={`${confirmation.date} · ${SLOTS.find((s) => s.id === confirmation.slot).label}`} />
              <Row k="Type" v={confirmation.type === "charter" ? `Full yacht charter (${confirmation.groupSize} pax)` : `${confirmation.seats.length} seat(s): ${confirmation.seats.join(", ")}`} />
              <Row k="Channel" v={confirmation.channel === "agent" ? `Travel agent · ${confirmation.agentName}` : "Online"} />
              <Row k="Total" v={money(confirmation.total)} bold />
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={resetFlow}>New booking</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── BOOKING FLOW ─────────────── */
function BookFlow(props) {
  const { S, date, setDate, slot, setSlot, yachtId, setYachtId, yacht, mode, setMode,
    picked, setPicked, charterSize, setCharterSize, cust, setCust, total, availFor, seatIds, canConfirm, confirmBooking } = props;
  const [step, setStep] = useState(1);

  const toggleSeat = (id, taken) => {
    if (taken) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const steps = [
    { n: 1, label: "Date & departure" },
    { n: 2, label: "Choose your yacht" },
    { n: 3, label: "How to book" },
    { n: 4, label: "Lead guest" },
  ];
  // whether the CURRENT step has enough input to move on
  const stepValid = (s) => {
    if (s === 1) return true;
    if (s === 2) return !!yacht;
    if (s === 3) return mode === "seat" ? picked.length > 0 : (charterSize >= 1 && charterSize <= cap(yacht));
    if (s === 4) return canConfirm();
    return false;
  };
  const canNext = stepValid(step);
  const goNext = () => { if (canNext) setStep((s) => Math.min(4, s + 1)); };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="fu" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 22, marginTop: 26, alignItems: "start" }}>
      <div style={{ display: "grid", gap: 18 }}>
        {/* STEP INDICATOR */}
        <div style={{ display: "flex", gap: 8 }}>
          {steps.map((st) => {
            const active = step === st.n;
            const done = st.n < step;
            const reachable = st.n <= step; // can jump back to visited steps
            return (
              <button key={st.n} onClick={() => reachable && setStep(st.n)}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, cursor: reachable ? "pointer" : "not-allowed",
                  background: active ? "var(--surface2)" : "var(--surface)", border: "1px solid",
                  borderColor: active ? "var(--coral)" : "var(--border)", borderRadius: 12, padding: "10px 12px",
                  color: active ? "var(--text)" : "var(--muted)", fontFamily: "inherit", textAlign: "left" }}>
                <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                  background: active ? "var(--sun)" : done ? "rgba(74,222,128,.18)" : "var(--bg)",
                  color: active ? "#3a1d00" : done ? "var(--good)" : "var(--muted)" }}>{done ? "✓" : st.n}</span>
                <span className="hide-sm" style={{ fontSize: 13, fontWeight: 600 }}>{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* CURRENT STEP — one "window" at a time */}
        <section style={S.card} className="fu" key={step}>
          {/* 1. Date + morning slot */}
          {step === 1 && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                <span className="display" style={{ fontSize: 19 }}>1 · Date & departure</span>
                <span className="pill" style={{ background: "rgba(255,193,94,.15)", color: "var(--amber)" }}>☀ Morning only</span>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 180px" }}>
                  <div className="label">Tour date</div>
                  <input className="inp" type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div style={{ flex: "1 1 240px" }}>
                  <div className="label">Departure</div>
                  <div className="seg">
                    {SLOTS.map((s) => (
                      <button key={s.id} className={slot === s.id ? "on" : ""} onClick={() => setSlot(s.id)}>
                        {s.label} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {s.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Choose yacht */}
          {step === 2 && (
            <div>
              <div className="display" style={{ fontSize: 19, marginBottom: 14 }}>2 · Choose your yacht</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
                {YACHTS.map((y) => {
                  const a = availFor(y.id);
                  const sel = yachtId === y.id;
                  const full = a.remaining === 0;
                  return (
                    <div key={y.id} className="ycard" onClick={() => !full && setYachtId(y.id)}
                      style={{ ...S.card, padding: 16, borderColor: sel ? "var(--coral)" : "var(--border)", opacity: full ? 0.55 : 1, cursor: full ? "not-allowed" : "pointer", background: sel ? "var(--surface2)" : "var(--surface)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="display" style={{ fontSize: 18 }}>{y.name}</span>
                        <span className="pill" style={{ background: "rgba(52,216,196,.13)", color: "var(--teal)" }}>{y.type === "wide" ? "Wide hull" : "Long hull"}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{cap(y)} seats · {y.rows}×{y.cols}</div>
                      <div style={{ fontSize: 14, marginTop: 6, color: full ? "var(--bad)" : "var(--good)", fontWeight: 600 }}>
                        {a.chartered ? "Chartered" : full ? "Sold out" : `${a.remaining} seats left`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Mode + seats/charter */}
          {step === 3 && yacht && (
            <div>
              <div className="display" style={{ fontSize: 19, marginBottom: 14 }}>3 · How would you like to book?</div>
              <div className="seg" style={{ maxWidth: 420, marginBottom: 14 }}>
                <button className={mode === "seat" ? "on" : ""} onClick={() => setMode("seat")}>Individual seats</button>
                <button className={mode === "charter" ? "on" : ""} onClick={() => setMode("charter")}>Full yacht charter</button>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
                {mode === "seat"
                  ? <>Price: <strong style={{ color: "var(--text)" }}>{money(PRICE_PER_SEAT)}</strong> per seat</>
                  : <>Flat charter: <strong style={{ color: "var(--text)" }}>{money(yacht.charter)}</strong> for the whole {yacht.name} — any group size up to {cap(yacht)}</>}
              </div>

              {mode === "seat" ? (
                <SeatMap yacht={yacht} avail={availFor(yacht.id)} picked={picked} toggle={toggleSeat} seatIds={seatIds} />
              ) : (
                <div>
                  <div className="label">Group size (full charter — books the entire {yacht.name})</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setCharterSize((n) => Math.max(1, n - 1))}>–</button>
                    <span style={{ fontSize: 22, fontWeight: 700, minWidth: 40, textAlign: "center" }}>{charterSize}</span>
                    <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setCharterSize((n) => Math.min(cap(yacht), n + 1))}>+</button>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>of {cap(yacht)} max · whole boat reserved</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Details + channel */}
          {step === 4 && yacht && (
            <div>
              <div className="display" style={{ fontSize: 19, marginBottom: 14 }}>4 · Lead guest & booking channel</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "span 1" }}>
                  <div className="label">Name</div>
                  <input className="inp" placeholder="Guest / group name" value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} />
                </div>
                <div>
                  <div className="label">Phone / WhatsApp</div>
                  <input className="inp" placeholder="+94 …" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} />
                </div>
                <div>
                  <div className="label">Channel</div>
                  <div className="seg">
                    <button className={cust.channel === "online" ? "on" : ""} onClick={() => setCust({ ...cust, channel: "online" })}>Online</button>
                    <button className={cust.channel === "agent" ? "on" : ""} onClick={() => setCust({ ...cust, channel: "agent" })}>Travel agent</button>
                  </div>
                </div>
                {cust.channel === "agent" && (
                  <div>
                    <div className="label">Agent / partner name</div>
                    <input className="inp" placeholder="e.g. Lanka Tours" value={cust.agentName} onChange={(e) => setCust({ ...cust, agentName: e.target.value })} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NAV — Back / Next, or Confirm on the last step */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 22, borderTop: "1px solid var(--line)", paddingTop: 18 }}>
            <button className="btn btn-ghost" style={{ visibility: step === 1 ? "hidden" : "visible" }} onClick={goBack}>← Back</button>
            {step < 4 ? (
              <button className="btn btn-primary" disabled={!canNext} onClick={goNext}>Next →</button>
            ) : (
              <button className="btn btn-primary" disabled={!canConfirm()} onClick={confirmBooking}>Confirm & auto-notify</button>
            )}
          </div>
        </section>
      </div>

      {/* SUMMARY */}
      <aside style={{ ...S.card, position: "sticky", top: 18 }}>
        <div className="label">Booking summary</div>
        <Row k="Date" v={date} />
        <Row k="Departure" v={SLOTS.find((s) => s.id === slot).label} />
        <Row k="Yacht" v={yacht ? yacht.name : "—"} />
        <Row k="Type" v={!yacht ? "—" : mode === "charter" ? "Full charter" : "Seats"} />
        <Row k="Guests" v={!yacht ? "—" : mode === "charter" ? charterSize : picked.length} />
        {mode === "seat" && picked.length > 0 && (
          <div style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 8px" }}>{picked.join(", ")}</div>
        )}
        <div style={{ borderTop: "1px solid var(--line)", margin: "12px 0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: "var(--muted)" }}>Total</span>
          <span className="display" style={{ fontSize: 26 }}>{money(total)}</span>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "center", marginBottom: 0 }}>
          Step {step} of 4 · complete each step to confirm
        </p>
      </aside>
    </div>
  );
}

function SeatMap({ yacht, avail, picked, toggle, seatIds }) {
  const ids = seatIds(yacht);
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
        <Legend c="var(--surface2)" t="Available" />
        <Legend grad t="Selected" />
        <Legend c="rgba(255,255,255,.06)" t="Booked" />
      </div>
      <div style={{ display: "inline-block", padding: "10px 14px 16px", border: "1px solid var(--line)", borderRadius: "40px 40px 14px 14px", background: "rgba(0,0,0,.15)" }}>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginBottom: 10, letterSpacing: ".15em" }}>▲ BOW (front)</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${yacht.cols}, 30px)`, gap: 7, justifyContent: "center" }}>
          {ids.map((id) => {
            const taken = avail.taken.has(id) || avail.chartered;
            const sel = picked.includes(id);
            return (
              <div key={id} className={`seat ${sel ? "sel" : ""} ${taken ? "taken" : ""}`} onClick={() => toggle(id, taken)} title={id}>{id}</div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 10, letterSpacing: ".15em" }}>STERN ▼</div>
      </div>
    </div>
  );
}

/* ─────────────── DASHBOARD ─────────────── */
function Dashboard({ S, bookings, date, setDate, slot, setSlot, availFor, cancelBooking }) {
  const active = bookings.filter((b) => b.status === "confirmed");
  const dayB = active.filter((b) => b.date === date);

  const seatsSold = dayB.reduce((n, b) => n + (b.type === "charter" ? b.groupSize : b.seats.length), 0);
  const revenue = dayB.reduce((n, b) => n + b.total, 0);
  const online = dayB.filter((b) => b.channel === "online").length;
  const agent = dayB.filter((b) => b.channel === "agent").length;
  const tot = dayB.length || 1;
  const pct = (n) => Math.round((n / tot) * 100);

  return (
    <div className="fu" style={{ marginTop: 26, display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input className="inp" style={{ width: 180 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <span style={{ color: "var(--muted)", fontSize: 14 }}>Showing all departures for this date</span>
      </div>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        <Stat label="Bookings" value={dayB.length} />
        <Stat label="Guests booked" value={seatsSold} />
        <Stat label="Revenue" value={money(revenue)} />
        <Stat label="Online / Agent" value={`${pct(online)}% / ${pct(agent)}%`} sub={`${online} online · ${agent} agent`} />
      </div>

      {/* occupancy per yacht */}
      <section style={S.card}>
        <div className="display" style={{ fontSize: 19, marginBottom: 14 }}>Yacht occupancy</div>
        {SLOTS.map((s) => (
          <div key={s.id} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{s.label} departure</div>
            <div style={{ display: "grid", gap: 8 }}>
              {YACHTS.map((y) => {
                const rel = active.filter((b) => b.date === date && b.slot === s.id && b.yachtId === y.id);
                const chartered = rel.some((b) => b.type === "charter");
                const used = chartered ? cap(y) : rel.reduce((n, b) => n + b.seats.length, 0);
                const p = Math.round((used / cap(y)) * 100);
                return (
                  <div key={y.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 90, fontSize: 14 }}>{y.name}</span>
                    <div style={{ flex: 1, height: 12, background: "var(--bg)", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ width: `${p}%`, height: "100%", background: chartered ? "var(--coral)" : "var(--sun)", transition: "width .4s" }} />
                    </div>
                    <span style={{ width: 110, fontSize: 12.5, color: "var(--muted)", textAlign: "right" }}>
                      {chartered ? "Chartered" : `${used}/${cap(y)} · ${p}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* bookings list */}
      <section style={S.card}>
        <div className="display" style={{ fontSize: 19, marginBottom: 14 }}>Bookings · {date}</div>
        {dayB.length === 0 && <p style={{ color: "var(--muted)" }}>No bookings for this date yet.</p>}
        <div style={{ display: "grid", gap: 10 }}>
          {dayB.sort((a, b) => a.slot.localeCompare(b.slot)).map((b) => {
            const y = YACHTS.find((x) => x.id === b.yachtId);
            return (
              <div key={b.ref} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg)", borderRadius: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--teal)", width: 86 }}>{b.ref}</span>
                <span style={{ flex: "1 1 140px", fontWeight: 600 }}>{b.customerName}</span>
                <span className="hide-sm" style={{ fontSize: 13, color: "var(--muted)", width: 120 }}>{y.name} · {SLOTS.find((s) => s.id === b.slot).label}</span>
                <span className="pill" style={{ background: b.type === "charter" ? "rgba(255,138,91,.16)" : "rgba(52,216,196,.13)", color: b.type === "charter" ? "var(--coral)" : "var(--teal)" }}>
                  {b.type === "charter" ? `Charter · ${b.groupSize}` : `${b.seats.length} seats`}
                </span>
                <span className="pill" style={{ background: "rgba(255,255,255,.06)", color: "var(--muted)" }}>
                  {b.channel === "agent" ? `🤝 ${b.agentName || "Agent"}` : "🌐 Online"}
                </span>
                <span style={{ width: 90, textAlign: "right", fontWeight: 600 }}>{money(b.total)}</span>
                <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => cancelBooking(b.ref)}>Cancel</button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ─────────────── AUTH ─────────────── */
function RequireAuth({ authed, children }) {
  const location = useLocation();
  // Bounce unauthenticated visitors to /login, remembering where they were headed.
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function Login({ S, authed, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  // Already signed in? Skip the form.
  useEffect(() => { if (authed) navigate(from, { replace: true }); }, [authed]);

  const submit = (e) => {
    e.preventDefault();
    if (onLogin(u, p)) navigate(from, { replace: true });
    else setErr("Incorrect username or password.");
  };

  return (
    <div className="fu" style={{ display: "grid", placeItems: "center", marginTop: 60 }}>
      <form onSubmit={submit} style={{ ...S.card, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 40, textAlign: "center" }}>🔒</div>
        <h2 className="display" style={{ fontSize: 24, textAlign: "center", margin: "6px 0 2px" }}>Operator sign in</h2>
        <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 0, fontSize: 14 }}>
          The dashboard is restricted to staff.
        </p>
        <div style={{ marginTop: 12 }}>
          <div className="label">Username</div>
          <input className="inp" autoFocus value={u} onChange={(e) => { setU(e.target.value); setErr(""); }} placeholder="operator" />
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="label">Password</div>
          <input className="inp" type="password" value={p} onChange={(e) => { setP(e.target.value); setErr(""); }} placeholder="••••••••" />
        </div>
        {err && <div style={{ color: "var(--bad)", fontSize: 13, marginTop: 10 }}>{err}</div>}
        <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 16 }}>Sign in</button>
        <p style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
          Demo credentials — <strong style={{ color: "var(--text)" }}>operator</strong> / <strong style={{ color: "var(--text)" }}>whales123</strong>
        </p>
      </form>
    </div>
  );
}

/* ─────────────── small helpers ─────────────── */
function Row({ k, v, bold, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", fontSize: 14 }}>
      <span style={{ color: "var(--muted)" }}>{k}</span>
      <span style={{ fontWeight: bold ? 700 : 500, fontFamily: mono ? "monospace" : "inherit", textAlign: "right" }}>{v}</span>
    </div>
  );
}
function Stat({ label, value, sub }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function Legend({ c, grad, t }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: 5, background: grad ? "var(--sun)" : c, border: "1px solid var(--line)" }} />
      {t}
    </span>
  );
}
