import { useState } from "react";
import { api } from "../api.js";
import { T, MONO } from "../theme.js";
import { Card, Pill, Btn, Table, PageHeader, StatTile } from "../components/ui.jsx";
import { downloadText } from "../download.js";
import { Download, Receipt, FileText, CheckCircle2, AlertTriangle } from "../icons.jsx";

export default function CommercialPage({ proj, notify, reload }) {
  const [tab, setTab] = useState("Quotation");
  const [busy, setBusy] = useState(false);
  const tabs = ["Quotation", "Purchase Orders", "Contracts", "Payment Schedule", "Invoices", "Quotation History"];
  const fmt = (n) => `$${n.toLocaleString()}`;
  const c = proj.commercial;

  const acceptQuote = async () => {
    setBusy(true);
    try { await api.acceptQuote(proj.id); notify("Quotation accepted"); reload(); }
    catch (e) { notify(e.message); } finally { setBusy(false); }
  };
  const payInvoice = async (inv) => {
    setBusy(true);
    try { await api.payInvoice(inv.dbId); notify(`Payment recorded for ${inv.id}`); reload(); }
    catch (e) { notify(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader eyebrow={proj.code} title="Commercial Centre" />
      <div className="rc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatTile icon={Receipt} hue="indigo" label="Total Contract Value" value={fmt(c.total)} />
        <StatTile icon={FileText} hue="violet" label="Amount Invoiced" value={fmt(c.invoiced)} />
        <StatTile icon={CheckCircle2} hue="emerald" label="Amount Paid" value={fmt(c.paid)} accentValue />
        <StatTile icon={AlertTriangle} hue={c.total - c.paid > 0 ? "amber" : "teal"} label="Outstanding Balance" value={fmt(c.total - c.paid)} />
      </div>

      <div style={{ display: "flex", gap: 6, borderBottom: `2px solid ${T.edge}`, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: -2,
            color: tab === t ? T.ink : T.faint, borderBottom: tab === t ? `3px solid ${T.accent}` : "3px solid transparent",
          }}>{t}</div>
        ))}
      </div>

      {tab === "Quotation" && (
        <Card title={`Quotation ${c.quote.id}`} action={<span style={{ fontSize: 12, color: T.faint }}>Valid until {c.quote.validUntil}</span>}>
          <Table columns={["part", "qty", "unit", "ext"]} rows={c.quote.lines}
            renderCell={(r, col) => ["part", "qty", "unit", "ext"].includes(col) ? <span style={{ fontFamily: MONO }}>{r[col]}</span> : r[col]} />
          <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
            {c.quoteAccepted ? (
              <Pill status="Accepted" />
            ) : (
              <>
                <Btn disabled={busy} onClick={acceptQuote}>Accept quotation</Btn>
                <Btn variant="secondary" onClick={() => notify("Revision requested")}>Request revision</Btn>
              </>
            )}
          </div>
        </Card>
      )}
      {tab === "Purchase Orders" && (
        <Card title="Purchase Orders">
          <Table columns={["id", "date", "value", "status"]} rows={c.pos}
            renderCell={(r, col) => col === "status" ? <Pill status={r[col]} /> : col === "id" ? <span style={{ fontFamily: MONO, fontWeight: 600 }}>{r[col]}</span> : r[col]} />
        </Card>
      )}
      {tab === "Contracts" && (
        <Card title="Master Services Agreement">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Master Services Agreement — {proj.name}</div>
              <div style={{ fontSize: 11.5, color: T.faint }}>Signed {proj.kickoff}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill status="Signed" />
              <Btn small variant="ghost" icon={Download} onClick={() => { downloadText(`${proj.code}-MSA.txt`, `MASTER SERVICES AGREEMENT\n${proj.code} · ${proj.name}\nSigned ${proj.kickoff}\nContract value: ${fmt(c.total)}\n\n(Reference copy generated from the customer portal.)`); notify("Downloading MSA"); }}>Download</Btn>
            </div>
          </div>
        </Card>
      )}
      {tab === "Payment Schedule" && (
        <Card title="Payment Schedule">
          <Table columns={["milestone", "pct", "amount", "due", "status"]} rows={c.schedule}
            renderCell={(r, col) => col === "status" ? <Pill status={r[col]} /> : r[col]} />
        </Card>
      )}
      {tab === "Invoices" && (
        <Card title="Invoices">
          <Table columns={["id", "date", "amount", "status"]} rows={c.invoices}
            renderCell={(r, col) => col === "status" ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Pill status={r.status} />
                {r.status !== "Paid" && <Btn small variant="subtle" disabled={busy} onClick={() => payInvoice(r)}>Pay now</Btn>}</div>
            ) : col === "id" ? <span style={{ fontFamily: MONO, fontWeight: 600 }}>{r[col]}</span> : r[col]} />
        </Card>
      )}
      {tab === "Quotation History" && (
        <Card title="Quotation History">
          <Table columns={["version", "date", "reason"]}
            rows={[{ version: "v2", date: "Apr 30, 2026", reason: "Updated after quantity revision" }, { version: "v1", date: "Mar 8, 2026", reason: "Initial quotation" }]}
            renderCell={(r, col) => col === "version" ? <span style={{ fontFamily: MONO, fontWeight: 600 }}>{r[col]}</span> : r[col]} />
        </Card>
      )}
    </>
  );
}
