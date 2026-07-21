import { useEffect, useState } from "react";
import { api } from "../api.js";
import { T, MONO } from "../theme.js";
import { Card, Pill, Btn, Table, PageHeader } from "../components/ui.jsx";
import { Download, Search } from "../icons.jsx";

export default function DocumentsPage({ notify }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [rows, setRows] = useState([]);
  const [types, setTypes] = useState(["All"]);

  useEffect(() => {
    const id = setTimeout(() => {
      api.documents(q, type).then(({ documents, types }) => { setRows(documents); setTypes(types); }).catch(() => {});
    }, 150);
    return () => clearTimeout(id);
  }, [q, type]);

  return (
    <>
      <PageHeader eyebrow="All projects" title="Document Centre"
        action={<Btn icon={Download} onClick={() => notify(`Downloading ${rows.length} documents as ZIP`)}>Download all</Btn>} />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.mist, border: `1px solid ${T.line}`, borderRadius: 7, padding: "7px 12px", flex: 1, minWidth: 220 }}>
          <Search size={14} color={T.faint} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents..."
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {types.map((t) => (
            <div key={t} onClick={() => setType(t)} style={{
              padding: "7px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              background: type === t ? T.ink : T.mist, color: type === t ? "#fff" : T.graphite, border: `1px solid ${type === t ? T.ink : T.line}`,
            }}>{t}</div>
          ))}
        </div>
      </div>
      <Card>
        <Table columns={["name", "type", "project", "version", "date", "by", "status"]} rows={rows}
          renderCell={(r, c) => {
            if (c === "name") return <span style={{ fontWeight: 600 }}>{r[c]}</span>;
            if (c === "status") return <Pill status={r[c]} />;
            if (c === "version") return <span style={{ fontFamily: MONO }}>{r[c]}</span>;
            return r[c];
          }} />
      </Card>
    </>
  );
}
