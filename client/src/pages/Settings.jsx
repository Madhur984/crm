import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { T, MONO } from "../theme.js";
import { Card, Btn, PageHeader, Field, inputStyle } from "../components/ui.jsx";
import { LogOut } from "../icons.jsx";

export default function SettingsPage({ notify }) {
  const { user, org, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async () => {
    if (!profile.name.trim()) { notify("Name can't be empty"); return; }
    setSavingProfile(true);
    try { await api.updateProfile(profile); await refreshUser(); notify("Profile updated"); }
    catch (e) { notify(e.message); } finally { setSavingProfile(false); }
  };

  const savePassword = async () => {
    if (pw.next !== pw.confirm) { notify("New passwords don't match"); return; }
    if (pw.next.length < 6) { notify("New password must be at least 6 characters"); return; }
    setSavingPw(true);
    try {
      await api.changePassword({ current: pw.current, next: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      notify("Password changed");
    } catch (e) { notify(e.message); } finally { setSavingPw(false); }
  };

  const readonly = { ...inputStyle, background: T.mist, color: T.graphite };

  return (
    <>
      <PageHeader eyebrow="Your account" title="Account Settings" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <Card title="Profile">
          <Field label="Full name"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={inputStyle} /></Field>
          <Field label="Phone"><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Optional" style={inputStyle} /></Field>
          <Field label="Email"><input value={user?.email || ""} readOnly style={readonly} /></Field>
          <Field label="Role"><input value={user?.role || ""} readOnly style={readonly} /></Field>
          <Btn disabled={savingProfile} onClick={saveProfile}>Save profile</Btn>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Change password">
            <Field label="Current password"><input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} style={inputStyle} /></Field>
            <Field label="New password"><input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} style={inputStyle} /></Field>
            <Field label="Confirm new password"><input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} style={inputStyle} /></Field>
            <Btn disabled={savingPw} onClick={savePassword}>Update password</Btn>
          </Card>

          <Card title="Organization">
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
              <span style={{ color: T.faint }}>Company</span><span style={{ fontWeight: 600 }}>{org?.name || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
              <span style={{ color: T.faint }}>Account ID</span><span style={{ fontFamily: MONO, fontSize: 12 }}>{user?.orgId?.slice(0, 12) || "—"}</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <Btn variant="secondary" icon={LogOut} onClick={() => { logout(); navigate("/login"); }}>Sign out</Btn>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
