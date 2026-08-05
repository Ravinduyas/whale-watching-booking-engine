/* Public API client for the customer booking app.
   Set VITE_API_URL to point at a deployed backend; defaults to localhost. */
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export const api = {
  getSettings: () => req("/api/settings/public"),
  getAvailability: (date, slot) =>
    req(`/api/availability?date=${encodeURIComponent(date)}&slot=${encodeURIComponent(slot)}`),
  createBooking: (b) => req("/api/bookings", { method: "POST", body: JSON.stringify(b) }),
};
