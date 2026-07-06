// OPERATOR CONSOLE — standalone staff app (separate package from the customer
// booking engine). A full control surface with a sidebar to manage bookings,
// the fleet, the departure schedule, pricing and system settings.
//
// UX: dark mode, toast notifications with undo, and a confirm dialog.

import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { S, GLOBAL_CSS } from "./lib/styles.js";
import { loadBookings, saveBookings, mkBooking, resetBookings } from "./lib/storage.js";
import { loadSettings, saveSettings, makeMoney } from "./lib/settings.js";
import { Toasts, ConfirmDialog } from "./components/ui.jsx";
import RequireAuth from "./RequireAuth.jsx";
import Login from "./Login.jsx";
import Overview from "./tabs/Overview.jsx";
import BookingsAdmin from "./tabs/BookingsAdmin.jsx";
import FleetAdmin from "./tabs/FleetAdmin.jsx";
import ScheduleAdmin from "./tabs/ScheduleAdmin.jsx";
import SettingsAdmin from "./tabs/SettingsAdmin.jsx";

const TABS = [
  { to: "/", label: "Overview", icon: "📈", end: true },
  { to: "/bookings", label: "Bookings", icon: "🧾" },
  { to: "/fleet", label: "Fleet", icon: "⛵" },
  { to: "/schedule", label: "Schedule", icon: "🗓️" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function App() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(() => loadSettings());
  const [authed, setAuthed] = useState(() => {
    try { return localStorage.getItem("ww:auth:v1") === "1"; } catch (e) { return false; }
  });
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("ww:theme") || "light"; } catch (e) { return "light"; }
  });

  useEffect(() => {
    loadBookings().then((b) => { setBookings(b); setReady(true); });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("ww:theme", theme); } catch (e) { /* ignore */ }
  }, [theme]);

  const money = useMemo(() => makeMoney(settings.currency), [settings.currency]);

  // ── toasts ──
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const dismiss = (id) => setToasts((l) => l.filter((t) => t.id !== id));
  const toast = (msg, action) => {
    const id = ++toastId.current;
    setToasts((l) => [...l, { id, msg, action }]);
    setTimeout(() => dismiss(id), action ? 6000 : 3500);
  };

  // ── confirm dialog (promise-based) ──
  const [confirmState, setConfirmState] = useState(null);
  const confirm = (opts) => new Promise((resolve) => {
    setConfirmState({ ...opts, resolve: (v) => { setConfirmState(null); resolve(v); } });
  });

  // ── settings ops ──
  function updateSettings(patch) {
    setSettings((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  // ── booking ops (with toast feedback + undo) ──
  async function commit(next) { setBookings(next); await saveBookings(next); }
  async function addBooking(input) {
    const b = mkBooking(input, { yachts: settings.yachts, pricePerSeat: settings.pricePerSeat });
    await commit([...bookings, b]);
    toast(`Booking ${b.ref} created`);
    return b;
  }
  const cancelBooking = (ref) => {
    const prev = bookings;
    commit(prev.map((b) => (b.ref === ref ? { ...b, status: "cancelled" } : b)));
    toast(`Booking ${ref} cancelled`, { label: "Undo", fn: () => commit(prev) });
  };
  const restoreBooking = (ref) => {
    commit(bookings.map((b) => (b.ref === ref ? { ...b, status: "confirmed" } : b)));
    toast(`Booking ${ref} restored`);
  };
  const deleteBooking = (ref) => {
    const prev = bookings;
    commit(prev.filter((b) => b.ref !== ref));
    toast(`Booking ${ref} deleted`, { label: "Undo", fn: () => commit(prev) });
  };
  const clearBookings = () => {
    const prev = bookings;
    commit([]);
    toast("All bookings cleared", { label: "Undo", fn: () => commit(prev) });
  };
  async function reseedBookings() {
    const prev = bookings;
    setBookings(await resetBookings());
    toast("Demo data restored", { label: "Undo", fn: () => commit(prev) });
  }

  // ── auth ops (checked against editable settings) ──
  function login(u, p) {
    if (u.trim() === settings.user && p === settings.password) {
      setAuthed(true);
      try { localStorage.setItem("ww:auth:v1", "1"); } catch (e) { /* ignore */ }
      return true;
    }
    return false;
  }
  function logout() {
    setAuthed(false);
    try { localStorage.removeItem("ww:auth:v1"); } catch (e) { /* ignore */ }
    navigate("/login");
  }

  const shared = { settings, updateSettings, bookings, money, toast, confirm };
  const loading = <p style={{ color: "var(--muted)", marginTop: 40 }}>Loading…</p>;
  const guard = (el) => <RequireAuth authed={authed}>{el}</RequireAuth>;

  const routes = (
    <Routes>
      <Route path="/login" element={<Login authed={authed} onLogin={login} />} />
      <Route path="/" element={guard(<Overview {...shared} cancelBooking={cancelBooking} />)} />
      <Route path="/bookings" element={guard(
        <BookingsAdmin {...shared} addBooking={addBooking} cancelBooking={cancelBooking} restoreBooking={restoreBooking} deleteBooking={deleteBooking} />
      )} />
      <Route path="/fleet" element={guard(<FleetAdmin {...shared} />)} />
      <Route path="/schedule" element={guard(<ScheduleAdmin {...shared} />)} />
      <Route path="/settings" element={guard(
        <SettingsAdmin {...shared} reseedBookings={reseedBookings} clearBookings={clearBookings} />
      )} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <div style={S.page}>
      <style>{GLOBAL_CSS}</style>

      {authed ? (
        <div className="admin-shell">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="brand">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--sun)", display: "grid", placeItems: "center", fontSize: 17 }}>📊</div>
              <div style={{ minWidth: 0 }}>
                <div className="display" style={{ fontSize: 15, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{settings.operatorName}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Operator console</div>
              </div>
            </div>
            {TABS.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `sidebar-link ${isActive ? "on" : ""}`}>
                <span className="ic">{t.icon}</span><span>{t.label}</span>
              </NavLink>
            ))}
            <div className="sidebar-bottom">
              <button className="theme-toggle" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
                <span className="ic">{theme === "dark" ? "☀️" : "🌙"}</span><span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </button>
              <button className="sidebar-link" onClick={logout}>
                <span className="ic">⎋</span><span>Log out</span>
              </button>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="admin-main">
            <div className="admin-main-inner">
              {!ready ? loading : routes}
            </div>
          </div>
        </div>
      ) : (
        <main style={S.wrap}>
          {!ready ? loading : routes}
        </main>
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog state={confirmState} />
    </div>
  );
}
