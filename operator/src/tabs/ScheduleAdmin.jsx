/* SCHEDULE TAB — manage departure slots (via an edit popup) and closed dates. */
import { useState } from "react";
import { PageHead, Chip, Modal } from "../components/ui.jsx";
import { slugId } from "../lib/settings.js";

export default function ScheduleAdmin({ settings, updateSettings, toast, confirm }) {
  const { slots, closedDates = [] } = settings;
  const [newDate, setNewDate] = useState("");
  const [editing, setEditing] = useState(null); // { id?, label, tag, isNew }

  const openAdd = () => setEditing({ label: "", tag: "", isNew: true });
  const openEdit = (s) => setEditing({ id: s.id, label: s.label, tag: s.tag });
  const setField = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  const save = () => {
    const label = editing.label.trim() || "New time";
    const tag = editing.tag.trim();
    if (editing.isNew) {
      updateSettings((prev) => ({ ...prev, slots: [...prev.slots, { id: slugId("slot"), label, tag }] }));
      toast("Departure added");
    } else {
      updateSettings((prev) => ({ ...prev, slots: prev.slots.map((s) => (s.id === editing.id ? { ...s, label, tag } : s)) }));
      toast("Departure updated");
    }
    setEditing(null);
  };

  const removeSlot = async (s) => {
    if (!(await confirm({ title: "Remove departure", message: `Remove the “${s.label}” departure?`, confirmLabel: "Remove", danger: true }))) return;
    updateSettings((prev) => ({ ...prev, slots: prev.slots.filter((x) => x.id !== s.id) }));
    toast("Departure removed");
  };

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
          <button className="btn btn-primary" style={{ padding: "10px 16px" }} onClick={openAdd}>+ Add departure</button>
        </div>
        <div className="admin-list">
          {slots.map((s) => (
            <div key={s.id} className="brow">
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{s.label}</div>
              </div>
              {s.tag && <Chip tone="aqua">{s.tag}</Chip>}
              <button className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => openEdit(s)}>Edit</button>
              <button className="iconbtn" title="Remove" style={{ borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => removeSlot(s)}>✕</button>
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

      {/* edit / add popup */}
      {editing && (
        <Modal onClose={() => setEditing(null)} width={420}>
          <h3 className="display" style={{ fontSize: 21, margin: "0 0 16px" }}>{editing.isNew ? "Add departure" : "Edit departure"}</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div className="label">Label</div>
              <input className="inp" autoFocus value={editing.label} onChange={(e) => setField("label", e.target.value)} placeholder="6:30 AM"
                onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
            </div>
            <div>
              <div className="label">Tag</div>
              <input className="inp" value={editing.tag} onChange={(e) => setField("tag", e.target.value)} placeholder="Sunrise"
                onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{editing.isNew ? "Add" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
