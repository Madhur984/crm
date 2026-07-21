import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PROJECTS, DOCUMENTS, ACTIVITY, nameToId, USERS, ORG_NAME, NOTIFICATIONS } from "./seed-data.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting data…");
  await prisma.notification.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.message.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.document.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.clarificationMessage.deleteMany();
  await prisma.clarification.deleteMany();
  await prisma.bomLine.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({ data: { name: ORG_NAME } });

  const passwordHash = await bcrypt.hash("recon1234", 10);
  const users = [];
  for (const u of USERS) {
    users.push(await prisma.user.create({ data: { ...u, passwordHash, orgId: org.id } }));
  }

  for (const key of Object.keys(PROJECTS)) {
    const p = PROJECTS[key];
    await prisma.project.create({
      data: {
        id: p.id, code: p.code, name: p.name, industry: p.industry, application: p.application,
        quantity: p.quantity, value: p.value, currency: p.currency, location: p.location,
        kickoff: p.kickoff, targetDelivery: p.targetDelivery, status: p.status, risk: p.risk,
        riskReason: p.riskReason, completion: p.completion, currentStageIndex: p.currentStageIndex,
        confidence: p.confidence, confidenceLabel: p.confidenceLabel,
        categories: JSON.stringify(p.categories),
        stageDates: JSON.stringify(p.stageDates),
        contacts: JSON.stringify(p.contacts),
        reconTeam: JSON.stringify(p.reconTeam),
        certifications: JSON.stringify(p.certifications),
        complianceDocs: JSON.stringify(p.complianceDocs),
        customs: JSON.stringify(p.customs),
        commercial: JSON.stringify(p.commercial),
        logistics: JSON.stringify(p.logistics),
        orgId: org.id,
        bom: { create: p.bom },
        clarifications: {
          create: p.clarifications.map((c) => ({
            code: c.code, subject: c.subject, status: c.status,
            messages: { create: c.messages },
          })),
        },
        invoices: { create: p.invoices },
      },
    });
  }

  for (const d of DOCUMENTS) {
    await prisma.document.create({
      data: { projectId: nameToId[d.project], name: d.name, type: d.type, version: d.version, date: d.date, by: d.by, status: d.status },
    });
  }

  for (const key of Object.keys(ACTIVITY)) {
    let order = 0;
    for (const a of ACTIVITY[key]) {
      await prisma.activity.create({
        data: { projectId: key, cat: a.cat, owner: a.owner, time: a.time, head: a.head, notes: a.notes, attach: JSON.stringify(a.attach), order: order++ },
      });
    }
  }

  // Notifications — seeded for every user
  for (const user of users) {
    for (const n of NOTIFICATIONS) {
      await prisma.notification.create({
        data: { userId: user.id, projectId: n.projectId, cat: n.cat, title: n.title, body: n.body, read: n.read },
      });
    }
  }

  console.log("Seed complete: 1 org, 2 users, 2 projects, documents, activity & notifications loaded.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
