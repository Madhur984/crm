import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { T, SANS, MONO } from "../theme.js";
import { Btn } from "../components/ui.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@reconcore.app");
  const [password, setPassword] = useState("recon1234");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/app");
    } catch (ex) {
      setErr(ex.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const field = {
    width: "100%", marginTop: 6, padding: "10px 12px", border: `1px solid ${T.line}`,
    borderRadius: 8, fontSize: 14, outline: "none", fontFamily: SANS,
  };

  return (
    <div style={{ fontFamily: SANS, minHeight: "100vh", background: T.mist, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 400, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, padding: 32, boxShadow: "0 12px 40px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 12, height: 12, background: T.accentBright, transform: "rotate(45deg)", borderRadius: 2 }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.2, color: T.ink }}>Recon Core</div>
            <div style={{ fontSize: 10, color: T.faint, letterSpacing: 0.4, textTransform: "uppercase" }}>Customer Portal</div>
          </div>
        </div>

        <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: T.ink }}>Sign in</h1>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: T.faint }}>Access your procurement projects.</p>

        <form onSubmit={submit}>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.graphite }}>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" style={field} />
          </label>
          <div style={{ height: 14 }} />
          <label style={{ fontSize: 12, fontWeight: 700, color: T.graphite }}>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" style={field} />
          </label>

          {err && <div style={{ marginTop: 14, fontSize: 12.5, color: T.amber, background: T.amberSoft, borderRadius: 7, padding: "8px 11px" }}>{err}</div>}

          <Btn type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "11px 14px" }}>
            {busy ? "Signing in…" : "Sign in"}
          </Btn>
        </form>

        <div style={{ marginTop: 20, padding: "10px 12px", background: T.mist, borderRadius: 8, fontSize: 11.5, color: T.graphite }}>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>Demo credentials</div>
          <div style={{ fontFamily: MONO }}>demo@reconcore.app · recon1234</div>
        </div>
      </div>
    </div>
  );
}
