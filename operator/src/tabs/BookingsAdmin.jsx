/* BOOKINGS TAB — manage every booking: search, filter, cancel / restore /
   delete, and create bookings manually (walk-ins, phone, agent holds). */
import { useState, useMemo } from "react";
import { cap } from "../lib/config.js";
import { PageHead, Chip, Modal, EmptyState, Row } from "../components/ui.jsx";

const blankForm = { customerName: "", phone: "", channel: "online", agentName: "", date: "", slot: "", yachtId: "", type: "seat", count: 1 };

export default function BookingsAdmin({ settings, bookings, money, addBooking, cancelBooking, restoreBooking, deleteBooking }) {
  const { yachts, slots } = settings;
  const [q, setQ] = useState("");
  const [fYacht, setFYacht] = useState("all");
  const [fChannel, setFChannel] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fDate, setFDate] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(() => ({ ...blankForm, yachtId: yachts[0]?.id || "", slot: slots[0]?.id || "" }));

  const yachtName = (id) => (yachts.find((y) => y.id === id) || {}).name || id;
  const slotLabel = (id) => (slots.find((s) => s.id === id) || {}).label || id;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return bookings
      .filter((b) => (fStatus === "all" ? true : b.status === fStatus))
      .filter((b) => (fYacht === "all" ? true : b.yachtId === fYacht))
      .filter((b) => (fChannel === "all" ? true : b.channel === fChannel))
      .filter((b) => (fDate ? b.date === fDate : true))
      .filter((b) => !needle || [b.ref, b.customerName, b.phone, b.agentName].join(" ").toLowerCase().includes(needle))
      .slice()
      .sort((a, b) => (a.date === b.date ? a.slot.localeCompare(b.slot) : b.date.localeCompare(a.date)));
  }, [bookings, q, fYacht, fChannel, fStatus, fDate]);

  const yacht = yachts.find((y) => y.id === form.yachtId) || yachts[0];
  const canCreate = form.customerName.trim() && form.phone.trim() && form.date && form.slot && form.yachtId &&
    (form.channel !== "agent" || form.agentName.trim()) && form.count >= 1;

  async function create(e) {
    e.preventDefault();
    if (!canCreate) return;
    await addBooking({
      date: form.date, slot: form.slot, yachtId: form.yachtId, type: form.type,
      seats: [], groupSize: Number(form.count),
      customerName: form.customerName.trim(), phone: form.phone.trim(),
      channel: form.channel, agentName: form.agentName.trim(),
    });
    setForm({ ...blankForm, yachtId: yachts[0]?.id || "", slot: slots[0]?.id || "" });
    setShowNew(false);
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fu" style={{ marginTop: 22, display: "grid", gap: 18 }}>
      <PageHead
        title="Bookings"
        subtitle={`${bookings.length} total · ${bookings.filter((b) => b.status === "confirmed").length} active`}
        right={<button className="btn btn-primary" style={{ padding: "10px 16px" }} onClick={() => setShowNew((v) => !v)}>{showNew ? "Close" : "+ New booking"}</button>}
      />

      {/* new booking form */}
      {showNew && (
        <form onSubmit={create} className="panel fu">
          <div className="panel-h">New booking</div>
          <div className="field-grid">
            <div><div className="label">Lead guest</div><input className="inp" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Name" /></div>
            <div><div className="label">Phone</div><input className="inp" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+94 …" /></div>
            <div><div className="label">Date</div><input className="inp" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
            <div><div className="label">Departure</div>
              <select className="inp" value={form.slot} onChange={(e) => set("slot", e.target.value)}>
                {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div><div className="label">Yacht</div>
              <select className="inp" value={form.yachtId} onChange={(e) => set("yachtId", e.target.value)}>
                {yachts.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
            <div><div className="label">Type</div>
              <select className="inp" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="seat">Individual seats</option>
                <option value="charter">Full charter</option>
              </select>
            </div>
            <div><div className="label">{form.type === "charter" ? "Group size (pax)" : "Number of seats"}</div>
              <input className="inp" type="number" min={1} max={yacht ? cap(yacht) : 99} value={form.count} onChange={(e) => set("count", e.target.value)} />
            </div>
            <div><div className="label">Channel</div>
              <select className="inp" value={form.channel} onChange={(e) => set("channel", e.target.value)}>
                <option value="online">Online</option>
                <option value="agent">Travel agent</option>
              </select>
            </div>
            {form.channel === "agent" && (
              <div><div className="label">Agent name</div><input className="inp" value={form.agentName} onChange={(e) => set("agentName", e.target.value)} placeholder="e.g. Lanka Tours" /></div>
            )}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={!canCreate}>Create booking</button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 0, marginTop: 10 }}>Manual bookings don't reserve specific seats — they hold a seat/pax count for the departure.</p>
        </form>
      )}

      {/* filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input className="inp" style={{ flex: "1 1 220px" }} placeholder="🔍  Search ref, name, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp" style={{ width: "auto" }} value={fYacht} onChange={(e) => setFYacht(e.target.value)}>
          <option value="all">All yachts</option>
          {yachts.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select className="inp" style={{ width: "auto" }} value={fChannel} onChange={(e) => setFChannel(e.target.value)}>
          <option value="all">All channels</option>
          <option value="online">Online</option>
          <option value="agent">Agent</option>
        </select>
        <select className="inp" style={{ width: "auto" }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input className="inp" style={{ width: "auto" }} type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
        {fDate && <button className="iconbtn" title="Clear date" onClick={() => setFDate("")}>✕</button>}
      </div>

      {/* results */}
      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div className="panel-h" style={{ marginBottom: 0 }}>Results</div>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{rows.length} shown</span>
        </div>
        {rows.length === 0
          ? <EmptyState icon="🔍" title="No bookings match" hint="Try clearing a filter or the search box." />
          : (
            <div className="admin-list">
              {rows.map((b) => {
                const cancelled = b.status === "cancelled";
                return (
                  <div key={b.ref} className="brow" style={{ opacity: cancelled ? 0.6 : 1 }}>
                    <button className="iconbtn" title="View details" onClick={() => setSelected(b)}>⋯</button>
                    <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--teal)", width: 82 }}>{b.ref}</span>
                    <span style={{ flex: "1 1 120px", fontWeight: 600, textDecoration: cancelled ? "line-through" : "none" }}>{b.customerName}</span>
                    <span className="hide-sm" style={{ fontSize: 13, color: "var(--muted)", width: 158 }}>{b.date} · {yachtName(b.yachtId)} · {slotLabel(b.slot)}</span>
                    <Chip tone={b.type === "charter" ? "blue" : "aqua"}>{b.type === "charter" ? `Charter · ${b.groupSize}` : `${b.seats.length || b.groupSize} seats`}</Chip>
                    <Chip tone={b.channel === "agent" ? "amber" : "slate"}>{b.channel === "agent" ? `🤝 ${b.agentName || "Agent"}` : "🌐 Online"}</Chip>
                    {cancelled && <Chip tone="rose">Cancelled</Chip>}
                    <span style={{ width: 86, textAlign: "right", fontWeight: 700 }}>{money(b.total)}</span>
                    {cancelled
                      ? <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => restoreBooking(b.ref)}>Restore</button>
                      : <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => cancelBooking(b.ref)}>Cancel</button>}
                    <button className="iconbtn" title="Delete permanently" style={{ borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => deleteBooking(b.ref)}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
      </section>

      {/* booking detail modal */}
      {selected && (
        <Modal onClose={() => setSelected(null)} width={460}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--teal)" }}>{selected.ref}</div>
              <h3 className="display" style={{ fontSize: 22, margin: "2px 0 0" }}>{selected.customerName}</h3>
            </div>
            <button className="iconbtn" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div style={{ marginTop: 14, background: "var(--bg)", borderRadius: 12, padding: 14 }}>
            <Row k="Status" v={selected.status === "cancelled" ? "Cancelled" : "Confirmed"} bold />
            <Row k="Date / time" v={`${selected.date} · ${slotLabel(selected.slot)}`} />
            <Row k="Yacht" v={yachtName(selected.yachtId)} />
            <Row k="Type" v={selected.type === "charter" ? `Full charter (${selected.groupSize} pax)` : `${selected.seats.length || selected.groupSize} seat(s)${selected.seats.length ? ": " + selected.seats.join(", ") : ""}`} />
            <Row k="Channel" v={selected.channel === "agent" ? `Travel agent · ${selected.agentName}` : "Online"} />
            <Row k="Phone" v={selected.phone} />
            <Row k="Total" v={money(selected.total)} bold />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            {selected.status === "cancelled"
              ? <button className="btn btn-ghost" onClick={() => { restoreBooking(selected.ref); setSelected(null); }}>Restore</button>
              : <button className="btn btn-ghost" onClick={() => { cancelBooking(selected.ref); setSelected(null); }}>Cancel booking</button>}
            <button className="btn btn-primary" onClick={() => setSelected(null)}>Done</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
