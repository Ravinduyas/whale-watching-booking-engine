/* API client for the operator console. Talks to the MongoDB-backed backend.
   Set VITE_API_URL to point at a deployed backend; defaults to localhost. */
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
    const err = new Error(`${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (user, password) => req("/api/auth/login", { method: "POST", body: JSON.stringify({ user, password }) }),
  getSettings: () => req("/api/settings"),
  saveSettings: (s) => req("/api/settings", { method: "PUT", body: JSON.stringify(s) }),
  getBookings: () => req("/api/bookings"),
  createBooking: (b) => req("/api/bookings", { method: "POST", body: JSON.stringify(b) }),
  updateBooking: (ref, patch) => req(`/api/bookings/${ref}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteBooking: (ref) => req(`/api/bookings/${ref}`, { method: "DELETE" }),
  clearBookings: () => req("/api/bookings", { method: "DELETE" }),
  resetBookings: () => req("/api/bookings/reset", { method: "POST" }),
};
