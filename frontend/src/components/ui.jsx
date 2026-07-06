/* Small presentational helpers shared across modules. */

export function Row({ k, v, bold, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", fontSize: 14 }}>
      <span style={{ color: "var(--muted)" }}>{k}</span>
      <span style={{ fontWeight: bold ? 700 : 500, fontFamily: mono ? "monospace" : "inherit", textAlign: "right" }}>{v}</span>
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Legend({ c, grad, t }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: 5, background: grad ? "var(--sun)" : c, border: "1px solid var(--line)" }} />
      {t}
    </span>
  );
}
