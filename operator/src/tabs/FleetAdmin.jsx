/* FLEET TAB — manage the yachts. Rows show a summary; Add / Edit open a popup. */
import { useState } from "react";
import { cap } from "../lib/config.js";
import { PageHead, Chip, Modal } from "../components/ui.jsx";
import { slugId } from "../lib/settings.js";

export default function FleetAdmin({ settings, updateSettings, bookings, money, confirm, toast }) {
  const { yachts } = settings;
  const [editing, setEditing] = useState(null); // { id?, name, type, rows, cols, charter, isNew }

  const openAdd = () => setEditing({ name: "", type: "wide", rows: 6, cols: 6, charter: 30000, isNew: true });
  const openEdit = (y) => setEditing({ id: y.id, name: y.name, type: y.type, rows: y.rows, cols: y.cols, charter: y.charter });
  const setField = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  const save = () => {
    const data = {
      name: editing.name.trim() || "Untitled yacht",
      type: editing.type,
      rows: Math.max(1, Number(editing.rows) || 1),
      cols: Math.max(1, Number(editing.cols) || 1),
      charter: Math.max(0, Number(editing.charter) || 0),
    };
    if (editing.isNew) {
      updateSettings((prev) => ({ ...prev, yachts: [...prev.yachts, { id: slugId(data.name), ...data }] }));
      toast("Yacht added");
    } else {
      updateSettings((prev) => ({ ...prev, yachts: prev.yachts.map((y) => (y.id === editing.id ? { ...y, ...data } : y)) }));
      toast("Yacht updated");
    }
    setEditing(null);
  };

  const removeYacht = async (y) => {
    const refs = bookings.filter((b) => b.yachtId === y.id && b.status === "confirmed").length;
    const ok = await confirm({
      title: "Remove yacht",
      message: refs
        ? `${y.name} has ${refs} active booking(s). Remove it anyway? Those bookings keep their reference but the yacht won't be selectable.`
        : `Remove ${y.name} from the fleet?`,
      confirmLabel: "Remove", danger: true,
    });
    if (!ok) return;
    updateSettings((prev) => ({ ...prev, yachts: prev.yachts.filter((x) => x.id !== y.id) }));
    toast(`${y.name} removed`);
  };

  const previewCap = editing ? (Number(editing.rows) || 0) * (Number(editing.cols) || 0) : 0;

  return (
    <div className="fu" style={{ marginTop: 22, display: "grid", gap: 16 }}>
      <PageHead
        title="Fleet"
        subtitle={`${yachts.length} yacht(s) · ${yachts.reduce((n, y) => n + cap(y), 0)} total seats`}
        right={<button className="btn btn-primary" onClick={openAdd}>+ Add yacht</button>}
      />

      <div className="admin-list">
        {yachts.map((y) => (
          <div key={y.id} className="brow">
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{y.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{cap(y)} seats · {y.rows}×{y.cols} grid · charter {money(y.charter)}</div>
            </div>
            <Chip tone={y.type === "wide" ? "aqua" : "blue"}>{y.type === "wide" ? "Wide hull" : "Long hull"}</Chip>
            <button className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => openEdit(y)}>Edit</button>
            <button className="iconbtn" title="Remove yacht" style={{ borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => removeYacht(y)}>✕</button>
          </div>
        ))}
        {yachts.length === 0 && <p style={{ color: "var(--muted)", margin: 0 }}>No yachts — add one to start taking bookings.</p>}
      </div>

      {/* edit / add popup */}
      {editing && (
        <Modal onClose={() => setEditing(null)} width={480}>
          <h3 className="display" style={{ fontSize: 21, margin: "0 0 16px" }}>{editing.isNew ? "Add yacht" : "Edit yacht"}</h3>
          <div className="field-grid">
            <div><div className="label">Name</div><input className="inp" autoFocus value={editing.name} onChange={(e) => setField("name", e.target.value)} placeholder="Yacht name" /></div>
            <div><div className="label">Hull type</div>
              <select className="inp" value={editing.type} onChange={(e) => setField("type", e.target.value)}>
                <option value="wide">Wide hull</option>
                <option value="long">Long hull</option>
              </select>
            </div>
            <div><div className="label">Rows</div><input className="inp" type="number" min={1} value={editing.rows} onChange={(e) => setField("rows", e.target.value)} /></div>
            <div><div className="label">Columns (seats/row)</div><input className="inp" type="number" min={1} value={editing.cols} onChange={(e) => setField("cols", e.target.value)} /></div>
            <div><div className="label">Charter price</div><input className="inp" type="number" min={0} value={editing.charter} onChange={(e) => setField("charter", e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Capacity: <strong style={{ color: "var(--text)" }}>{previewCap} seats</strong> · charter <strong style={{ color: "var(--text)" }}>{money(Number(editing.charter) || 0)}</strong></span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{editing.isNew ? "Add yacht" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
