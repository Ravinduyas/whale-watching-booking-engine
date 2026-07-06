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
    --rail:#eaf2ff; --track:rgba(10,37,64,.08);
  }
  :root[data-theme="dark"]{
    --bg:#0b1626; --surface:#132339; --surface2:#1c3151; --border:rgba(255,255,255,.13);
    --line:rgba(255,255,255,.08); --text:#e8f1ff; --muted:rgba(232,241,255,.60);
    --teal:#38bdf8; --coral:#60a5fa; --amber:#38bdf8; --good:#34d399; --bad:#fb7185;
    --sun:linear-gradient(135deg,#3b82f6,#2563eb);
    --rail:#0f2036; --track:rgba(255,255,255,.10);
  }
  *{box-sizing:border-box} body{margin:0}
  html,body{background:var(--bg)}
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
  .field-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
  .admin-list{display:grid;gap:10px}
  /* admin building blocks */
  .panel{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px}
  .panel-h{font-size:15px;font-weight:700;letter-spacing:-.01em;margin-bottom:14px}
  .kpi-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
  .kpi{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:15px;display:flex;gap:12px;align-items:flex-start}
  .kpi-ic{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;font-size:18px;flex-shrink:0}
  .kpi-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
  .kpi-val{font-size:24px;font-weight:700;line-height:1.1;margin-top:3px;letter-spacing:-.01em}
  .kpi-sub{font-size:12px;color:var(--muted);margin-top:2px}
  .brow{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--bg);border:1px solid var(--line);border-radius:12px;flex-wrap:wrap;transition:border-color .15s,box-shadow .15s}
  .brow:hover{border-color:var(--border);box-shadow:0 3px 14px rgba(13,39,72,.07)}
  .chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 9px;border-radius:999px;white-space:nowrap}
  .occ-track{flex:1;height:9px;background:var(--track);border-radius:6px;overflow:hidden;min-width:80px}
  .occ-fill{height:100%;border-radius:6px;transition:width .4s}
  .iconbtn{background:none;border:1px solid var(--border);border-radius:9px;width:32px;height:32px;display:grid;place-items:center;cursor:pointer;color:var(--muted);font-size:14px;transition:.15s}
  .iconbtn:hover{color:var(--text);border-color:var(--muted)}
  /* toasts */
  .toasts{position:fixed;right:18px;bottom:18px;display:grid;gap:10px;z-index:90;width:min(340px,calc(100vw - 36px))}
  .toast{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--border);
    border-radius:12px;padding:12px 12px 12px 14px;box-shadow:0 10px 30px rgba(2,10,25,.22);font-size:14px}
  .toast .msg{flex:1;min-width:0}
  .toast .undo{background:none;border:none;color:var(--coral);font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;padding:4px 6px;white-space:nowrap}
  @keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .toast{animation:toastIn .25s ease both}
  /* modal */
  .overlay{position:fixed;inset:0;background:rgba(4,14,30,.55);backdrop-filter:blur(5px);display:grid;place-items:center;padding:20px;z-index:70}
  .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px;width:100%;box-shadow:0 24px 60px rgba(2,10,25,.35)}
  /* empty state */
  .empty{text-align:center;padding:38px 20px;color:var(--muted)}
  .empty .ico{font-size:36px}
  /* theme toggle */
  .theme-toggle{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:11px;border:1px solid transparent;
    background:none;color:var(--muted);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;text-align:left;width:100%}
  .theme-toggle:hover{background:var(--surface2)}
  .sidebar-bottom{margin-top:auto;display:grid;gap:4px}
  @media(max-width:760px){.sidebar-bottom{margin-top:0;margin-left:auto;display:flex;gap:4px}}
  /* sidebar admin shell */
  .admin-shell{display:flex;align-items:stretch;min-height:100vh}
  .sidebar{width:232px;flex-shrink:0;box-sizing:border-box;display:flex;flex-direction:column;gap:5px;
    padding:20px 14px;border-right:1px solid var(--line);position:sticky;top:0;height:100vh;
    background:linear-gradient(180deg,var(--rail),transparent)}
  .sidebar .brand{display:flex;align-items:center;gap:10px;padding:2px 8px 14px}
  .sidebar-link{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:11px;border:1px solid transparent;
    color:var(--muted);font-family:inherit;font-size:15px;font-weight:600;text-decoration:none;cursor:pointer;background:none;text-align:left}
  .sidebar-link:hover{background:var(--surface2)}
  .sidebar-link.on{background:var(--surface2);color:var(--text);border-color:var(--border)}
  .sidebar-link .ic{font-size:17px;width:22px;text-align:center}
  .admin-main{flex:1;min-width:0}
  .admin-main-inner{max-width:1000px;margin:0 auto;padding:0 24px 80px}
  @media(max-width:760px){
    .hide-sm{display:none}
    .book-grid{grid-template-columns:1fr}
    .summary{position:static}
    .site-nav{gap:14px}
    .admin-shell{flex-direction:column}
    .sidebar{width:auto;height:auto;position:static;flex-direction:row;overflow-x:auto;gap:6px;
      border-right:none;border-bottom:1px solid var(--line);align-items:center;padding:10px 12px}
    .sidebar .brand{display:none}
    .sidebar-link{white-space:nowrap;padding:9px 13px}
    .sidebar-logout{margin-left:auto}
    .admin-main-inner{padding:0 18px 70px}
  }
  @media(max-width:560px){
    .guest-grid{grid-template-columns:1fr}
  }
`;
