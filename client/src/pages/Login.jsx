import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { T, SANS, MONO, SH, BORDER } from "../theme.js";
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
    width: "100%", marginTop: 6, padding: "10px 12px", border: BORDER,
    borderRadius: 5, fontSize: 14, outline: "none", fontFamily: SANS, fontWeight: 500,
  };

  return (
    <div style={{ fontFamily: SANS, minHeight: "100vh", background: T.mist, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 400, background: T.panel, border: BORDER, borderRadius: 8, padding: 32, boxShadow: SH.lg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 26 }}>
          <div style={{ width: 34, height: 34, borderRadius: 5, background: T.accent, border: `1.5px solid ${T.edge}`, boxShadow: SH.sm, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 13, height: 13, background: "#fff", transform: "rotate(45deg)" }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: T.ink }}>Recon Core</div>
            <div style={{ fontSize: 9, color: T.faint, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>Customer Portal</div>
          </div>
        </div>

        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>Sign in</h1>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: T.faint, fontWeight: 600 }}>Access your procurement projects.</p>

        <form onSubmit={submit}>
          <label style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: "uppercase", letterSpacing: 0.4 }}>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" style={field} />
          </label>
          <div style={{ height: 14 }} />
          <label style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: "uppercase", letterSpacing: 0.4 }}>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" style={field} />
          </label>

          {err && <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, color: T.amber, background: T.amberSoft, border: `1.5px solid ${T.amber}`, borderRadius: 5, padding: "8px 11px" }}>{err}</div>}

          <Btn type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "12px 14px" }}>
            {busy ? "Signing in…" : "Sign in"}
          </Btn>
        </form>

        <div style={{ marginTop: 20, padding: "10px 12px", background: T.panelAlt, border: `1.5px solid ${T.edge}`, borderRadius: 5, fontSize: 11.5, color: T.graphite }}>
          <div style={{ fontWeight: 800, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>Demo credentials</div>
          <div style={{ fontFamily: MONO, fontWeight: 600 }}>demo@reconcore.app · recon1234</div>
        </div>
      </div>
    </div>
  );
}
