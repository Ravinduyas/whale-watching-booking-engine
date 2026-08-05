// OPERATOR CONSOLE — standalone staff app, wired to the MongoDB-backed API.
// Fleet / schedule / pricing / bookings all persist server-side.

import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { S, GLOBAL_CSS } from "./lib/styles.js";
import { makeMoney } from "./lib/settings.js";
import { api, setToken, hasToken } from "./lib/api.js";
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
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("ww:theme") || "light"; } catch (e) { return "light"; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("ww:theme", theme); } catch (e) { /* ignore */ }
  }, [theme]);

  // load server data for an authenticated session
  async function loadAll() {
    const [s, b] = await Promise.all([api.getSettings(), api.getBookings()]);
    setSettings(s);
    setBookings(b);
  }

  // resume an existing token on first load
  useEffect(() => {
    (async () => {
      if (hasToken()) {
        try { await loadAll(); setAuthed(true); }
        catch (e) { setToken(""); }
      }
      setReady(true);
    })();
  }, []);

  const money = useMemo(() => makeMoney(settings?.currency || ""), [settings]);

  // ── toasts ──
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const dismiss = (id) => setToasts((l) => l.filter((t) => t.id !== id));
  const toast = (msg, action) => {
    const id = ++toastId.current;
    setToasts((l) => [...l, { id, msg, action }]);
    setTimeout(() => dismiss(id), action ? 6000 : 3500);
  };

  // ── confirm dialog ──
  const [confirmState, setConfirmState] = useState(null);
  const confirm = (opts) => new Promise((resolve) => {
    setConfirmState({ ...opts, resolve: (v) => { setConfirmState(null); resolve(v); } });
  });

  // ── settings ops (optimistic + persist) ──
  function updateSettings(patch) {
    setSettings((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      api.saveSettings(next).catch(() => toast("Couldn't save settings"));
      return next;
    });
  }

  // ── booking ops ──
  async function addBooking(input) {
    const b = await api.createBooking(input);
    setBookings((l) => [...l, b]);
    toast(`Booking ${b.ref} created`);
    return b;
  }
  const cancelBooking = (ref) => {
    setBookings((l) => l.map((b) => (b.ref === ref ? { ...b, status: "cancelled" } : b)));
    api.updateBooking(ref, { status: "cancelled" }).catch(() => toast("Update failed"));
    toast(`Booking ${ref} cancelled`, { label: "Undo", fn: () => restoreBooking(ref) });
  };
  const restoreBooking = (ref) => {
    setBookings((l) => l.map((b) => (b.ref === ref ? { ...b, status: "confirmed" } : b)));
    api.updateBooking(ref, { status: "confirmed" }).catch(() => toast("Update failed"));
    toast(`Booking ${ref} restored`);
  };
  const deleteBooking = (ref) => {
    const removed = bookings.find((b) => b.ref === ref);
    setBookings((l) => l.filter((b) => b.ref !== ref));
    api.deleteBooking(ref).catch(() => toast("Delete failed"));
    toast(`Booking ${ref} deleted`, removed && { label: "Undo", fn: async () => { const b = await api.createBooking(removed); setBookings((l) => [...l, b]); } });
  };
  const clearBookings = async () => {
    await api.clearBookings();
    setBookings([]);
    toast("All bookings cleared");
  };
  async function reseedBookings() {
    setBookings(await api.resetBookings());
    toast("Demo data restored");
  }

  // ── auth ──
  async function login(user, password) {
    try {
      const { token } = await api.login(user, password);
      setToken(token);
      await loadAll();
      setAuthed(true);
      return true;
    } catch (e) {
      setToken("");
      return false;
    }
  }
  function logout() {
    setToken("");
    setAuthed(false);
    setSettings(null);
    setBookings([]);
    navigate("/login");
  }

  const shared = { settings, updateSettings, bookings, money, toast, confirm };
  const loading = <p style={{ color: "var(--muted)", marginTop: 40 }}>Loading…</p>;
  const guard = (el) => (authed && settings ? el : <Navigate to="/login" replace />);

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

      {authed && settings ? (
        <div className="admin-shell">
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

          <div className="admin-main">
            <div className="admin-main-inner">{routes}</div>
          </div>
        </div>
      ) : (
        <main style={S.wrap}>{!ready ? loading : routes}</main>
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog state={confirmState} />
    </div>
  );
}
