import { Legend } from "../components/ui.jsx";

export default function SeatMap({ yacht, avail, picked, toggle, seatIds }) {
  const ids = seatIds(yacht);
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
        <Legend c="var(--surface2)" t="Available" />
        <Legend grad t="Selected" />
        <Legend c="rgba(10,37,64,.10)" t="Booked" />
      </div>
      <div style={{ display: "inline-block", padding: "10px 14px 16px", border: "1px solid var(--line)", borderRadius: "40px 40px 14px 14px", background: "rgba(37,99,235,.06)" }}>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginBottom: 10, letterSpacing: ".15em" }}>▲ BOW (front)</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${yacht.cols}, 30px)`, gap: 7, justifyContent: "center" }}>
          {ids.map((id) => {
            const taken = avail.taken.has(id) || avail.chartered;
            const sel = picked.includes(id);
            return (
              <div key={id} className={`seat ${sel ? "sel" : ""} ${taken ? "taken" : ""}`} onClick={() => toggle(id, taken)} title={id}>{id}</div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 10, letterSpacing: ".15em" }}>STERN ▼</div>
      </div>
    </div>
  );
}
