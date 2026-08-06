/* API client for the operator console. Talks to the MongoDB-backed backend,
   and transparently falls back to an in-browser demo store (offline.js) when
   the backend is unreachable — so the published site stays usable for review. */
import { offline } from "./offline.js";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "ww:token";

let token = "";
try { token = localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { /* ignore */ }

export function setToken(t) {
  token = t || "";
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
}
export const hasToken = () => !!token;

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = new Error(String(res.status));
    err.status = res.status;
    err.http = true; // reached the server; a real HTTP error (e.g. 401)
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

// Try the real backend; if the network call itself fails (server down, blocked,
// mixed-content on the static site), run the offline demo equivalent instead.
async function call(realCall, offlineCall) {
  try {
    return await realCall();
  } catch (e) {
    if (e && e.http) throw e; // genuine HTTP error — surface it (e.g. wrong password)
    return offlineCall();      // network failure — use the offline demo store
  }
}

export const api = {
  login: (user, password) => call(() => req("/api/auth/login", { method: "POST", body: JSON.stringify({ user, password }) }), () => offline.login(user, password)),
  getSettings: () => call(() => req("/api/settings"), () => offline.getSettings()),
  saveSettings: (s) => call(() => req("/api/settings", { method: "PUT", body: JSON.stringify(s) }), () => offline.saveSettings(s)),
  getBookings: () => call(() => req("/api/bookings"), () => offline.getBookings()),
  createBooking: (b) => call(() => req("/api/bookings", { method: "POST", body: JSON.stringify(b) }), () => offline.createBooking(b)),
  updateBooking: (ref, patch) => call(() => req(`/api/bookings/${ref}`, { method: "PATCH", body: JSON.stringify(patch) }), () => offline.updateBooking(ref, patch)),
  deleteBooking: (ref) => call(() => req(`/api/bookings/${ref}`, { method: "DELETE" }), () => offline.deleteBooking(ref)),
  clearBookings: () => call(() => req("/api/bookings", { method: "DELETE" }), () => offline.clearBookings()),
  resetBookings: () => call(() => req("/api/bookings/reset", { method: "POST" }), () => offline.resetBookings()),
};
