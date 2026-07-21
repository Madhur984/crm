/* Trigger a real client-side file download (no server round-trip needed). */
export function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename, obj) {
  downloadText(filename, JSON.stringify(obj, null, 2), "application/json");
}

/* CSV from an array of objects. */
export function downloadCSV(filename, rows, columns) {
  const cols = columns || (rows[0] ? Object.keys(rows[0]) : []);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))];
  downloadText(filename, lines.join("\n"), "text/csv");
}

/* A readable text summary of a project — used by "Export summary". */
export function projectSummaryText(proj) {
  const L = [];
  L.push(`RECON CORE — PROJECT SUMMARY`);
  L.push(`==============================`);
  L.push(`${proj.code} · ${proj.name}`);
  L.push(``);
  L.push(`Status:            ${proj.status}   (risk: ${proj.risk})`);
  L.push(`Completion:        ${proj.completion}%`);
  L.push(`Procurement readiness: ${proj.confidence}% (${proj.confidenceLabel})`);
  L.push(`Industry:          ${proj.industry}`);
  L.push(`Application:       ${proj.application}`);
  L.push(`Quantity:          ${proj.quantity}`);
  L.push(`Value:             ${proj.value}`);
  L.push(`Delivery location: ${proj.location}`);
  L.push(`Kickoff:           ${proj.kickoff}`);
  L.push(`Target delivery:   ${proj.targetDelivery}`);
  L.push(``);
  L.push(`COMMERCIAL`);
  L.push(`  Total contract:  $${proj.commercial.total.toLocaleString()}`);
  L.push(`  Invoiced:        $${proj.commercial.invoiced.toLocaleString()}`);
  L.push(`  Paid:            $${proj.commercial.paid.toLocaleString()}`);
  L.push(`  Outstanding:     $${(proj.commercial.total - proj.commercial.paid).toLocaleString()}`);
  L.push(``);
  L.push(`BILL OF MATERIALS (${proj.bom.length} lines)`);
  proj.bom.forEach((b) => L.push(`  ${b.id}  ${b.part.padEnd(20)} ${b.status}`));
  L.push(``);
  L.push(`Generated ${new Date().toLocaleString()}`);
  return L.join("\n");
}
