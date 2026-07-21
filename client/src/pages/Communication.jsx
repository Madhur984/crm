import { useEffect, useState } from "react";
import { api } from "../api.js";
import { T, catStyle, SH, BORDER } from "../theme.js";
import { Card, Btn, PageHeader, CatChip } from "../components/ui.jsx";
import { MeetingModal } from "../components/features.jsx";
import { Send, Paperclip, Calendar } from "../icons.jsx";

export default function CommunicationPage({ proj, notify }) {
  const [filterCat, setFilterCat] = useState("All");
  const [replies, setReplies] = useState({}); // { [refId]: [{sender,text}] }
  const [drafts, setDrafts] = useState({});   // { [refId]: text }
  const [meetingOpen, setMeetingOpen] = useState(false);
  const cats = ["All", "Technical", "Compliance", "Commercial", "Logistics", "General"];
  const events = proj.activity.filter((a) => filterCat === "All" || a.cat === filterCat);

  useEffect(() => {
    api.messages({ channel: "activity", projectId: proj.id }).then(({ messages }) => {
      const grouped = {};
      for (const m of messages) {
        if (!m.refId) continue;
        (grouped[m.refId] = grouped[m.refId] || []).push({ sender: m.sender, text: m.text });
      }
      setReplies(grouped);
    }).catch(() => {});
  }, [proj.id]);

  const sendReply = async (eventId) => {
    const text = (drafts[eventId] || "").trim();
    if (!text) { notify("Type a reply first"); return; }
    try {
      const { messages } = await api.sendMessage({ channel: "activity", projectId: proj.id, refId: String(eventId), text });
      setReplies((r) => ({ ...r, [eventId]: [...(r[eventId] || []), ...messages.map((m) => ({ sender: m.sender, text: m.text }))] }));
      setDrafts((d) => ({ ...d, [eventId]: "" }));
      notify("Reply sent");
    } catch (e) { notify(e.message); }
  };

  return (
    <>
      <PageHeader eyebrow={proj.code} title="Communication Centre"
        action={<Btn variant="secondary" icon={Calendar} onClick={() => setMeetingOpen(true)}>Schedule a meeting</Btn>} />
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {cats.map((c) => (
          <div key={c} onClick={() => setFilterCat(c)} className="rc-btn" style={{
            padding: "7px 12px", borderRadius: 5, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: BORDER,
            background: filterCat === c ? T.ink : T.panel, color: filterCat === c ? "#fff" : T.graphite,
            boxShadow: filterCat === c ? SH.sm : "none",
          }}>{c}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {events.map((e, i) => (
          <div key={e.id} style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 13, height: 13, borderRadius: 5, background: catStyle(e.cat).fg, border: `1.5px solid ${T.edge}`, marginTop: 6, flexShrink: 0 }} />
              {i < events.length - 1 && <div style={{ width: 2, flex: 1, background: T.edge, minHeight: 40 }} />}
            </div>
            <Card style={{ flex: 1, marginBottom: 14 }} hover>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                <div>
                  <CatChip cat={e.cat} />
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 6 }}>{e.head}</div>
                </div>
                <span style={{ fontSize: 11.5, color: T.faint, fontFamily: "ui-monospace, monospace" }}>{e.time}</span>
              </div>
              <p style={{ fontSize: 13, color: T.graphite, margin: "8px 0 0" }}>{e.notes}</p>
              <div style={{ fontSize: 11.5, color: T.faint, marginTop: 6 }}>— {e.owner}</div>
              {e.attach.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {e.attach.map((f) => (
                    <div key={f} onClick={() => notify(`Downloading ${f}`)} className="rc-btn" style={{
                      display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, background: T.panelAlt, padding: "5px 9px", borderRadius: 5, border: `1.5px solid ${T.edge}`, cursor: "pointer",
                    }}><Paperclip size={11} /> {f}</div>
                  ))}
                </div>
              )}
              {(replies[e.id] || []).map((r, ri) => (
                <div key={ri} style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{r.sender}</div>
                  <div style={{ fontSize: 13, color: T.graphite }}>{r.text}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input value={drafts[e.id] || ""} onChange={(ev) => setDrafts((d) => ({ ...d, [e.id]: ev.target.value }))}
                  onKeyDown={(ev) => ev.key === "Enter" && sendReply(e.id)} placeholder="Reply to this update..."
                  style={{ flex: 1, border: BORDER, borderRadius: 5, padding: "7px 10px", fontSize: 12.5, outline: "none", fontWeight: 500 }} />
                <Btn small icon={Send} onClick={() => sendReply(e.id)}>Reply</Btn>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {meetingOpen && <MeetingModal proj={proj} notify={notify} onClose={() => setMeetingOpen(false)} />}
    </>
  );
}
