import { T, MONO } from "../theme.js";
import { Card, Pill, Ring, PageHeader } from "../components/ui.jsx";

export default function AtlasPage({ proj }) {
  const cards = [
    { t: "Requirement Analysis", s: "Completed", d: "All line items reviewed and cross-checked against your specifications." },
    { t: "Technical Validation", s: "Completed", d: "All validated BOM lines confirmed against datasheets." },
    { t: "Pricing Review", s: "Completed", d: "Pricing reviewed across the full order." },
    { t: "Supply Coverage", s: proj.currentStageIndex >= 2 ? "Confirmed" : "In Progress", d: "Multi-region coverage secured for your component set." },
    { t: "Alternate Components", s: "Verified", d: `${proj.bom.filter((b) => b.alt && b.alt !== "None" && b.alt !== "In review").length} validated alternates on file.` },
    { t: "Regional Sourcing", s: "Completed", d: `Risk level: ${proj.risk}.` },
    { t: "Risk Review", s: "Monitored", d: proj.risk === "Low" ? "No open risk flags." : proj.riskReason },
    { t: "Lead Time", s: "Completed", d: "Schedule aligned to your target delivery date." },
    { t: "Sourcing Plan", s: "Finalized", d: "Sourcing plan finalized for this project." },
  ];
  return (
    <>
      <PageHeader eyebrow={`${proj.code} · Sourcing status`} title="Recon Atlas" />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Ring pct={proj.confidence} size={92} color={T.accent} label="READINESS" />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: T.faint, fontWeight: 700 }}>Procurement Readiness</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 3, color: T.ink }}>{proj.confidence}% — {proj.confidenceLabel}</div>
            <div style={{ fontSize: 13, color: T.graphite, marginTop: 6, maxWidth: 560, lineHeight: 1.5 }}>
              {proj.confidence >= 90
                ? "All technical, commercial, and supply checks are complete. No open items are affecting this project."
                : `One open item is being worked: ${proj.riskReason}`}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {cards.map((c) => (
          <Card key={c.t} title={c.t} action={<Pill status={c.s} />}>
            <p style={{ margin: 0, fontSize: 12.5, color: T.graphite, lineHeight: 1.5 }}>{c.d}</p>
          </Card>
        ))}
      </div>

      <Card title="About this page">
        <p style={{ margin: 0, fontSize: 13, color: T.graphite, lineHeight: 1.65 }}>
          This page summarises where your project stands across the checks our team runs before and during
          sourcing — technical fit, supply coverage, lead time, pricing, compliance, and risk. Each status
          updates as its review completes. For how these statuses are tracked, see the
          {" "}<span style={{ color: T.accent, fontWeight: 600, cursor: "pointer" }}>Knowledge Base</span>.
        </p>
      </Card>
    </>
  );
}
