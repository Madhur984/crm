import { useEffect, useState } from "react";
import { api } from "../api.js";
import { T } from "../theme.js";
import { Card, Btn, PageHeader } from "../components/ui.jsx";
import { Send, Paperclip, Calendar } from "../icons.jsx";

export default function CommunicationPage({ proj, notify }) {
  const [filterCat, setFilterCat] = useState("All");
  const [replies, setReplies] = useState({}); // { [refId]: [{sender,text}] }
  const [drafts, setDrafts] = useState({});   // { [refId]: text }
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
        action={<Btn variant="secondary" icon={Calendar} onClick={() => notify("Opening scheduler...")}>Schedule a meeting</Btn>} />
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {cats.map((c) => (
          <div key={c} onClick={() => setFilterCat(c)} style={{
            padding: "7px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            background: filterCat === c ? T.ink : T.mist, color: filterCat === c ? "#fff" : T.graphite, border: `1px solid ${filterCat === c ? T.ink : T.line}`,
          }}>{c}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {events.map((e, i) => (
          <div key={e.id} style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: T.blue, marginTop: 6, flexShrink: 0 }} />
              {i < events.length - 1 && <div style={{ width: 2, flex: 1, background: T.line, minHeight: 40 }} />}
            </div>
            <Card style={{ flex: 1, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.blue, textTransform: "uppercase" }}>{e.cat}</span>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 3 }}>{e.head}</div>
                </div>
                <span style={{ fontSize: 11.5, color: T.faint, fontFamily: "ui-monospace, monospace" }}>{e.time}</span>
              </div>
              <p style={{ fontSize: 13, color: T.graphite, margin: "8px 0 0" }}>{e.notes}</p>
              <div style={{ fontSize: 11.5, color: T.faint, marginTop: 6 }}>— {e.owner}</div>
              {e.attach.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {e.attach.map((f) => (
                    <div key={f} onClick={() => notify(`Downloading ${f}`)} style={{
                      display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: T.mist, padding: "5px 9px", borderRadius: 6, cursor: "pointer",
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
                  style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: 6, padding: "7px 10px", fontSize: 12.5, outline: "none" }} />
                <Btn small icon={Send} onClick={() => sendReply(e.id)}>Reply</Btn>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
