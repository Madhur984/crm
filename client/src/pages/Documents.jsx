import { useEffect, useState } from "react";
import { api } from "../api.js";
import { T, MONO, SH, BORDER } from "../theme.js";
import { Card, Pill, Btn, Table, PageHeader } from "../components/ui.jsx";
import { UploadModal } from "../components/features.jsx";
import { downloadCSV } from "../download.js";
import { Download, Search, Upload } from "../icons.jsx";

export default function DocumentsPage({ proj, notify }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [rows, setRows] = useState([]);
  const [types, setTypes] = useState(["All"]);
  const [tick, setTick] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      api.documents(q, type).then(({ documents, types }) => { setRows(documents); setTypes(types); }).catch(() => {});
    }, 150);
    return () => clearTimeout(id);
  }, [q, type, tick]);

  const downloadAll = () => {
    if (!rows.length) { notify("Nothing to download"); return; }
    downloadCSV("recon-documents.csv", rows, ["name", "type", "project", "version", "date", "by", "status"]);
    notify(`Exported ${rows.length} documents (CSV)`);
  };

  return (
    <>
      <PageHeader eyebrow="All projects" title="Document Centre"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" icon={Upload} onClick={() => setUploadOpen(true)}>Upload</Btn>
            <Btn icon={Download} onClick={downloadAll}>Download all</Btn>
          </div>
        } />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="rc-search" style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel, border: BORDER, borderRadius: 5, padding: "8px 12px", flex: 1, minWidth: 220 }}>
          <Search size={14} color={T.ink} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents..."
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, width: "100%", fontWeight: 500 }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {types.map((t) => (
            <div key={t} onClick={() => setType(t)} className="rc-btn" style={{
              padding: "8px 12px", borderRadius: 5, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: BORDER,
              background: type === t ? T.ink : T.panel, color: type === t ? "#fff" : T.graphite,
              boxShadow: type === t ? SH.sm : "none",
            }}>{t}</div>
          ))}
        </div>
      </div>
      <Card style={{ padding: 0 }}>
        <Table columns={["name", "type", "project", "version", "date", "by", "status"]} rows={rows}
          renderCell={(r, c) => {
            if (c === "name") return <span style={{ fontWeight: 600 }}>{r[c]}</span>;
            if (c === "status") return <Pill status={r[c]} />;
            if (c === "version") return <span style={{ fontFamily: MONO }}>{r[c]}</span>;
            return r[c];
          }} />
      </Card>

      {uploadOpen && <UploadModal proj={proj} notify={notify} onClose={() => setUploadOpen(false)} onDone={() => setTick((t) => t + 1)} />}
    </>
  );
}
