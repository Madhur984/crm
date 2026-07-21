import { T, MONO } from "../theme.js";
import { Card, Pill, Btn, LifecycleRail, PageHeader } from "../components/ui.jsx";
import { downloadText } from "../download.js";
import { Download } from "../icons.jsx";

export default function LogisticsPage({ proj, notify }) {
  const L = proj.logistics;
  const downloadShipping = () => {
    const text = [
      `SHIPPING DOCUMENTS — ${proj.code} · ${proj.name}`, "",
      `Carrier:   ${L.carrier}`, `Broker:    ${L.broker}`, `Insurance: ${L.insurance.status} (${L.insurance.coverage})`,
      `ETA:       ${proj.targetDelivery}`, "",
      "Documents: Bill of Lading, Packing List, Commercial Invoice", "",
      `Generated ${new Date().toLocaleString()}`,
    ].join("\n");
    downloadText(`${proj.code}-shipping-docs.txt`, text);
    notify("Shipping documents downloaded");
  };
  const railItems = L.steps.map((s) => ({ label: s.name, status: s.status, date: s.date, team: "" }));
  const currentIndex = L.steps.findIndex((s) => s.status === "In Progress");

  return (
    <>
      <PageHeader eyebrow={proj.code} title="Logistics Centre" />
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: T.faint, fontWeight: 700, textTransform: "uppercase" }}>Estimated Arrival</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: MONO }}>{proj.targetDelivery}</div>
          </div>
          {L.delay ? <Pill status="Needs Attention" /> : <Pill status="On Track" />}
        </div>
        <LifecycleRail items={railItems} currentIndex={currentIndex} />
      </Card>
      <div className="rc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card title="Manufacturing Status">
          {L.manufacturing.map((m) => (
            <div key={m.step} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13 }}>
              <span>{m.step}</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: T.faint }}>{m.date}</span>
                <Pill status={m.status} />
              </div>
            </div>
          ))}
        </Card>
        <Card title="Freight & Carrier">
          {[["Carrier", L.carrier], ["Container", L.container], ["Warehouse", L.warehouse], ["Broker", L.broker]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
              <span style={{ color: T.faint }}>{k}</span><span style={{ fontFamily: MONO, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
      <div className="rc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card title="Insurance">
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
            <span style={{ color: T.faint }}>Status</span><Pill status={L.insurance.status} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
            <span style={{ color: T.faint }}>Coverage</span><span style={{ fontFamily: MONO }}>{L.insurance.coverage}</span>
          </div>
        </Card>
        <Card title="Shipping Documents" action={<Btn small variant="ghost" icon={Download} onClick={downloadShipping}>Download all</Btn>}>
          {["Bill of Lading", "Packing List", "Commercial Invoice"].map((d) => (
            <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
              <span>{d}</span><Pill status={proj.currentStageIndex >= 6 ? "Completed" : "Pending"} />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
