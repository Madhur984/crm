import { useState } from "react";
import { api } from "../api.js";
import { T } from "../theme.js";
import { Modal, Field, Btn, inputStyle } from "./ui.jsx";

export function MeetingModal({ proj, onClose, notify, onDone, defaultMode = "Video call" }) {
  const [form, setForm] = useState({ topic: "", mode: defaultMode, date: "", time: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.topic.trim()) { notify("Add a topic first"); return; }
    setBusy(true);
    try {
      const { meeting } = await api.createMeeting({ ...form, projectId: proj.id });
      notify(`Meeting requested — ${meeting.id}`);
      onDone && onDone(meeting);
      onClose();
    } catch (e) { notify(e.message); } finally { setBusy(false); }
  };

  return (
    <Modal title="Request a meeting" subtitle={`${proj.code} · ${proj.name}`} onClose={onClose}>
      <Field label="Topic"><input value={form.topic} onChange={set("topic")} placeholder="e.g. Review manufacturing timeline" style={inputStyle} /></Field>
      <Field label="Type">
        <select value={form.mode} onChange={set("mode")} style={inputStyle}>
          {["Video call", "Phone call", "In person"].map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Preferred date"><input type="date" value={form.date} onChange={set("date")} style={inputStyle} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Preferred time"><input type="time" value={form.time} onChange={set("time")} style={inputStyle} /></Field></div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn disabled={busy} onClick={submit}>Request meeting</Btn>
      </div>
    </Modal>
  );
}

export function UploadModal({ proj, onClose, notify, onDone }) {
  const [form, setForm] = useState({ name: "", type: "Datasheet" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) { notify("Add a document name"); return; }
    setBusy(true);
    try {
      const { document } = await api.uploadDocument(proj.id, form);
      notify(`Uploaded — ${document.name}`);
      onDone && onDone(document);
      onClose();
    } catch (e) { notify(e.message); } finally { setBusy(false); }
  };

  return (
    <Modal title="Upload a document" subtitle={`Attach to ${proj.name}`} onClose={onClose}>
      <Field label="Document name"><input value={form.name} onChange={set("name")} placeholder="e.g. Updated BOM Rev 4" style={inputStyle} /></Field>
      <Field label="Type">
        <select value={form.type} onChange={set("type")} style={inputStyle}>
          {["Datasheet", "BOM", "Drawing", "Certificate", "Purchase Order", "Specification", "Other"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <div style={{ fontSize: 11.5, color: T.faint, marginBottom: 14 }}>The document reference is recorded against your project and the Recon team is notified.</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn disabled={busy} onClick={submit}>Upload</Btn>
      </div>
    </Modal>
  );
}
