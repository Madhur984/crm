import { useEffect, useState } from "react";
import { api } from "../api.js";
import { T, SANS } from "../theme.js";
import { Card, Pill, Btn, Table, PageHeader } from "../components/ui.jsx";
import { Plus, Calendar, Video, MessageSquare, AlertTriangle, Phone, ChevronRight, X, Send } from "../icons.jsx";

export default function SupportPage({ proj, notify }) {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ category: "Technical", priority: "Normal", description: "" });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const greeting = { sender: "Recon", text: "Hi — how can we help today?" };

  useEffect(() => {
    api.tickets().then(({ tickets }) => setTickets(tickets)).catch(() => {});
    api.messages({ channel: "support", projectId: proj.id })
      .then(({ messages }) => setChatMsgs(messages.map((m) => ({ sender: m.sender, text: m.text }))))
      .catch(() => {});
  }, [proj.id]);

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {proj.reconTeam.map((m) => (
          <Card key={m.role}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              {m.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.name}</div>
            <div style={{ fontSize: 11.5, color: T.faint, marginBottom: 8 }}>{m.role}</div>
            <div style={{ fontSize: 11, color: T.faint, marginBottom: 10 }}>Typically replies in {m.response}</div>
            <Btn small variant="secondary" icon={MessageSquare} onClick={() => setChatOpen(true)}>Message</Btn>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Btn icon={Plus} onClick={() => setTicketOpen(true)}>Raise a ticket</Btn>
        <Btn variant="secondary" icon={Calendar} onClick={() => notify("Opening scheduler...")}>Book a meeting</Btn>
        <Btn variant="secondary" icon={Video} onClick={() => notify("Starting video call...")}>Start video call</Btn>
        <Btn variant="secondary" icon={MessageSquare} onClick={() => setChatOpen(true)}>Chat</Btn>
      </div>

      <Card style={{ marginBottom: 20, borderColor: T.amber, background: T.amberSoft }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={18} color={T.amber} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Emergency contact (logistics & compliance, after hours)</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {["Understanding your Procurement Confidence score", "How customs clearance works", "Reading your compliance package",
            "What happens during First Article Inspection", "How payment milestones are structured", "Requesting a BOM change"].map((f) => (
            <div key={f} onClick={() => notify("Opening article...")} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px",
              border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 13, cursor: "pointer",
            }}>{f} <ChevronRight size={14} color={T.faint} /></div>
          ))}
        </div>
      </Card>

      {ticketOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,12,16,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Raise a ticket</h3>
              <X size={18} style={{ cursor: "pointer" }} onClick={() => setTicketOpen(false)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: "100%", marginTop: 5, padding: "8px 10px", border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 13 }}>
                  {["Technical", "Compliance", "Commercial", "Logistics", "General"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{ width: "100%", marginTop: 5, padding: "8px 10px", border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 13 }}>
                  {["Low", "Normal", "High", "Urgent"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                  style={{ width: "100%", marginTop: 5, padding: "8px 10px", border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 13, resize: "vertical", fontFamily: SANS }} />
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
        <div style={{ position: "fixed", bottom: 20, right: 20, width: 320, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,.18)", zIndex: 150, display: "flex", flexDirection: "column", maxHeight: 420 }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Recon Support</span>
            <X size={16} style={{ cursor: "pointer" }} onClick={() => setChatOpen(false)} />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {shownChat.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === "You" ? "flex-end" : "flex-start", background: m.sender === "You" ? T.ink : T.mist,
                color: m.sender === "You" ? "#fff" : T.ink, padding: "7px 11px", borderRadius: 10, fontSize: 12.5, maxWidth: "80%",
              }}>{m.text}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, padding: 10, borderTop: `1px solid ${T.line}` }}>
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a message..." style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: 7, padding: "7px 10px", fontSize: 12.5, outline: "none" }} />
            <Btn small icon={Send} onClick={sendChat}>{""}</Btn>
          </div>
        </div>
      )}
    </>
  );
}
