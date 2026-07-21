import bcrypt from 'bcryptjs';
import { getFirestoreDB } from '../src/firebase.js';

const PROJECTS = {
  p1: {
    id: "p1", code: "RC-40217", name: "Motor Control PCBA",
    industry: "Industrial Automation", application: "Variable-frequency motor control board",
    categories: ["MCUs", "Power MOSFETs", "Passives", "Gate Drivers"],
    quantity: "42,000 units", value: "$1,860,000", currency: "USD",
    location: "Stuttgart, DE", kickoff: "Mar 3, 2026", targetDelivery: "Oct 14, 2026",
    status: "On Track", risk: "Low", riskReason: "One line item on extended lead time; two validated alternates on file.",
    completion: 61, currentStageIndex: 5, confidence: 96, confidenceLabel: "High",
    stageDates: [
      { status: "Completed", date: "Mar 6", team: "Intake Team" },
      { status: "Completed", date: "Mar 19", team: "Engineering — EU" },
      { status: "Completed", date: "Mar 27", team: "Recon Atlas" },
      { status: "Completed", date: "Apr 22", team: "Compliance — EU" },
      { status: "Completed", date: "May 2", team: "Commercial Desk" },
      { status: "In Progress", date: "Est. Aug 18", team: "Manufacturing Ops" },
      { status: "Pending", date: "Est. Sep 9", team: "Logistics — EU" },
      { status: "Pending", date: "Est. Sep 24", team: "Customs — DE" },
      { status: "Pending", date: "Est. Oct 14", team: "Delivery Ops" },
    ],
    contacts: [
      { name: "J. Weber", role: "Procurement Lead (Customer)" },
      { name: "S. Nair", role: "Quality Approver (Customer)" },
    ],
    reconTeam: [
      { role: "Account Manager", name: "Priya Malhotra", response: "~4h" },
      { role: "Technical Lead", name: "Owen Fischer", response: "~6h" },
      { role: "Compliance Lead", name: "Lena Voss", response: "~8h" },
      { role: "Logistics Lead", name: "Marcus Boyle", response: "~4h" },
    ],
    bom: [
      { lineId: "L-001", part: "STM32G474RET6", desc: "32-bit MCU, Cortex-M4", qty: "42,000", alt: "1 validated", status: "Validated" },
      { lineId: "L-002", part: "IPB017N08N3", desc: "Power MOSFET, 80V 170A", qty: "84,000", alt: "2 validated", status: "Validated" },
      { lineId: "L-003", part: "UCC27211A", desc: "Half-bridge gate driver", qty: "42,000", alt: "None", status: "Under Review" },
      { lineId: "L-004", part: "GRM32 series", desc: "MLCC, 10µF X7R", qty: "252,000", alt: "3 validated", status: "Validated" },
      { lineId: "L-005", part: "ACS37800", desc: "Power monitoring IC", qty: "42,000", alt: "1 validated", status: "Clarification Needed" },
    ],
    clarifications: [
      { code: "C-104", subject: "ACS37800 — confirm isolation voltage requirement", status: "Open",
        messages: [
          { from: "Recon Engineering", date: "Jul 6", text: "Please confirm the minimum working isolation voltage for L-005 — datasheet rev shows two package options." },
        ] },
      { code: "C-101", subject: "Gate driver alternate sourcing", status: "Resolved",
        messages: [
          { from: "Recon Engineering", date: "Jun 2", text: "Requesting approval to qualify a footprint-compatible alternate for L-003." },
          { from: "J. Weber", date: "Jun 4", text: "Approved — proceed with qualification." },
        ] },
    ],
    certifications: [
      { name: "RoHS", status: "Completed", certNo: "RC-ROHS-40217", issued: "Apr 18, 2026", expiry: "—" },
      { name: "REACH", status: "Completed", certNo: "RC-REACH-40217", issued: "Apr 18, 2026", expiry: "—" },
      { name: "ISO 9001", status: "Completed", certNo: "ISO9K-2291", issued: "Jan 2026", expiry: "Jan 2029" },
      { name: "UL", status: "In Progress", certNo: "—", issued: "—", expiry: "—" },
      { name: "CE", status: "Completed", certNo: "CE-40217-EU", issued: "Apr 20, 2026", expiry: "—" },
      { name: "AEC-Q", status: "Pending", certNo: "—", issued: "—", expiry: "—" },
      { name: "BIS", status: "Not Applicable", certNo: "—", issued: "—", expiry: "—" },
    ],
    complianceDocs: [
      { name: "Commercial Invoice", status: "Pending", version: "—", updated: "—" },
      { name: "Packing List", status: "Pending", version: "—", updated: "—" },
      { name: "Certificate of Origin", status: "Completed", version: "v2", updated: "May 12, 2026" },
      { name: "Test Reports", status: "Completed", version: "v1", updated: "Apr 26, 2026" },
      { name: "MSDS", status: "Completed", version: "v1", updated: "Apr 18, 2026" },
      { name: "Insurance Certificate", status: "Completed", version: "v1", updated: "May 2, 2026" },
      { name: "Warranty Terms", status: "Completed", version: "v1", updated: "May 2, 2026" },
    ],
    customs: {
      importReview: "In Progress", exportReview: "Completed",
      hs: [
        { category: "MCUs / ICs", code: "8542.31", status: "Confirmed" },
        { category: "MOSFETs / Discretes", code: "8541.29", status: "Confirmed" },
        { category: "Passives", code: "8532.24", status: "Confirmed" },
      ],
    },
    commercial: {
      total: 1860000, invoiced: 930000, paid: 744000, quoteAccepted: false,
      quote: { id: "Q-40217-C", validUntil: "Aug 1, 2026", lines: [
        { part: "STM32G474RET6", qty: "42,000", unit: "$3.42", ext: "$143,640" },
        { part: "IPB017N08N3", qty: "84,000", unit: "$1.85", ext: "$155,400" },
        { part: "UCC27211A", qty: "42,000", unit: "$0.94", ext: "$39,480" },
      ] },
      pos: [
        { id: "PO-40217-1", date: "May 5, 2026", value: "$930,000", status: "Acknowledged" },
        { id: "PO-40217-2", date: "Aug 20, 2026 (planned)", value: "$930,000", status: "Draft" },
      ],
      schedule: [
        { milestone: "Contract signature", pct: "20%", amount: "$372,000", due: "Mar 10, 2026", status: "Paid" },
        { milestone: "Compliance approved", pct: "30%", amount: "$558,000", due: "May 10, 2026", status: "Paid" },
        { milestone: "Manufacturing complete", pct: "30%", amount: "$558,000", due: "Aug 22, 2026", status: "Upcoming" },
        { milestone: "Delivery confirmation", pct: "20%", amount: "$372,000", due: "Oct 20, 2026", status: "Upcoming" },
      ],
    },
    invoices: [
      { code: "INV-8821", date: "May 10, 2026", amount: "$930,000", status: "Paid" },
      { code: "INV-8822", date: "Aug 22, 2026 (planned)", amount: "$930,000", status: "Upcoming" },
    ],
    logistics: {
      steps: [
        { name: "Manufacturing", status: "In Progress", date: "Est. Aug 18" },
        { name: "Freight Booking", status: "Pending", date: "Est. Aug 24" },
        { name: "In Transit", status: "Pending", date: "Est. Sep 2" },
        { name: "Import Customs", status: "Pending", date: "Est. Sep 24" },
        { name: "Last Mile", status: "Pending", date: "Est. Oct 10" },
        { name: "Delivered", status: "Pending", date: "Est. Oct 14" },
      ],
      manufacturing: [
        { step: "Production Started", status: "Completed", date: "Jul 1, 2026" },
        { step: "First Article Inspection", status: "Completed", date: "Jul 12, 2026" },
        { step: "Mass Production", status: "In Progress", date: "In progress" },
        { step: "QC Passed", status: "Pending", date: "Est. Aug 15" },
        { step: "Ready to Ship", status: "Pending", date: "Est. Aug 18" },
      ],
      carrier: "Maersk (Ocean, FCL)", container: "Not yet assigned", warehouse: "Rotterdam staging — not yet active",
      broker: "DHL Global Forwarding (DE)", insurance: { status: "Bound", coverage: "$1,860,000" },
      delay: null,
    },
  },
  p2: {
    id: "p2", code: "RC-40390", name: "Sensor Array Module",
    industry: "Industrial IoT", application: "Multi-sensor edge module",
    categories: ["MEMS Sensors", "RF Modules", "Connectors"],
    quantity: "18,500 units", value: "$612,000", currency: "USD",
    location: "Austin, US", kickoff: "May 20, 2026", targetDelivery: "Dec 2, 2026",
    status: "Needs Attention", risk: "Elevated", riskReason: "RF module on allocation at primary source; Recon Atlas is validating a second qualified source now.",
    completion: 24, currentStageIndex: 2, confidence: 78, confidenceLabel: "Moderate",
    stageDates: [
      { status: "Completed", date: "May 23", team: "Intake Team" },
      { status: "Completed", date: "Jun 9", team: "Engineering — US" },
      { status: "In Progress", date: "Est. Jul 22", team: "Recon Atlas" },
      { status: "Pending", date: "Est. Aug 12", team: "Compliance — US" },
      { status: "Pending", date: "Est. Aug 26", team: "Commercial Desk" },
      { status: "Pending", date: "Est. Oct 1", team: "Manufacturing Ops" },
      { status: "Pending", date: "Est. Oct 20", team: "Logistics — US" },
      { status: "Pending", date: "Est. Nov 10", team: "Customs — US" },
      { status: "Pending", date: "Est. Dec 2", team: "Delivery Ops" },
    ],
    contacts: [{ name: "R. Alvarez", role: "Procurement Lead (Customer)" }],
    reconTeam: [
      { role: "Account Manager", name: "Priya Malhotra", response: "~4h" },
      { role: "Technical Lead", name: "Dana Cho", response: "~6h" },
      { role: "Compliance Lead", name: "Marcus Boyle", response: "~8h" },
      { role: "Logistics Lead", name: "T. Ibrahim", response: "~4h" },
    ],
    bom: [
      { lineId: "L-001", part: "BMI323", desc: "6-axis IMU", qty: "18,500", alt: "1 validated", status: "Validated" },
      { lineId: "L-002", part: "nRF9160", desc: "LTE-M/NB-IoT RF module", qty: "18,500", alt: "In review", status: "Under Review" },
      { lineId: "L-003", part: "M12 connector, 8-pin", desc: "Industrial connector", qty: "37,000", alt: "2 validated", status: "Validated" },
    ],
    clarifications: [
      { code: "C-220", subject: "RF module allocation — alternate source timeline", status: "Open",
        messages: [{ from: "Recon Engineering", date: "Jul 9", text: "Second source qualification in progress; will confirm revised lead time by Jul 18." }] },
    ],
    certifications: [
      { name: "RoHS", status: "Pending", certNo: "—", issued: "—", expiry: "—" },
      { name: "FCC", status: "In Progress", certNo: "—", issued: "—", expiry: "—" },
      { name: "ISO 9001", status: "Completed", certNo: "ISO9K-2291", issued: "Jan 2026", expiry: "Jan 2029" },
      { name: "UL", status: "Pending", certNo: "—", issued: "—", expiry: "—" },
    ],
    complianceDocs: [
      { name: "Certificate of Origin", status: "Pending", version: "—", updated: "—" },
      { name: "Test Reports", status: "Pending", version: "—", updated: "—" },
    ],
    customs: { importReview: "Pending", exportReview: "Pending", hs: [{ category: "RF Modules", code: "8517.62", status: "Under Review" }] },
    commercial: {
      total: 612000, invoiced: 122400, paid: 122400, quoteAccepted: false,
      quote: { id: "Q-40390-A", validUntil: "Aug 15, 2026", lines: [{ part: "nRF9160", qty: "18,500", unit: "$8.10", ext: "$149,850" }] },
      pos: [{ id: "PO-40390-1", date: "Jun 3, 2026", value: "$122,400", status: "Acknowledged" }],
      schedule: [
        { milestone: "Contract signature", pct: "20%", amount: "$122,400", due: "Jun 5, 2026", status: "Paid" },
        { milestone: "Compliance approved", pct: "30%", amount: "$183,600", due: "Aug 12, 2026", status: "Upcoming" },
      ],
    },
    invoices: [{ code: "INV-9011", date: "Jun 5, 2026", amount: "$122,400", status: "Paid" }],
    logistics: {
      steps: [
        { name: "Manufacturing", status: "Pending", date: "Est. Oct 1" },
        { name: "Freight Booking", status: "Pending", date: "Est. Oct 15" },
        { name: "In Transit", status: "Pending", date: "Est. Oct 22" },
        { name: "Import Customs", status: "Pending", date: "Est. Nov 10" },
        { name: "Last Mile", status: "Pending", date: "Est. Nov 28" },
        { name: "Delivered", status: "Pending", date: "Est. Dec 2" },
      ],
      manufacturing: [{ step: "Production Started", status: "Pending", date: "Est. Oct 1" }],
      carrier: "Not yet booked", container: "—", warehouse: "—", broker: "—",
      insurance: { status: "Not yet bound", coverage: "—" }, delay: null,
    },
  },
};

const DOCUMENTS = [
  { name: "Master Services Agreement", type: "Contract", project: "Motor Control PCBA", version: "v1", date: "Mar 4, 2026", by: "Recon", status: "Signed" },
  { name: "PO-40217-1", type: "Purchase Order", project: "Motor Control PCBA", version: "v1", date: "May 5, 2026", by: "Customer", status: "Acknowledged" },
  { name: "Certificate of Origin", type: "Compliance", project: "Motor Control PCBA", version: "v2", date: "May 12, 2026", by: "Recon", status: "Completed" },
  { name: "STM32G474 Datasheet", type: "Datasheet", project: "Motor Control PCBA", version: "Rev 3", date: "Mar 19, 2026", by: "Customer", status: "Current" },
  { name: "BOM — Motor Control PCBA", type: "BOM", project: "Motor Control PCBA", version: "Rev 3", date: "Mar 19, 2026", by: "Customer", status: "Current" },
  { name: "First Article Inspection Report", type: "Inspection Report", project: "Motor Control PCBA", version: "v1", date: "Jul 12, 2026", by: "Recon", status: "Completed" },
  { name: "INV-8821", type: "Invoice", project: "Motor Control PCBA", version: "v1", date: "May 10, 2026", by: "Recon", status: "Paid" },
  { name: "Warranty Terms", type: "Warranty", project: "Motor Control PCBA", version: "v1", date: "May 2, 2026", by: "Recon", status: "Completed" },
  { name: "PO-40390-1", type: "Purchase Order", project: "Sensor Array Module", version: "v1", date: "Jun 3, 2026", by: "Customer", status: "Acknowledged" },
  { name: "BOM — Sensor Array Module", type: "BOM", project: "Sensor Array Module", version: "Rev 1", date: "Jun 9, 2026", by: "Customer", status: "Current" },
  { name: "INV-9011", type: "Invoice", project: "Sensor Array Module", version: "v1", date: "Jun 5, 2026", by: "Recon", status: "Paid" },
];

const ACTIVITY = {
  p1: [
    { cat: "Commercial", owner: "Commercial Desk", time: "Jul 10, 2026 · 09:12", head: "Payment received for INV-8821", notes: "Full payment reconciled against milestone 2 (Compliance approved).", attach: [] },
    { cat: "Technical", owner: "Recon Engineering", time: "Jul 6, 2026 · 15:40", head: "Clarification opened — C-104", notes: "Isolation voltage confirmation requested for ACS37800 (L-005).", attach: ["ACS37800_query.pdf"] },
    { cat: "Logistics", owner: "Logistics — EU", time: "Jul 1, 2026 · 08:05", head: "Manufacturing started", notes: "Production run initiated at qualified facility. First article inspection scheduled Jul 12.", attach: [] },
    { cat: "Compliance", owner: "Compliance — EU", time: "Apr 22, 2026 · 11:30", head: "Compliance approved", notes: "RoHS, REACH, and CE documentation completed and archived.", attach: ["Compliance_Package_v1.zip"] },
    { cat: "General", owner: "Recon Atlas", time: "Mar 27, 2026 · 17:02", head: "Supply network confirmed", notes: "Technical validation and supply network assessment completed with high confidence.", attach: [] },
    { cat: "General", owner: "Intake Team", time: "Mar 6, 2026 · 10:00", head: "Requirement submitted", notes: "BOM Rev 1 and CAD package received and logged.", attach: [] },
  ],
  p2: [
    { cat: "Technical", owner: "Recon Engineering", time: "Jul 9, 2026 · 13:00", head: "Clarification opened — C-220", notes: "RF module allocation constraint identified; second source qualification underway.", attach: [] },
    { cat: "General", owner: "Recon Atlas", time: "Jun 12, 2026 · 09:15", head: "Requirement analysis started", notes: "Technical parsing and cross-check of BOM Rev 1 underway.", attach: [] },
    { cat: "General", owner: "Intake Team", time: "May 23, 2026 · 14:20", head: "Requirement submitted", notes: "BOM Rev 1 received and logged.", attach: [] },
  ],
};

const nameToId = { "Motor Control PCBA": "p1", "Sensor Array Module": "p2" };

async function seedFirestore() {
  console.log('Starting Firestore seed…');
  const db = getFirestoreDB();
  const batch = db.batch();

  // 1. Create Organization
  const orgRef = db.collection('organizations').doc('org_nordwerk');
  batch.set(orgRef, {
    id: 'org_nordwerk',
    name: 'Nordwerk Industrial GmbH',
    createdAt: new Date().toISOString()
  });

  // 2. Create Users
  const passwordHash = await bcrypt.hash('recon1234', 10);
  const user1Ref = db.collection('users').doc('user_demo');
  batch.set(user1Ref, {
    id: 'user_demo',
    email: 'demo@reconcore.app',
    passwordHash,
    name: 'J. Weber',
    role: 'Procurement Lead',
    orgId: 'org_nordwerk',
    createdAt: new Date().toISOString()
  });

  const user2Ref = db.collection('users').doc('user_alvarez');
  batch.set(user2Ref, {
    id: 'user_alvarez',
    email: 'alvarez@reconcore.app',
    passwordHash,
    name: 'R. Alvarez',
    role: 'Procurement Lead',
    orgId: 'org_nordwerk',
    createdAt: new Date().toISOString()
  });

  // Commit org & users batch
  await batch.commit();
  console.log('✅ Organization and Users created.');

  // 3. Create Projects and Subcollections
  for (const key of Object.keys(PROJECTS)) {
    const p = PROJECTS[key];
    const projectRef = db.collection('projects').doc(p.id);

    await projectRef.set({
      id: p.id,
      code: p.code,
      name: p.name,
      industry: p.industry,
      application: p.application,
      quantity: p.quantity,
      value: p.value,
      currency: p.currency,
      location: p.location,
      kickoff: p.kickoff,
      targetDelivery: p.targetDelivery,
      status: p.status,
      risk: p.risk,
      riskReason: p.riskReason,
      completion: p.completion,
      currentStageIndex: p.currentStageIndex,
      confidence: p.confidence,
      confidenceLabel: p.confidenceLabel,
      categories: p.categories,
      stageDates: p.stageDates,
      contacts: p.contacts,
      reconTeam: p.reconTeam,
      certifications: p.certifications,
      complianceDocs: p.complianceDocs,
      customs: p.customs,
      commercial: p.commercial,
      logistics: p.logistics,
      orgId: 'org_nordwerk',
      updatedAt: new Date().toISOString()
    });

    // Subcollection: bom
    const bomBatch = db.batch();
    p.bom.forEach((b) => {
      const ref = projectRef.collection('bom').doc(b.lineId);
      bomBatch.set(ref, { ...b, projectId: p.id });
    });
    await bomBatch.commit();

    // Subcollection: clarifications
    for (const c of p.clarifications) {
      const cRef = projectRef.collection('clarifications').doc(c.code);
      await cRef.set({ code: c.code, subject: c.subject, status: c.status, projectId: p.id });

      const msgBatch = db.batch();
      c.messages.forEach((m, idx) => {
        const msgRef = cRef.collection('messages').doc(`msg_${idx}`);
        msgBatch.set(msgRef, { ...m, createdAt: new Date().toISOString() });
      });
      await msgBatch.commit();
    }

    // Subcollection: invoices
    const invBatch = db.batch();
    p.invoices.forEach((inv) => {
      const ref = projectRef.collection('invoices').doc(inv.code);
      invBatch.set(ref, { ...inv, projectId: p.id });
    });
    await invBatch.commit();

    // Subcollection: activities
    const actBatch = db.batch();
    (ACTIVITY[key] || []).forEach((a, idx) => {
      const ref = projectRef.collection('activities').doc(`act_${idx}`);
      actBatch.set(ref, { ...a, projectId: p.id, order: idx });
    });
    await actBatch.commit();

    console.log(`✅ Project ${p.code} and subcollections seeded.`);
  }

  // 4. Seed Documents
  const docBatch = db.batch();
  DOCUMENTS.forEach((d, idx) => {
    const docRef = db.collection('documents').doc(`doc_${idx}`);
    docBatch.set(docRef, {
      ...d,
      projectId: nameToId[d.project],
      orgId: 'org_nordwerk'
    });
  });
  await docBatch.commit();
  console.log('✅ Documents seeded.');

  console.log('🎉 Firestore seeding complete!');
}

seedFirestore().catch((err) => {
  console.error('Firestore Seed Failed:', err);
  process.exit(1);
});
