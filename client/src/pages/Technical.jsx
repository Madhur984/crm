import { useState } from "react";
import { api } from "../api.js";
import { T, MONO, BORDER } from "../theme.js";
import { Card, Pill, Btn, Table, PageHeader } from "../components/ui.jsx";
import { Plus, Search, Send, Download } from "../icons.jsx";

const tabBar = { display: "flex", gap: 6, borderBottom: `2px solid ${T.edge}`, marginBottom: 18, flexWrap: "wrap" };
const tabStyle = (active) => ({
  padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: -2,
  color: active ? T.ink : T.faint, borderBottom: active ? `3px solid ${T.accent}` : "3px solid transparent",
});

export default function TechnicalPage({ proj, notify, reload }) {
  const [tab, setTab] = useState("BOM");
  const [q, setQ] = useState("");
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState(false);
  const tabs = ["BOM", "Datasheets & CAD", "Specifications", "Clarifications", "Approval History"];
  const filtered = proj.bom.filter((r) => (r.part + r.desc + r.id).toLowerCase().includes(q.toLowerCase()));

  const requestChange = async () => {
    try { await api.changeRequest(proj.id, "Customer requested a change to the technical baseline."); notify("Change request drafted"); reload(); }
    catch (e) { notify(e.message); }
  };

  const sendReply = async (c) => {
    const text = (replyText[c.dbId] || "").trim();
    if (!text) { notify("Type a reply first"); return; }
    setSending(true);
    try {
      await api.replyClarification(c.dbId, text);
      setReplyText((r) => ({ ...r, [c.dbId]: "" }));
      notify("Reply sent");
      reload();
    } catch (e) { notify(e.message); }
    finally { setSending(false); }
  };

  return (
    <>
      <PageHeader eyebrow={`${proj.code} · Baseline confirmed`} title="Technical Requirements"
        action={<Btn variant="secondary" icon={Plus} onClick={requestChange}>Request a change</Btn>} />
      <div style={tabBar}>
        {tabs.map((t) => (
          <div key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>{t}</div>
        ))}
      </div>

      {tab === "BOM" && (
        <Card title="Bill of Materials" action={
          <div className="rc-search" style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel, border: BORDER, borderRadius: 5, padding: "5px 10px" }}>
            <Search size={13} color={T.ink} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search part number or description"
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, width: 210, fontWeight: 500 }} />
          </div>
        }>
          <Table columns={["id", "part", "desc", "qty", "alt", "status"]} rows={filtered}
            renderCell={(r, c) => {
              if (c === "part") return <span style={{ fontFamily: MONO, fontWeight: 600 }}>{r.part}</span>;
              if (c === "status") return <Pill status={r.status} />;
              if (c === "qty") return <span style={{ fontFamily: MONO }}>{r.qty}</span>;
              return r[c];
            }} />
        </Card>
      )}

      {tab === "Datasheets & CAD" && (
        <Card title="Files by BOM Line">
          {proj.bom.map((r) => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.line}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: MONO }}>{r.part}</div>
                <div style={{ fontSize: 11.5, color: T.faint }}>Datasheet Rev 3 · Gerbers v2 · CAD v2</div>
              </div>
              <Btn small variant="ghost" icon={Download} onClick={() => notify(`Downloading files for ${r.part}`)}>Download</Btn>
            </div>
          ))}
        </Card>
      )}

      {tab === "Specifications" && (
        <Card title="Submitted Specifications">
          <div className="rc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
            {[["Operating Environment", "-40°C to 85°C, IP54"], ["Certification Targets", "RoHS, REACH, CE, UL"],
              ["Electrical Tolerance", "±2% on passive values"], ["Packaging", "Tape & reel, ESD-safe"]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
                <div style={{ fontSize: 13.5, marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Clarifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {proj.clarifications.map((c) => (
            <Card key={c.id} title={`${c.id} — ${c.subject}`} action={<Pill status={c.status} />}>
              {c.messages.map((m, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < c.messages.length - 1 ? `1px solid ${T.line}` : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{m.from} <span style={{ fontWeight: 400, color: T.faint, fontFamily: MONO }}>· {m.date}</span></div>
                  <div style={{ fontSize: 13, color: T.graphite, marginTop: 3 }}>{m.text}</div>
                </div>
              ))}
              {c.status === "Open" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input value={replyText[c.dbId] || ""} onChange={(e) => setReplyText((r) => ({ ...r, [c.dbId]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && sendReply(c)} placeholder="Type a reply..."
                    style={{ flex: 1, border: BORDER, borderRadius: 5, padding: "7px 10px", fontSize: 13, outline: "none", fontWeight: 500 }} />
                  <Btn small icon={Send} disabled={sending} onClick={() => sendReply(c)}>Send</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "Approval History" && (
        <Card title="Approval History">
          <Table columns={["version", "approver", "date"]}
            rows={[{ version: "Rev 3", approver: proj.contacts[0] ? proj.contacts[0].name : "—", date: "Mar 19, 2026" },
              { version: "Rev 2", approver: proj.contacts[0] ? proj.contacts[0].name : "—", date: "Mar 11, 2026" },
              { version: "Rev 1", approver: proj.contacts[0] ? proj.contacts[0].name : "—", date: "Mar 6, 2026" }]}
            renderCell={(r, c) => c === "version" ? <span style={{ fontFamily: MONO, fontWeight: 600 }}>{r[c]}</span> : r[c]} />
        </Card>
      )}
    </>
  );
}
