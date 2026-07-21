import { T, MONO, STAGES } from "../theme.js";
import { Card, Pill, Ring, Btn, LifecycleRail, PageHeader } from "../components/ui.jsx";
import { Download, Circle, CheckCircle2, MessageSquare, Calendar } from "../icons.jsx";

export default function DashboardPage({ proj, allProjects, go, notify }) {
  const pending = proj.id === "p2"
    ? [{ text: "Approve second-source qualification for nRF9160 (RF module)", cta: "Review" }]
    : [];

  const railItems = proj.stageDates.map((d, i) => ({ label: STAGES[i], date: d.date, status: d.status, team: d.team }));

  return (
    <>
      <PageHeader eyebrow={`${proj.code} · ${proj.name}`} title="Dashboard"
        action={<Btn variant="secondary" icon={Download} onClick={() => notify("Project summary exported")}>Export summary</Btn>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        <Card title="Project Health">
          <Pill status={proj.status} />
          {proj.status !== "On Track" && <div style={{ fontSize: 12, color: T.graphite, marginTop: 8, lineHeight: 1.5 }}>{proj.riskReason}</div>}
        </Card>
        <Card title="Active Projects">
          <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700 }}>{allProjects.length}</div>
          <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>active engagements</div>
        </Card>
        <Card title="Expected Delivery">
          <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700 }}>{proj.targetDelivery}</div>
          <div style={{ fontSize: 12, color: T.green, marginTop: 2, fontWeight: 600 }}>{proj.confidenceLabel} confidence</div>
        </Card>
        <Card title="Current Stage">
          <div style={{ fontSize: 15, fontWeight: 700 }}>{STAGES[proj.currentStageIndex]}</div>
          <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{proj.stageDates[proj.currentStageIndex].team}</div>
        </Card>
        <Card title="Completion">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Ring pct={proj.completion} size={54} />
          </div>
        </Card>
      </div>

      <Card title="Procurement Timeline" style={{ marginBottom: 20 }}>
        <LifecycleRail items={railItems} currentIndex={proj.currentStageIndex} onJump={() => go("project")} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Recent Updates" action={<a onClick={() => go("communication")} style={{ fontSize: 12, color: T.blue, cursor: "pointer", fontWeight: 600 }}>View all →</a>}>
            {proj.activity.slice(0, 4).map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.line}` }}>
                <Circle size={7} style={{ marginTop: 6, flexShrink: 0 }} color={T.blue} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.head}</div>
                  <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2, fontFamily: MONO }}>{a.time} · {a.owner}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card title="Pending Customer Actions">
            {pending.length === 0 ? (
              <div style={{ fontSize: 13, color: T.faint, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} color={T.green} /> Nothing needs your attention right now.
              </div>
            ) : pending.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                <div style={{ fontSize: 13 }}>{p.text}</div>
                <Btn small onClick={() => go("technical")}>{p.cta}</Btn>
              </div>
            ))}
          </Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Upcoming Milestones">
            {proj.stageDates.filter((d) => d.status !== "Completed").slice(0, 3).map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13 }}>
                <span>{STAGES[proj.stageDates.indexOf(d)]}</span>
                <span style={{ fontFamily: MONO, color: T.faint, fontSize: 12 }}>{d.date}</span>
              </div>
            ))}
          </Card>
          <Card title="Quick Downloads">
            {["Compliance Package", "Latest Invoice", "Shipment Documents"].map((d) => (
              <div key={d} onClick={() => notify(`Downloading ${d}...`)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", cursor: "pointer",
              }}>
                <span style={{ fontSize: 13 }}>{d}</span>
                <Download size={14} color={T.faint} />
              </div>
            ))}
          </Card>
          <Card title="Your Account Manager">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                {proj.reconTeam[0].name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{proj.reconTeam[0].name}</div>
                <div style={{ fontSize: 11.5, color: T.faint }}>Typically replies in {proj.reconTeam[0].response}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn small variant="secondary" icon={MessageSquare} onClick={() => go("support")}>Message</Btn>
              <Btn small variant="secondary" icon={Calendar} onClick={() => notify("Opening scheduler...")}>Book call</Btn>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
