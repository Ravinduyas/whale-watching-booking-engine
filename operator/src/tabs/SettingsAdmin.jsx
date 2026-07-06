/* SETTINGS TAB — pricing, business info, staff login, and data tools. */
import { PageHead } from "../components/ui.jsx";

export default function SettingsAdmin({ settings, updateSettings, bookings, money, reseedBookings, clearBookings, confirm, toast }) {
  const set = (patch) => updateSettings(patch);

  function exportBookings() {
    const blob = new Blob([JSON.stringify(bookings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Bookings exported");
  }

  const ask = async (opts, fn) => { if (await confirm(opts)) fn(); };

  return (
    <div className="fu" style={{ marginTop: 22, display: "grid", gap: 16 }}>
      <PageHead title="Settings" subtitle="Business, pricing, access and data" />

      {/* business */}
      <section className="panel">
        <div className="panel-h">Business</div>
        <div className="field-grid">
          <div><div className="label">Operator name</div><input className="inp" value={settings.operatorName} onChange={(e) => set({ operatorName: e.target.value })} /></div>
          <div><div className="label">Tagline</div><input className="inp" value={settings.tagline} onChange={(e) => set({ tagline: e.target.value })} /></div>
        </div>
      </section>

      {/* pricing */}
      <section className="panel">
        <div className="panel-h">Pricing</div>
        <div className="field-grid">
          <div><div className="label">Currency prefix</div><input className="inp" value={settings.currency} onChange={(e) => set({ currency: e.target.value })} placeholder="Rs " /></div>
          <div><div className="label">Price per seat</div><input className="inp" type="number" min={0} value={settings.pricePerSeat} onChange={(e) => set({ pricePerSeat: Math.max(0, Number(e.target.value) || 0) })} /></div>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 0, marginTop: 12 }}>Example: a 3-seat booking costs <strong style={{ color: "var(--text)" }}>{money(settings.pricePerSeat * 3)}</strong>. Per-yacht charter prices are set on the Fleet tab.</p>
      </section>

      {/* security */}
      <section className="panel">
        <div className="panel-h" style={{ marginBottom: 4 }}>Staff login</div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>Client-side gate only — fine for a demo, not real security. A backend is needed for genuine access control.</p>
        <div className="field-grid">
          <div><div className="label">Username</div><input className="inp" value={settings.user} onChange={(e) => set({ user: e.target.value })} /></div>
          <div><div className="label">Password</div><input className="inp" value={settings.password} onChange={(e) => set({ password: e.target.value })} /></div>
        </div>
      </section>

      {/* data */}
      <section className="panel">
        <div className="panel-h" style={{ marginBottom: 4 }}>Data</div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>{bookings.length} booking(s) stored in this browser.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={exportBookings}>⬇ Export bookings (JSON)</button>
          <button className="btn btn-ghost" onClick={() => ask({ title: "Reset demo data", message: "Replace all current bookings with the demo set?", confirmLabel: "Reset" }, reseedBookings)}>↻ Reset demo data</button>
          <button className="btn btn-ghost" style={{ borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => ask({ title: "Clear all bookings", message: "Delete ALL bookings? You can undo this from the toast right after.", confirmLabel: "Clear all", danger: true }, clearBookings)}>Clear all bookings</button>
        </div>
      </section>
    </div>
  );
}
