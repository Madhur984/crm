import { T, MONO, SH } from "../theme.js";
import { Card, Pill, Btn, Table, PageHeader } from "../components/ui.jsx";
import { downloadText } from "../download.js";
import { Download } from "../icons.jsx";

export default function CompliancePage({ proj, notify }) {
  const allDone = proj.certifications.every((c) => c.status === "Completed" || c.status === "Not Applicable");
  const downloadPackage = () => {
    const lines = [
      `COMPLIANCE PACKAGE — ${proj.code} · ${proj.name}`, "",
      "CERTIFICATIONS",
      ...proj.certifications.map((c) => `  ${c.name.padEnd(10)} ${c.status}${c.certNo !== "—" ? "  (" + c.certNo + ")" : ""}`), "",
      "DOCUMENTATION",
      ...proj.complianceDocs.map((d) => `  ${d.name.padEnd(24)} ${d.status} ${d.version !== "—" ? d.version : ""}`), "",
      `Customs — Import: ${proj.customs.importReview} | Export: ${proj.customs.exportReview}`, "",
      `Generated ${new Date().toLocaleString()}`,
    ];
    downloadText(`${proj.code}-compliance-package.txt`, lines.join("\n"));
    notify("Compliance package downloaded");
  };
  return (
    <>
      <PageHeader eyebrow={proj.code} title="Compliance Centre"
        action={<Btn icon={Download} onClick={downloadPackage}>Download compliance package</Btn>} />
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: T.faint, fontWeight: 700, textTransform: "uppercase" }}>Overall Compliance Status</div>
            <div style={{ marginTop: 6 }}><Pill status={allDone ? "Completed" : "In Progress"} /></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: T.faint, fontWeight: 700, textTransform: "uppercase" }}>Expected Completion</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: MONO, marginTop: 4 }}>{proj.currentStageIndex >= 3 ? "Complete" : "Est. Aug 12, 2026"}</div>
          </div>
        </div>
      </Card>

      <Card title="Certifications" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {proj.certifications.map((c) => (
            <div key={c.name} style={{ border: `1.5px solid ${T.edge}`, borderRadius: 5, padding: 12, boxShadow: SH.sm, background: T.panel }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{c.name}</div>
              <div style={{ marginTop: 6 }}><Pill status={c.status} /></div>
              <div style={{ fontSize: 10.5, color: T.faint, marginTop: 8, fontFamily: MONO }}>{c.certNo !== "—" ? c.certNo : "Not yet issued"}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Documentation" style={{ marginBottom: 20 }}>
        <Table columns={["name", "status", "version", "updated"]} rows={proj.complianceDocs}
          renderCell={(r, c) => c === "status" ? <Pill status={r[c]} /> : r[c]} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card title="Customs — Import / Export">
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ fontSize: 13 }}>Import Review</span><Pill status={proj.customs.importReview} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ fontSize: 13 }}>Export Review</span><Pill status={proj.customs.exportReview} />
          </div>
        </Card>
        <Card title="HS Classification">
          <Table columns={["category", "code", "status"]} rows={proj.customs.hs}
            renderCell={(r, c) => c === "status" ? <Pill status={r[c]} /> : c === "code" ? <span style={{ fontFamily: MONO }}>{r[c]}</span> : r[c]} />
        </Card>
      </div>
    </>
  );
}
