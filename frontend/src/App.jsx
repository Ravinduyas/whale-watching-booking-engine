// Aesthetic: Luxury Coastal — white base, blue/aqua accents, elegant Fraunces
// display + clean Outfit body. Built for a Sri Lankan whale-watching operator.
//
// The CUSTOMER booking app. Single page: branding header + the booking wizard.
// The operator dashboard is a separate package (../operator).

import { useState, useEffect } from "react";
import { OPERATOR } from "./lib/config.js";
import { S, GLOBAL_CSS } from "./lib/styles.js";
import { loadBookings, saveBookings, mkBooking } from "./lib/storage.js";
import BookingPage from "./booking/BookingPage.jsx";

export default function App() {
  const [bookings, setBookings] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadBookings().then((b) => { setBookings(b); setReady(true); });
  }, []);

  // the single seam onto storage — swap for an HTTP call when the backend lands
  async function addBooking(input) {
    const b = mkBooking(input);
    const next = [...bookings, b];
    setBookings(next);
    await saveBookings(next);
    return b;
  }

  return (
    <div style={S.page}>
      <style>{GLOBAL_CSS}</style>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(180deg,#e8f1ff,transparent)", borderBottom: "1px solid var(--line)" }}>
        <div className="site-header-inner" style={{ ...S.wrap, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--sun)", display: "grid", placeItems: "center", fontSize: 20 }}>🐋</div>
            <div>
              <div className="display" style={{ fontSize: 19, lineHeight: 1.1 }}>{OPERATOR}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Morning whale-watching tours · Mirissa coast</div>
            </div>
          </div>
        </div>
      </header>

      <main style={S.wrap}>
        {!ready
          ? <p style={{ color: "var(--muted)", marginTop: 40 }}>Loading…</p>
          : <BookingPage bookings={bookings} addBooking={addBooking} />}
      </main>
    </div>
  );
}
