// Customer booking app — wired to the MongoDB-backed API. Fleet, schedule and
// pricing come from the operator's live settings; bookings are posted to the API.

import { useState, useEffect } from "react";
import { S, GLOBAL_CSS } from "./lib/styles.js";
import { api } from "./lib/api.js";
import BookingPage from "./booking/BookingPage.jsx";

// Where the separate operator console is hosted. Defaults to the local dev
// server; set VITE_OPERATOR_URL to the deployed dashboard for production.
const OPERATOR_URL = import.meta.env.VITE_OPERATOR_URL || "http://localhost:5174/";

export default function App() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSettings().then(setConfig).catch(() => setError("Can't reach the booking service right now. Please try again shortly."));
  }, []);

  return (
    <div style={S.page}>
      <style>{GLOBAL_CSS}</style>

      <header style={{ background: "linear-gradient(180deg,#e8f1ff,transparent)", borderBottom: "1px solid var(--line)" }}>
        <div className="site-header-inner" style={{ ...S.wrap, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--sun)", display: "grid", placeItems: "center", fontSize: 20 }}>🐋</div>
            <div>
              <div className="display" style={{ fontSize: 19, lineHeight: 1.1 }}>{config?.operatorName || "Whale Watching"}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Morning whale-watching tours · Mirissa coast</div>
            </div>
          </div>
          <nav className="site-nav">
            <a className="navlink" href={OPERATOR_URL}>Operator dashboard →</a>
          </nav>
        </div>
      </header>

      <main style={S.wrap}>
        {error
          ? <p style={{ color: "var(--muted)", marginTop: 40 }}>{error}</p>
          : !config
            ? <p style={{ color: "var(--muted)", marginTop: 40 }}>Loading…</p>
            : <BookingPage config={config} onCreate={api.createBooking} />}
      </main>
    </div>
  );
}
