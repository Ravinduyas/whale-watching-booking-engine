/* Shared style object + global CSS, used across booking and operator modules. */
export const S = {
  page: { minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Outfit', sans-serif" },
  wrap: { maxWidth: 1080, margin: "0 auto", padding: "0 20px 80px" },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 },
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Outfit:wght@300;400;500;600;700&display=swap');
  :root{
    --bg:#ffffff; --surface:#f4f8ff; --surface2:#e6f0fd; --border:rgba(10,37,64,.14);
    --line:rgba(10,37,64,.09); --text:#0c2748; --muted:rgba(12,39,72,.60);
    --teal:#0891b2; --coral:#2563eb; --amber:#0ea5e9; --good:#16a34a; --bad:#e11d48;
    --sun:linear-gradient(135deg,#3b82f6,#2563eb);
  }
  *{box-sizing:border-box} body{margin:0}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .fu{animation:fadeUp .55s ease both}
  .display{font-family:'Fraunces',serif}
  .pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:5px 11px;border-radius:999px}
  .seat{width:30px;height:30px;border-radius:8px 8px 7px 7px;border:1px solid var(--line);
    background:var(--surface2);cursor:pointer;transition:transform .12s,background .15s,box-shadow .15s;
    font-size:9px;color:var(--muted);display:flex;align-items:center;justify-content:center}
  .seat:hover:not(.taken){transform:translateY(-2px);box-shadow:0 4px 12px rgba(13,39,72,.18)}
  .seat.sel{background:var(--sun);color:#ffffff;border-color:transparent;font-weight:600}
  .seat.taken{background:rgba(10,37,64,.10);cursor:not-allowed;opacity:.55;color:transparent}
  .ycard{transition:transform .15s,border-color .15s,box-shadow .15s;cursor:pointer}
  .ycard:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(13,39,72,.16)}
  .btn{font-family:inherit;font-size:15px;font-weight:600;border:none;border-radius:12px;
    padding:14px 18px;cursor:pointer;transition:transform .12s,opacity .15s}
  .btn:active{transform:scale(.98)}
  .btn-primary{background:var(--sun);color:#ffffff}
  .btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border)}
  .inp{width:100%;font-family:inherit;font-size:15px;background:var(--bg);color:var(--text);
    border:1px solid var(--border);border-radius:11px;padding:12px 14px;outline:none}
  .inp:focus{border-color:var(--teal)}
  .seg{display:flex;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:4px;gap:4px}
  .seg button{flex:1;border:none;background:transparent;color:var(--muted);font-family:inherit;
    font-size:14px;font-weight:600;padding:10px;border-radius:9px;cursor:pointer;transition:.15s}
  .seg button.on{background:var(--surface2);color:var(--text)}
  .navlink{background:none;border:none;color:var(--muted);font-family:inherit;font-size:15px;
    font-weight:600;cursor:pointer;padding:8px 4px;border-bottom:2px solid transparent;
    text-decoration:none;display:inline-block}
  .navlink.on{color:var(--text);border-color:var(--coral)}
  .label{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:9px;font-weight:600}
  a{color:var(--teal)}
  /* responsive layout */
  .book-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:22px;align-items:start}
  .summary{position:sticky;top:18px}
  .guest-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .site-header-inner{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
  .site-nav{display:flex;gap:22px;align-items:center;flex-wrap:wrap}
  @media(max-width:760px){
    .hide-sm{display:none}
    .book-grid{grid-template-columns:1fr}
    .summary{position:static}
    .site-nav{gap:14px}
  }
  @media(max-width:560px){
    .guest-grid{grid-template-columns:1fr}
  }
`;
