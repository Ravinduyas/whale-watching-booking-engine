/* OVERVIEW TAB — day snapshot: KPIs, per-yacht occupancy, today's bookings. */
import { useState } from "react";
import { cap, todayStr } from "../lib/config.js";
import { PageHead, Stat, Chip, EmptyState } from "../components/ui.jsx";

export default function Overview({ settings, bookings, money, cancelBooking }) {
  const { yachts, slots } = settings;
  const [date, setDate] = useState(todayStr());

  const active = bookings.filter((b) => b.status === "confirmed");
  const dayB = active.filter((b) => b.date === date);

  const seatsSold = dayB.reduce((n, b) => n + (b.type === "charter" ? b.groupSize : b.seats.length || b.groupSize), 0);
  const revenue = dayB.reduce((n, b) => n + b.total, 0);
  const online = dayB.filter((b) => b.channel === "online").length;
  const agent = dayB.filter((b) => b.channel === "agent").length;
  const tot = dayB.length || 1;
  const pct = (n) => Math.round((n / tot) * 100);
  const yachtName = (id) => (yachts.find((y) => y.id === id) || {}).name || id;
  const slotLabel = (id) => (slots.find((s) => s.id === id) || {}).label || id;

  return (
    <div className="fu" style={{ marginTop: 22, display: "grid", gap: 20 }}>
      <PageHead
        title="Overview"
        subtitle="Day snapshot across the fleet"
        right={<input className="inp" style={{ width: 172 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
      />

      {/* KPI cards */}
      <div className="kpi-grid">
        <Stat icon="🧾" accent="blue" label="Bookings" value={dayB.length} />
        <Stat icon="👥" accent="aqua" label="Guests booked" value={seatsSold} />
        <Stat icon="💰" accent="green" label="Revenue" value={money(revenue)} />
        <Stat icon="🔀" accent="violet" label="Online / Agent" value={`${pct(online)}% / ${pct(agent)}%`} sub={`${online} online · ${agent} agent`} />
      </div>

      {/* occupancy */}
      <section className="panel">
        <div className="panel-h">Yacht occupancy</div>
        <div style={{ display: "grid", gap: 18 }}>
          {slots.map((s) => (
            <div key={s.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>· {s.tag} departure</span>
              </div>
              <div style={{ display: "grid", gap: 9 }}>
                {yachts.map((y) => {
                  const rel = active.filter((b) => b.date === date && b.slot === s.id && b.yachtId === y.id);
                  const chartered = rel.some((b) => b.type === "charter");
                  const used = chartered ? cap(y) : rel.reduce((n, b) => n + (b.seats.length || b.groupSize || 0), 0);
                  const p = cap(y) ? Math.round((used / cap(y)) * 100) : 0;
                  const tone = chartered ? "violet" : p >= 85 ? "green" : p >= 40 ? "blue" : p > 0 ? "aqua" : "slate";
                  const fill = chartered ? "var(--coral)" : "var(--sun)";
                  return (
                    <div key={y.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 96, fontSize: 13.5, fontWeight: 500 }}>{y.name}</span>
                      <div className="occ-track">
                        <div className="occ-fill" style={{ width: `${chartered ? 100 : p}%`, background: fill }} />
                      </div>
                      <span style={{ width: 92, textAlign: "right" }}>
                        <Chip tone={tone}>{chartered ? "Chartered" : `${used}/${cap(y)}`}</Chip>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* today's bookings */}
      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div className="panel-h" style={{ marginBottom: 0 }}>Bookings</div>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{date}</span>
        </div>
        {dayB.length === 0 && <EmptyState icon="🐋" title="No bookings for this date" hint="Pick another date, or add one from the Bookings tab." />}
        <div className="admin-list">
          {dayB.slice().sort((a, b) => a.slot.localeCompare(b.slot)).map((b) => (
            <div key={b.ref} className="brow">
              <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--teal)", width: 82 }}>{b.ref}</span>
              <span style={{ flex: "1 1 130px", fontWeight: 600 }}>{b.customerName}</span>
              <span className="hide-sm" style={{ fontSize: 13, color: "var(--muted)", width: 150 }}>{yachtName(b.yachtId)} · {slotLabel(b.slot)}</span>
              <Chip tone={b.type === "charter" ? "blue" : "aqua"}>{b.type === "charter" ? `Charter · ${b.groupSize}` : `${b.seats.length || b.groupSize} seats`}</Chip>
              <Chip tone={b.channel === "agent" ? "amber" : "slate"}>{b.channel === "agent" ? `🤝 ${b.agentName || "Agent"}` : "🌐 Online"}</Chip>
              <span style={{ width: 86, textAlign: "right", fontWeight: 700 }}>{money(b.total)}</span>
              <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => cancelBooking(b.ref)}>Cancel</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
