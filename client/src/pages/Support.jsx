import { useEffect, useState } from "react";
import { api } from "../api.js";
import { T, SANS, SH, BORDER } from "../theme.js";
import { Card, Pill, Btn, Table, PageHeader } from "../components/ui.jsx";
import { MeetingModal } from "../components/features.jsx";
import { Plus, Calendar, Video, MessageSquare, AlertTriangle, Phone, ChevronRight, X, Send } from "../icons.jsx";

export default function SupportPage({ proj, notify }) {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ category: "Technical", priority: "Normal", description: "" });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetingMode, setMeetingMode] = useState("Video call");
  const [meetings, setMeetings] = useState([]);

  const greeting = { sender: "Recon", text: "Hi — how can we help today?" };

  const loadMeetings = () => api.meetings().then(({ meetings }) => setMeetings(meetings)).catch(() => {});
  useEffect(() => {
    api.tickets().then(({ tickets }) => setTickets(tickets)).catch(() => {});
    api.messages({ channel: "support", projectId: proj.id })
      .then(({ messages }) => setChatMsgs(messages.map((m) => ({ sender: m.sender, text: m.text }))))
      .catch(() => {});
    loadMeetings();
  }, [proj.id]);

  const openMeeting = (mode) => { setMeetingMode(mode); setMeetingOpen(true); };

  const submitTicket = async () => {
    if (!form.description.trim()) { notify("Add a description before submitting"); return; }
    try {
      const { ticket } = await api.createTicket({ ...form, projectId: proj.id });
      setTickets((t) => [ticket, ...t]);
      setForm({ category: "Technical", priority: "Normal", description: "" });
      setTicketOpen(false);
      notify("Ticket submitted — you'll hear back shortly");
    } catch (e) { notify(e.message); }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    setChatMsgs((m) => [...m, { sender: "You", text }]);
    try {
      const { messages } = await api.sendMessage({ channel: "support", projectId: proj.id, text });
      // server echoes both the user msg and Recon reply; append only the Recon reply (user already shown)
      const reply = messages.find((m) => m.sender === "Recon");
      if (reply) setChatMsgs((m) => [...m, { sender: reply.sender, text: reply.text }]);
    } catch (e) { notify(e.message); }
  };

  const shownChat = chatMsgs.length ? chatMsgs : [greeting];

  return (
    <>
      <PageHeader eyebrow={proj.code} title="Support" />
      <div className="rc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {proj.reconTeam.map((m) => (
          <Card key={m.role}>
            <div style={{ width: 36, height: 36, borderRadius: 5, background: T.ink, border: `1.5px solid ${T.edge}`, boxShadow: SH.sm, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
              {m.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>{m.name}</div>
            <div style={{ fontSize: 11.5, color: T.faint, marginBottom: 8 }}>{m.role}</div>
            <div style={{ fontSize: 11, color: T.faint, marginBottom: 10 }}>Typically replies in {m.response}</div>
            <Btn small variant="secondary" icon={MessageSquare} onClick={() => setChatOpen(true)}>Message</Btn>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Btn icon={Plus} onClick={() => setTicketOpen(true)}>Raise a ticket</Btn>
        <Btn variant="secondary" icon={Calendar} onClick={() => openMeeting("Video call")}>Book a meeting</Btn>
        <Btn variant="secondary" icon={Video} onClick={() => openMeeting("Video call")}>Start video call</Btn>
        <Btn variant="secondary" icon={MessageSquare} onClick={() => setChatOpen(true)}>Chat</Btn>
      </div>

      {meetings.length > 0 && (
        <Card title="Your Meetings" style={{ marginBottom: 20 }}>
          <Table columns={["id", "topic", "mode", "date", "time", "status"]} rows={meetings}
            renderCell={(r, c) => c === "status" ? <Pill status={r[c]} /> : c === "id" ? <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{r[c]}</span> : (r[c] || "—")} />
        </Card>
      )}

      <Card style={{ marginBottom: 20, borderColor: T.amber, background: T.amberSoft }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={18} color={T.amber} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>Emergency contact (logistics & compliance, after hours)</div>
            <div style={{ fontSize: 12.5, color: T.graphite, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <Phone size={12} /> +1 (512) 555-0199 — for time-critical customs or shipment issues only
            </div>
          </div>
        </div>
      </Card>

      {tickets.length > 0 && (
        <Card title="Your Tickets" style={{ marginBottom: 20 }}>
          <Table columns={["id", "category", "priority", "status"]} rows={tickets}
            renderCell={(r, c) => c === "status" ? <Pill status={r[c]} /> : c === "id" ? <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{r[c]}</span> : r[c]} />
        </Card>
      )}

      <Card title="Knowledge Base">
        <div className="rc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {["Understanding your Procurement Confidence score", "How customs clearance works", "Reading your compliance package",
            "What happens during First Article Inspection", "How payment milestones are structured", "Requesting a BOM change"].map((f) => (
            <div key={f} onClick={() => notify("Opening article...")} className="rc-btn" style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px",
              border: BORDER, borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: "pointer", background: T.panel,
            }}>{f} <ChevronRight size={14} color={T.ink} /></div>
          ))}
        </div>
      </Card>

      {ticketOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 }}>
          <div style={{ background: "#fff", border: `1.5px solid ${T.edge}`, borderRadius: 5, boxShadow: SH.lg, padding: 24, width: 440, maxWidth: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: -0.2 }}>Raise a ticket</h3>
              <X size={18} style={{ cursor: "pointer" }} onClick={() => setTicketOpen(false)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: "uppercase", letterSpacing: 0.4 }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: "100%", marginTop: 5, padding: "8px 10px", border: BORDER, borderRadius: 5, fontSize: 13, fontWeight: 500 }}>
                  {["Technical", "Compliance", "Commercial", "Logistics", "General"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: "uppercase", letterSpacing: 0.4 }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{ width: "100%", marginTop: 5, padding: "8px 10px", border: BORDER, borderRadius: 5, fontSize: 13, fontWeight: 500 }}>
                  {["Low", "Normal", "High", "Urgent"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: "uppercase", letterSpacing: 0.4 }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                  style={{ width: "100%", marginTop: 5, padding: "8px 10px", border: BORDER, borderRadius: 5, fontSize: 13, resize: "vertical", fontFamily: SANS, fontWeight: 500 }} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                <Btn variant="secondary" onClick={() => setTicketOpen(false)}>Cancel</Btn>
                <Btn onClick={submitTicket}>Submit ticket</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {chatOpen && (
        <div style={{ position: "fixed", bottom: 16, right: 16, width: "min(322px, calc(100vw - 32px))", background: "#fff", border: `1.5px solid ${T.edge}`, borderRadius: 5, boxShadow: SH.lg, zIndex: 150, display: "flex", flexDirection: "column", maxHeight: "min(420px, 70vh)" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1.5px solid ${T.edge}`, background: T.ink, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>Recon Support</span>
            <X size={16} color="#fff" style={{ cursor: "pointer" }} onClick={() => setChatOpen(false)} />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {shownChat.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === "You" ? "flex-end" : "flex-start", background: m.sender === "You" ? T.accentDeep : T.panelAlt,
                color: m.sender === "You" ? "#fff" : T.ink, padding: "7px 11px", borderRadius: 5, border: `1.5px solid ${T.edge}`, fontSize: 12.5, fontWeight: 500, maxWidth: "80%",
              }}>{m.text}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, padding: 10, borderTop: `1.5px solid ${T.edge}` }}>
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a message..." style={{ flex: 1, border: BORDER, borderRadius: 5, padding: "7px 10px", fontSize: 12.5, outline: "none", fontWeight: 500 }} />
            <Btn small icon={Send} onClick={sendChat}>{""}</Btn>
          </div>
        </div>
      )}

      {meetingOpen && <MeetingModal proj={proj} notify={notify} onClose={() => setMeetingOpen(false)} onDone={loadMeetings} defaultMode={meetingMode} />}
    </>
  );
}
