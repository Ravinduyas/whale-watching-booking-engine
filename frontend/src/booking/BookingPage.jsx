/* ─────────────── BOOKING ENGINE (customer-facing) ───────────────
   Self-contained: owns the whole booking flow state and the
   confirmation modal. Only depends on the shared `bookings` list
   and an `addBooking` callback passed down from App.
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useMemo } from "react";
import { YACHTS, SLOTS, PRICE_PER_SEAT, cap, money, todayStr } from "../lib/config.js";
import { S } from "../lib/styles.js";
import { Row } from "../components/ui.jsx";
import SeatMap from "./SeatMap.jsx";

export default function BookingPage({ bookings, addBooking }) {
  const [date, setDate] = useState(todayStr());
  const [slot, setSlot] = useState("0630");
  const [yachtId, setYachtId] = useState(null);
  const [mode, setMode] = useState("seat"); // 'seat' | 'charter'
  const [picked, setPicked] = useState([]);
  const [charterSize, setCharterSize] = useState(2);
  const [cust, setCust] = useState({ name: "", phone: "", channel: "online", agentName: "" });
  const [confirmation, setConfirmation] = useState(null);
  const [step, setStep] = useState(1);

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
    const b = await addBooking({
      date, slot, yachtId, type: mode,
      seats: mode === "seat" ? picked : [],
      groupSize: mode === "charter" ? charterSize : picked.length,
      customerName: cust.name.trim(), phone: cust.phone.trim(),
      channel: cust.channel, agentName: cust.agentName.trim(),
    });
    setConfirmation(b);
  }

  function resetFlow() {
    setConfirmation(null);
    setYachtId(null); setMode("seat"); setPicked([]); setCharterSize(2); setStep(1);
    setCust({ name: "", phone: "", channel: "online", agentName: "" });
  }

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
    <>
      <div className="fu book-grid" style={{ marginTop: 26 }}>
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
                    color: active ? "#ffffff" : done ? "var(--good)" : "var(--muted)" }}>{done ? "✓" : st.n}</span>
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
                  <span className="pill" style={{ background: "rgba(103,232,249,.15)", color: "var(--amber)" }}>☀ Morning only</span>
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
                          <span className="pill" style={{ background: "rgba(95,211,232,.14)", color: "var(--teal)" }}>{y.type === "wide" ? "Wide hull" : "Long hull"}</span>
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
                <div className="guest-grid">
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
        <aside className="summary" style={{ ...S.card }}>
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

      {/* CONFIRMATION MODAL — replaces manual WhatsApp confirmation */}
      {confirmation && (
        <div onClick={resetFlow} style={{ position: "fixed", inset: 0, background: "rgba(4,14,30,.7)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }}>
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
    </>
  );
}
