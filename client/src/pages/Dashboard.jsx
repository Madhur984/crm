import { useState } from "react";
import { api } from "../api.js";
import { T, MONO, STAGES, catStyle, SH, BORDER } from "../theme.js";
import { Card, Pill, Ring, Btn, LifecycleRail, PageHeader, StatTile } from "../components/ui.jsx";
import { MeetingModal } from "../components/features.jsx";
import { downloadText, projectSummaryText } from "../download.js";
import { Download, CheckCircle2, MessageSquare, Calendar, FolderKanban, Radar, ShieldCheck } from "../icons.jsx";

export default function DashboardPage({ proj, allProjects, go, notify, reload }) {
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const pending = proj.id === "p2"
    ? [{ text: "Approve second-source qualification for nRF9160 (RF module)", cta: "Approve" }]
    : [];

  const railItems = proj.stageDates.map((d, i) => ({ label: STAGES[i], date: d.date, status: d.status, team: d.team }));
  const onTrack = proj.status === "On Track";

  const exportSummary = () => {
    downloadText(`${proj.code}-summary.txt`, projectSummaryText(proj));
    notify("Summary downloaded");
  };
  const quickDownload = (label) => {
    const text = `${label.toUpperCase()}\n${proj.code} · ${proj.name}\nGenerated ${new Date().toLocaleString()}\n\nThis export was generated from your live project data in the customer portal.`;
    downloadText(`${proj.code}-${label.replace(/\s+/g, "-").toLowerCase()}.txt`, text);
    notify(`Downloaded ${label}`);
  };
  const approve = async (p) => {
    setApproving(true);
    try {
      await api.approve(proj.id, { label: "Second-source qualification approved", note: p.text });
      notify("Approved — Recon has been notified");
      reload();
    } catch (e) { notify(e.message); } finally { setApproving(false); }
  };

  return (
    <>
      <PageHeader eyebrow={`${proj.code} · ${proj.name}`} title="Dashboard"
        action={<Btn variant="secondary" icon={Download} onClick={exportSummary}>Export summary</Btn>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="rc-card rc-card-hover" style={{ background: T.panel, border: BORDER, borderRadius: 5, padding: 16, boxShadow: SH.sm, minHeight: 104, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, letterSpacing: 0.5, textTransform: "uppercase" }}>Project Health</div>
            <div style={{ width: 32, height: 32, borderRadius: 5, background: onTrack ? T.green : T.amber, border: `1.5px solid ${T.edge}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={16} color="#fff" strokeWidth={2.4} />
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            <Pill status={proj.status} />
            {!onTrack && <div style={{ fontSize: 11.5, color: T.graphite, marginTop: 7, lineHeight: 1.4, fontWeight: 600 }}>{proj.riskReason}</div>}
          </div>
        </div>

        <StatTile icon={FolderKanban} hue="indigo" label="Active Projects" value={allProjects.length} sub="active engagements" />
        <StatTile icon={Calendar} hue="violet" label="Expected Delivery" value={proj.targetDelivery} sub={`${proj.confidenceLabel} confidence`} valueMono={false} />
        <StatTile icon={Radar} hue="teal" label="Current Stage" value={STAGES[proj.currentStageIndex]} sub={proj.stageDates[proj.currentStageIndex].team} valueMono={false} />

        <div className="rc-card rc-card-hover" style={{ background: T.panel, border: BORDER, borderRadius: 5, padding: 16, boxShadow: SH.sm, minHeight: 104, display: "flex", alignItems: "center", gap: 12 }}>
          <Ring pct={proj.completion} size={60} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, letterSpacing: 0.5, textTransform: "uppercase" }}>Completion</div>
            <div style={{ fontSize: 12, color: T.graphite, marginTop: 4, fontWeight: 600 }}>overall progress</div>
          </div>
        </div>
      </div>

      <Card title="Procurement Timeline" style={{ marginBottom: 20 }}>
        <LifecycleRail items={railItems} currentIndex={proj.currentStageIndex} onJump={() => go("project")} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Recent Updates" action={<a onClick={() => go("communication")} className="rc-link" style={{ fontSize: 12, color: T.accent, cursor: "pointer", fontWeight: 700 }}>View all →</a>}>
            {proj.activity.slice(0, 4).map((a) => {
              const c = catStyle(a.cat);
              return (
                <div key={a.id} className="rc-row" style={{ display: "flex", gap: 12, padding: "10px 6px", borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 5, background: c.soft, border: `1.5px solid ${T.edge}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: c.fg }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{a.head}</div>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2, fontFamily: MONO }}>{a.time} · {a.owner}</div>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card title="Pending Customer Actions">
            {pending.length === 0 ? (
              <div style={{ fontSize: 13, color: T.graphite, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} color={T.green} /> Nothing needs your attention right now.
              </div>
            ) : pending.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 14px", background: T.amberSoft, border: `1.5px solid ${T.amber}`, boxShadow: SH.sm }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{p.text}</div>
                <Btn small variant="dark" disabled={approving} onClick={() => approve(p)}>{p.cta}</Btn>
              </div>
            ))}
          </Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Upcoming Milestones">
            {proj.stageDates.filter((d) => d.status !== "Completed").slice(0, 3).map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: 13, borderBottom: i < 2 ? `1px solid ${T.lineSoft}` : "none" }}>
                <span style={{ fontWeight: 500 }}>{STAGES[proj.stageDates.indexOf(d)]}</span>
                <span style={{ fontFamily: MONO, color: T.faint, fontSize: 12 }}>{d.date}</span>
              </div>
            ))}
          </Card>
          <Card title="Quick Downloads">
            {["Compliance Package", "Latest Invoice", "Shipment Documents"].map((d) => (
              <div key={d} onClick={() => quickDownload(d)} className="rc-row" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 10px", cursor: "pointer", borderBottom: `1px solid ${T.line}`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{d}</span>
                <Download size={15} color={T.accentDeep} strokeWidth={2.4} />
              </div>
            ))}
          </Card>
          <Card title="Your Account Manager">
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 5, background: T.accent, border: `1.5px solid ${T.edge}`, boxShadow: SH.sm, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                {proj.reconTeam[0].name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{proj.reconTeam[0].name}</div>
                <div style={{ fontSize: 11.5, color: T.faint, fontWeight: 600 }}>Typically replies in {proj.reconTeam[0].response}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn small variant="secondary" icon={MessageSquare} onClick={() => go("support")}>Message</Btn>
              <Btn small variant="secondary" icon={Calendar} onClick={() => setMeetingOpen(true)}>Book call</Btn>
            </div>
          </Card>
        </div>
      </div>

      {meetingOpen && <MeetingModal proj={proj} notify={notify} onClose={() => setMeetingOpen(false)} defaultMode="Phone call" />}
    </>
  );
}
