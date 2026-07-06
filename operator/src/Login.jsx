import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { S } from "./lib/styles.js";

export default function Login({ authed, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  // Already signed in? Skip the form.
  useEffect(() => { if (authed) navigate(from, { replace: true }); }, [authed]);

  const submit = (e) => {
    e.preventDefault();
    if (onLogin(u, p)) navigate(from, { replace: true });
    else setErr("Incorrect username or password.");
  };

  return (
    <div className="fu" style={{ display: "grid", placeItems: "center", marginTop: 60 }}>
      <form onSubmit={submit} style={{ ...S.card, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 40, textAlign: "center" }}>🔒</div>
        <h2 className="display" style={{ fontSize: 24, textAlign: "center", margin: "6px 0 2px" }}>Operator sign in</h2>
        <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 0, fontSize: 14 }}>
          The dashboard is restricted to staff.
        </p>
        <div style={{ marginTop: 12 }}>
          <div className="label">Username</div>
          <input className="inp" autoFocus value={u} onChange={(e) => { setU(e.target.value); setErr(""); }} placeholder="operator" />
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="label">Password</div>
          <input className="inp" type="password" value={p} onChange={(e) => { setP(e.target.value); setErr(""); }} placeholder="••••••••" />
        </div>
        {err && <div style={{ color: "var(--bad)", fontSize: 13, marginTop: 10 }}>{err}</div>}
        <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 16 }}>Sign in</button>
        <p style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
          Demo credentials — <strong style={{ color: "var(--text)" }}>operator</strong> / <strong style={{ color: "var(--text)" }}>whales123</strong>
        </p>
      </form>
    </div>
  );
}
