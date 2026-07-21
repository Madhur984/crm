import { useEffect, useState } from "react";
import { api } from "../api.js";
import { T, MONO, STAGES } from "../theme.js";
import { Card, Pill, Btn, LifecycleRail, Table, PageHeader } from "../components/ui.jsx";
import { Download, Circle } from "../icons.jsx";

export default function ProjectDetailsPage({ proj, notify }) {
  const [tab, setTab] = useState("Overview");
  const [docs, setDocs] = useState([]);
  const tabs = ["Overview", "Milestones", "Activity", "Documents", "Version History"];

  useEffect(() => {
    api.documents("", "All").then(({ documents }) => setDocs(documents.filter((d) => d.project === proj.name))).catch(() => {});
  }, [proj.name]);

  const railItems = proj.stageDates.map((d, i) => ({ label: STAGES[i], date: d.date, status: d.status, team: d.team }));

  return (
    <>
      <PageHeader eyebrow={proj.code} title={proj.name}
        action={<Btn variant="secondary" icon={Download} onClick={() => notify("Project summary PDF exported")}>Export project summary</Btn>} />
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Pill status={proj.status} /><Pill status={proj.risk} />
        <span style={{ fontSize: 13, color: T.faint, fontFamily: MONO }}>Value: {proj.value}</span>
      </div>
      <div className="rc-cols-side" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 6, borderBottom: `2px solid ${T.edge}`, marginBottom: 18, flexWrap: "wrap" }}>
            {tabs.map((t) => (
              <div key={t} onClick={() => setTab(t)} style={{
                padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: -2,
                color: tab === t ? T.ink : T.faint, borderBottom: tab === t ? `3px solid ${T.accent}` : "3px solid transparent",
              }}>{t}</div>
            ))}
          </div>

          {tab === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Card title="Project Information">
                <div className="rc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                  {[["Industry", proj.industry], ["Application", proj.application], ["Component Categories", proj.categories.join(", ")],
                    ["Quantity", proj.quantity], ["Project Value", proj.value], ["Delivery Location", proj.location],
                    ["Kickoff", proj.kickoff], ["Target Delivery", proj.targetDelivery]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.3 }}>{k}</div>
                      <div style={{ fontSize: 13.5, marginTop: 3 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Procurement Summary">
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: T.graphite }}>
                  {STAGES[proj.currentStageIndex] === "Manufacturing"
                    ? "Technical validation and compliance are complete. Recon Atlas confirmed full supply network coverage. Manufacturing is underway and on schedule, with first article inspection already passed."
                    : "Requirement analysis and engineering review are complete. Recon Atlas is currently validating supply network coverage, including a second qualified source for one constrained line item."}
                </p>
              </Card>
              <Card title="Risk Level">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Pill status={proj.risk} />
                  <span style={{ fontSize: 13, color: T.graphite }}>{proj.riskReason}</span>
                </div>
              </Card>
            </div>
          )}

          {tab === "Milestones" && (
            <Card title="Lifecycle Milestones">
              <LifecycleRail items={railItems} currentIndex={proj.currentStageIndex} />
            </Card>
          )}

          {tab === "Activity" && (
            <Card title="Project Activity">
              {proj.activity.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.line}` }}>
                  <Circle size={7} style={{ marginTop: 6, flexShrink: 0 }} color={T.blue} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.head}</div>
                    <div style={{ fontSize: 12, color: T.graphite, marginTop: 3 }}>{a.notes}</div>
                    <div style={{ fontSize: 11, color: T.faint, marginTop: 3, fontFamily: MONO }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {tab === "Documents" && (
            <Card title="Project Documents">
              <Table columns={["name", "type", "version", "date"]} rows={docs}
                renderCell={(r, c) => c === "name" ? <span style={{ fontWeight: 600 }}>{r[c]}</span> : r[c]} />
            </Card>
          )}

          {tab === "Version History" && (
            <Card title="Requirement Version History">
              <Table columns={["version", "date", "by", "change"]}
                rows={[
                  { version: "Rev 3", date: "Mar 19, 2026", by: "Customer", change: "Updated tolerance on L-002 footprint" },
                  { version: "Rev 2", date: "Mar 11, 2026", by: "Customer", change: "Added alternate for L-004" },
                  { version: "Rev 1", date: "Mar 6, 2026", by: "Customer", change: "Initial submission" },
                ]}
                renderCell={(r, c) => c === "version" ? <span style={{ fontWeight: 600, fontFamily: MONO }}>{r[c]}</span> : r[c]} />
            </Card>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card title="Customer Contacts">
            {proj.contacts.map((c) => (
              <div key={c.name} style={{ padding: "6px 0" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: T.faint }}>{c.role}</div>
              </div>
            ))}
          </Card>
          <Card title="Recon Team">
            {proj.reconTeam.map((m) => (
              <div key={m.role} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12.5 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ color: T.faint, fontSize: 11 }}>{m.role}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card title="Key Dates">
            {[["RFQ Submitted", proj.kickoff], ["Target Delivery", proj.targetDelivery]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12.5 }}>
                <span style={{ color: T.faint }}>{k}</span><span style={{ fontFamily: MONO }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
