/* Domain logic: defaults, booking construction, seeding, availability.
   The single source of truth for pricing/fleet lives in the settings doc. */

const dayOffset = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export const cap = (y) => y.rows * y.cols;

export function defaultSettings() {
  return {
    operatorName: "Ocean Drift Whale Watching",
    tagline: "Operator dashboard · staff only",
    currency: "Rs ",
    pricePerSeat: 995,
    yachts: [
      { id: "serenity", name: "Serenity", type: "wide", rows: 8, cols: 6, charter: 42000 },
      { id: "marina", name: "Marina", type: "wide", rows: 8, cols: 6, charter: 42000 },
      { id: "voyager", name: "Voyager", type: "long", rows: 12, cols: 3, charter: 32000 },
    ],
    slots: [
      { id: "0630", label: "6:30 AM", tag: "Sunrise" },
      { id: "0930", label: "9:30 AM", tag: "Morning" },
    ],
    closedDates: [dayOffset(5), dayOffset(11)],
    user: "operator",
    password: "whales123",
  };
}

// Build a normalized booking. `settings` supplies the current fleet + pricing.
export function mkBooking(b, settings) {
  const yachts = settings.yachts || [];
  const pricePerSeat = settings.pricePerSeat ?? 0;
  const y = yachts.find((x) => x.id === b.yachtId) || { charter: 0, rows: 0, cols: 0 };
  const seats = b.type === "charter" ? cap(y) : (b.seats && b.seats.length ? b.seats.length : b.groupSize || 1);
  const groupSize = b.type === "charter" ? (b.groupSize || cap(y)) : seats;
  const total = b.type === "charter" ? y.charter : seats * pricePerSeat;
  return {
    ref: b.ref || ("WW" + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(Math.random() * 90 + 10)),
    date: b.date, slot: b.slot, yachtId: b.yachtId, type: b.type,
    seats: b.seats || [], groupSize, total,
    customerName: b.customerName, phone: b.phone,
    channel: b.channel, agentName: b.agentName || "",
    status: b.status || "confirmed",
    createdAt: b.createdAt || Date.now(),
  };
}

export function seedBookings(settings) {
  const d0 = dayOffset(0), d1 = dayOffset(1), d2 = dayOffset(2), d3 = dayOffset(3), dm1 = dayOffset(-1), dm2 = dayOffset(-2);
  const raw = [
    { date: d0, slot: "0630", yachtId: "serenity", type: "seat", seats: ["A1", "A2", "A3", "B1", "B2"], customerName: "Perera Family", phone: "+94 77 123 4567", channel: "online" },
    { date: d0, slot: "0630", yachtId: "serenity", type: "seat", seats: ["D4", "D5"], customerName: "J. Fernando", phone: "+94 71 998 2210", channel: "agent", agentName: "Lanka Tours" },
    { date: d0, slot: "0930", yachtId: "marina", type: "charter", groupSize: 40, customerName: "Sunset Resort Group", phone: "+94 76 540 1188", channel: "agent", agentName: "Sunset Resort" },
    { date: d0, slot: "0630", yachtId: "voyager", type: "seat", seats: ["A1", "A2", "B1", "C3", "D2", "D3"], customerName: "Müller & friends", phone: "+49 152 22119", channel: "online" },
    { date: d0, slot: "0930", yachtId: "serenity", type: "seat", seats: ["A1", "A2"], customerName: "Silva Couple", phone: "+94 70 445 1200", channel: "online" },
    { date: d1, slot: "0630", yachtId: "serenity", type: "charter", groupSize: 44, customerName: "Ceylon Roots Retreat", phone: "+94 76 220 9911", channel: "agent", agentName: "Ceylon Roots" },
    { date: d1, slot: "0930", yachtId: "voyager", type: "seat", seats: ["A1", "A2", "A3", "B1"], customerName: "The Nguyen Party", phone: "+84 90 112 3344", channel: "online" },
    { date: d1, slot: "0930", yachtId: "marina", type: "seat", seats: ["C1", "C2", "C3", "C4"], customerName: "Wickramasinghe", phone: "+94 77 651 2098", channel: "agent", agentName: "Blue Ocean Travels" },
    { date: d2, slot: "0630", yachtId: "marina", type: "seat", seats: ["A1", "A2", "A3", "A4", "A5", "A6"], customerName: "Tanaka Group", phone: "+81 80 3312 7788", channel: "agent", agentName: "Global Getaways" },
    { date: d2, slot: "0630", yachtId: "voyager", type: "charter", groupSize: 30, customerName: "Bright Star School Trip", phone: "+94 71 300 5566", channel: "agent", agentName: "Lanka Tours" },
    { date: d2, slot: "0930", yachtId: "serenity", type: "seat", seats: ["B3", "B4"], customerName: "A. Bandara", phone: "+94 78 909 1123", channel: "online" },
    { date: d3, slot: "0630", yachtId: "serenity", type: "seat", seats: ["A1", "A2", "A3"], customerName: "Rossi Family", phone: "+39 340 556 7788", channel: "online" },
    { date: d3, slot: "0930", yachtId: "marina", type: "seat", seats: ["A1", "A2"], customerName: "K. Jayasuriya", phone: "+94 77 222 8890", channel: "online" },
    { date: dm1, slot: "0630", yachtId: "marina", type: "charter", groupSize: 48, customerName: "Horizon Cruises", phone: "+94 76 118 4400", channel: "agent", agentName: "Sunset Resort" },
    { date: dm1, slot: "0930", yachtId: "serenity", type: "seat", seats: ["A1", "A2", "A3", "A4"], customerName: "Dias Family", phone: "+94 70 771 3322", channel: "online" },
    { date: dm2, slot: "0630", yachtId: "voyager", type: "seat", seats: ["A1", "A2", "A3", "B1", "B2"], customerName: "Smith & Co.", phone: "+44 7700 900123", channel: "online" },
    { date: d1, slot: "0630", yachtId: "marina", type: "seat", seats: ["F1", "F2"], customerName: "Weather hold — Khan", phone: "+94 77 000 0000", channel: "online", status: "cancelled" },
    { date: d0, slot: "0930", yachtId: "voyager", type: "seat", seats: ["L1", "L2"], customerName: "No-show — Gupta", phone: "+91 98 7654 3210", channel: "agent", agentName: "Global Getaways", status: "cancelled" },
  ];
  return raw.map((b) => mkBooking(b, settings));
}

// Seat occupancy for one date+slot across the fleet (no customer PII).
export function computeAvailability(bookings, settings, date, slot) {
  return (settings.yachts || []).map((y) => {
    const rel = bookings.filter((b) => b.status === "confirmed" && b.date === date && b.slot === slot && b.yachtId === y.id);
    const chartered = rel.some((b) => b.type === "charter");
    const taken = [];
    rel.forEach((b) => (b.seats || []).forEach((s) => { if (!taken.includes(s)) taken.push(s); }));
    const remaining = chartered ? 0 : cap(y) - taken.length;
    return { yachtId: y.id, chartered, taken, remaining };
  });
}

// Strip sensitive fields for the public (customer) app.
export function publicSettings(s) {
  const { user, password, _id, ...pub } = s;
  return pub;
}
