/* SCHEDULE TAB — manage departure slots and closed-out dates. */
import { useState } from "react";
import { PageHead, Chip } from "../components/ui.jsx";
import { slugId } from "../lib/settings.js";

export default function ScheduleAdmin({ settings, updateSettings }) {
  const { slots, closedDates = [] } = settings;
  const [newDate, setNewDate] = useState("");

  const updateSlot = (id, patch) =>
    updateSettings((prev) => ({ ...prev, slots: prev.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const addSlot = () =>
    updateSettings((prev) => ({ ...prev, slots: [...prev.slots, { id: slugId("slot"), label: "New time", tag: "Morning" }] }));
  const removeSlot = (id) =>
    updateSettings((prev) => ({ ...prev, slots: prev.slots.filter((s) => s.id !== id) }));

  const addClosed = () => {
    if (!newDate || closedDates.includes(newDate)) return;
    updateSettings((prev) => ({ ...prev, closedDates: [...(prev.closedDates || []), newDate].sort() }));
    setNewDate("");
  };
  const removeClosed = (d) =>
    updateSettings((prev) => ({ ...prev, closedDates: (prev.closedDates || []).filter((x) => x !== d) }));

  return (
    <div className="fu" style={{ marginTop: 22, display: "grid", gap: 16 }}>
      <PageHead title="Schedule" subtitle="Departure times and closed dates" />

      {/* departures */}
      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div className="panel-h" style={{ marginBottom: 0 }}>Departure times</div>
          <button className="btn btn-primary" style={{ padding: "10px 16px" }} onClick={addSlot}>+ Add departure</button>
        </div>
        <div className="admin-list">
          {slots.map((s) => (
            <div key={s.id} className="brow" style={{ alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 160px" }}><div className="label">Label</div><input className="inp" value={s.label} onChange={(e) => updateSlot(s.id, { label: e.target.value })} placeholder="6:30 AM" /></div>
              <div style={{ flex: "1 1 140px" }}><div className="label">Tag</div><input className="inp" value={s.tag} onChange={(e) => updateSlot(s.id, { tag: e.target.value })} placeholder="Sunrise" /></div>
              <button className="btn btn-ghost" style={{ padding: "10px 14px", fontSize: 13, borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => removeSlot(s.id)}>Remove</button>
            </div>
          ))}
          {slots.length === 0 && <p style={{ color: "var(--muted)", margin: 0 }}>No departures — add one so customers can book.</p>}
        </div>
      </section>

      {/* closed dates */}
      <section className="panel">
        <div className="panel-h" style={{ marginBottom: 4 }}>Closed dates</div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 0 }}>Days the operation is closed (weather, maintenance, holidays).</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <input className="inp" style={{ width: 180 }} type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          <button className="btn btn-primary" style={{ padding: "10px 16px" }} onClick={addClosed} disabled={!newDate}>Add closed date</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {closedDates.length === 0 && <span style={{ color: "var(--muted)", fontSize: 14 }}>No closed dates.</span>}
          {closedDates.map((d) => (
            <span key={d} className="chip" style={{ background: "rgba(225,29,72,.12)", color: "var(--bad)", gap: 8 }}>
              {d}
              <button onClick={() => removeClosed(d)} style={{ background: "none", border: "none", color: "var(--bad)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
