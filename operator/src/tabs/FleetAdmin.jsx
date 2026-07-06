/* FLEET TAB — manage the yachts: name, hull type, seat grid, charter price.
   Edits persist immediately to settings. */
import { cap } from "../lib/config.js";
import { PageHead, Chip } from "../components/ui.jsx";
import { slugId } from "../lib/settings.js";

export default function FleetAdmin({ settings, updateSettings, bookings, money, confirm, toast }) {
  const { yachts } = settings;

  const updateYacht = (id, patch) =>
    updateSettings((prev) => ({ ...prev, yachts: prev.yachts.map((y) => (y.id === id ? { ...y, ...patch } : y)) }));

  const addYacht = () => {
    updateSettings((prev) => ({
      ...prev,
      yachts: [...prev.yachts, { id: slugId("yacht"), name: "New Yacht", type: "wide", rows: 6, cols: 6, charter: 30000 }],
    }));
    toast("Yacht added");
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

  const num = (v, min = 0) => Math.max(min, Number(v) || 0);

  return (
    <div className="fu" style={{ marginTop: 22, display: "grid", gap: 16 }}>
      <PageHead
        title="Fleet"
        subtitle={`${yachts.length} yacht(s) · ${yachts.reduce((n, y) => n + cap(y), 0)} total seats`}
        right={<button className="btn btn-primary" onClick={addYacht}>+ Add yacht</button>}
      />

      <div style={{ display: "grid", gap: 14 }}>
        {yachts.map((y) => (
          <section key={y.id} className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{y.name || "Untitled yacht"}</span>
              <Chip tone={y.type === "wide" ? "aqua" : "blue"}>{cap(y)} seats · {y.rows}×{y.cols}</Chip>
            </div>
            <div className="field-grid">
              <div><div className="label">Name</div><input className="inp" value={y.name} onChange={(e) => updateYacht(y.id, { name: e.target.value })} /></div>
              <div><div className="label">Hull type</div>
                <select className="inp" value={y.type} onChange={(e) => updateYacht(y.id, { type: e.target.value })}>
                  <option value="wide">Wide hull</option>
                  <option value="long">Long hull</option>
                </select>
              </div>
              <div><div className="label">Rows</div><input className="inp" type="number" min={1} value={y.rows} onChange={(e) => updateYacht(y.id, { rows: num(e.target.value, 1) })} /></div>
              <div><div className="label">Columns (seats/row)</div><input className="inp" type="number" min={1} value={y.cols} onChange={(e) => updateYacht(y.id, { cols: num(e.target.value, 1) })} /></div>
              <div><div className="label">Charter price</div><input className="inp" type="number" min={0} value={y.charter} onChange={(e) => updateYacht(y.id, { charter: num(e.target.value) })} /></div>
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Full charter: <strong style={{ color: "var(--text)" }}>{money(y.charter)}</strong></span>
              <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13, borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => removeYacht(y)}>Remove yacht</button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
