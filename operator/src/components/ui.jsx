/* Presentational building blocks for the operator console. */

const ACCENTS = {
  blue:   { c: "#2563eb", bg: "rgba(37,99,235,.12)" },
  aqua:   { c: "#0891b2", bg: "rgba(8,145,178,.12)" },
  green:  { c: "#16a34a", bg: "rgba(22,163,74,.12)" },
  violet: { c: "#7c3aed", bg: "rgba(124,58,237,.12)" },
  amber:  { c: "#b45309", bg: "rgba(217,119,6,.14)" },
  rose:   { c: "#e11d48", bg: "rgba(225,29,72,.12)" },
  slate:  { c: "var(--muted)", bg: "rgba(10,37,64,.06)" },
};

// Page header: bold title + optional subtitle, with room for actions on the right.
export function PageHead({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-.015em" }}>{title}</h1>
        {subtitle && <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 3 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{right}</div>}
    </div>
  );
}

// KPI card with an accent icon badge.
export function Stat({ label, value, sub, icon, accent = "blue" }) {
  const a = ACCENTS[accent] || ACCENTS.blue;
  return (
    <div className="kpi">
      {icon && <div className="kpi-ic" style={{ background: a.bg, color: a.c }}>{icon}</div>}
      <div style={{ minWidth: 0 }}>
        <div className="kpi-label">{label}</div>
        <div className="kpi-val">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

// Rounded status/label chip. `tone` maps to an accent palette.
export function Chip({ tone = "slate", children }) {
  const a = ACCENTS[tone] || ACCENTS.slate;
  return <span className="chip" style={{ background: a.bg, color: a.c }}>{children}</span>;
}

export function Row({ k, v, bold, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", fontSize: 14 }}>
      <span style={{ color: "var(--muted)" }}>{k}</span>
      <span style={{ fontWeight: bold ? 700 : 500, fontFamily: mono ? "monospace" : "inherit", textAlign: "right" }}>{v}</span>
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

// Friendly empty placeholder for lists.
export function EmptyState({ icon = "📭", title, hint }) {
  return (
    <div className="empty">
      <div className="ico">{icon}</div>
      <div style={{ fontWeight: 600, color: "var(--text)", marginTop: 8 }}>{title}</div>
      {hint && <div style={{ fontSize: 13, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

// Bottom-right toast stack. Each toast: { id, msg, action?: { label, fn } }.
export function Toasts({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="msg">{t.msg}</span>
          {t.action && (
            <button className="undo" onClick={() => { t.action.fn(); onDismiss(t.id); }}>{t.action.label}</button>
          )}
          <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => onDismiss(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// Generic centered modal.
export function Modal({ onClose, width = 440, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal fu" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// Promise-based confirm dialog. `state` = { title, message, confirmLabel, danger, resolve } | null.
export function ConfirmDialog({ state }) {
  if (!state) return null;
  const done = (v) => state.resolve(v);
  return (
    <Modal onClose={() => done(false)} width={420}>
      <h3 className="display" style={{ fontSize: 21, margin: "0 0 8px" }}>{state.title}</h3>
      <p style={{ color: "var(--muted)", marginTop: 0, fontSize: 14.5, lineHeight: 1.5 }}>{state.message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
        <button className="btn btn-ghost" onClick={() => done(false)}>Cancel</button>
        <button className="btn btn-primary" style={state.danger ? { background: "var(--bad)" } : undefined} onClick={() => done(true)}>
          {state.confirmLabel || "Confirm"}
        </button>
      </div>
    </Modal>
  );
}
