/* Seeds Firestore with the demo data (run: npm run db:seed:firebase).
   Requires Firebase credentials in the environment — see FIREBASE.md.

   Model: each project is ONE denormalized document (bom, clarifications,
   invoices, activity embedded) in the exact shape the frontend consumes, so a
   project load is a single Firestore read. Mutations locate embedded
   clarifications/invoices via composite dbIds ("projectId:code"). */
import bcrypt from "bcryptjs";
import { getFirestoreDB } from "../src/firebase.js";
import { PROJECTS, DOCUMENTS, ACTIVITY, nameToId, USERS, ORG_NAME } from "./seed-data.js";

const ORG_ID = "org_nordwerk";
const userIdFor = (email) => "user_" + email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();

function buildProjectDoc(p, activityList) {
  return {
    id: p.id, code: p.code, name: p.name, industry: p.industry, application: p.application,
    quantity: p.quantity, value: p.value, currency: p.currency, location: p.location,
    kickoff: p.kickoff, targetDelivery: p.targetDelivery, status: p.status, risk: p.risk,
    riskReason: p.riskReason, completion: p.completion, currentStageIndex: p.currentStageIndex,
    confidence: p.confidence, confidenceLabel: p.confidenceLabel,
    categories: p.categories, stageDates: p.stageDates, contacts: p.contacts, reconTeam: p.reconTeam,
    certifications: p.certifications, complianceDocs: p.complianceDocs, customs: p.customs, logistics: p.logistics,
    orgId: ORG_ID,
    commercial: {
      ...p.commercial,
      invoices: p.invoices.map((inv) => ({ id: inv.code, dbId: `${p.id}:${inv.code}`, date: inv.date, amount: inv.amount, status: inv.status })),
    },
    bom: p.bom.map((b) => ({ id: b.lineId, dbId: b.lineId, part: b.part, desc: b.desc, qty: b.qty, alt: b.alt, status: b.status })),
    clarifications: p.clarifications.map((c) => ({ id: c.code, dbId: `${p.id}:${c.code}`, subject: c.subject, status: c.status, messages: c.messages })),
    activity: activityList.map((a, i) => ({ id: `${p.id}-a${i}`, cat: a.cat, owner: a.owner, time: a.time, head: a.head, notes: a.notes, attach: a.attach })),
  };
}

async function clearCollection(db, name) {
  const snap = await db.collection(name).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

async function main() {
  const db = getFirestoreDB();

  console.log("Clearing existing collections…");
  for (const c of ["organizations", "users", "projects", "documents", "tickets", "messages"]) {
    await clearCollection(db, c);
  }

  console.log("Writing organization & users…");
  await db.collection("organizations").doc(ORG_ID).set({ id: ORG_ID, name: ORG_NAME });
  const passwordHash = await bcrypt.hash("recon1234", 10);
  for (const u of USERS) {
    const id = userIdFor(u.email);
    await db.collection("users").doc(id).set({ id, email: u.email, passwordHash, name: u.name, role: u.role, orgId: ORG_ID });
  }

  console.log("Writing projects…");
  for (const key of Object.keys(PROJECTS)) {
    await db.collection("projects").doc(key).set(buildProjectDoc(PROJECTS[key], ACTIVITY[key] || []));
  }

  console.log("Writing documents…");
  let order = 0;
  for (const d of DOCUMENTS) {
    await db.collection("documents").doc(`doc_${order}`).set({
      projectId: nameToId[d.project], project: d.project, name: d.name, type: d.type,
      version: d.version, date: d.date, by: d.by, status: d.status, order: order++,
    });
  }

  console.log("🎉 Firestore seed complete: 1 org, 2 users, 2 projects, documents loaded.");
}

main().then(() => process.exit(0)).catch((err) => { console.error("Firestore seed failed:", err); process.exit(1); });
