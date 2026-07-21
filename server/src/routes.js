import express from "express";
import { prisma } from "./prisma.js";
import { serializeProject, serializeSummary, projectInclude } from "./serialize.js";

export const api = express.Router();

/* Resolve a project and enforce it belongs to the caller's org */
async function getOwnedProject(req, res, include = projectInclude) {
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include });
  if (!project || project.orgId !== req.user.orgId) {
    res.status(404).json({ error: "Project not found" });
    return null;
  }
  return project;
}

/* ---- Projects ---- */
api.get("/projects", async (req, res) => {
  const projects = await prisma.project.findMany({ where: { orgId: req.user.orgId }, orderBy: { id: "asc" } });
  res.json({ projects: projects.map(serializeSummary) });
});

api.get("/projects/:id", async (req, res) => {
  const project = await getOwnedProject(req, res);
  if (!project) return;
  res.json({ project: serializeProject(project) });
});

api.get("/projects/:id/bom", async (req, res) => {
  const project = await getOwnedProject(req, res);
  if (!project) return;
  const q = String(req.query.q || "").toLowerCase();
  const bom = project.bom
    .map((b) => ({ id: b.lineId, dbId: b.id, part: b.part, desc: b.desc, qty: b.qty, alt: b.alt, status: b.status }))
    .filter((b) => (b.part + b.desc + b.id).toLowerCase().includes(q));
  res.json({ bom });
});

api.get("/projects/:id/activity", async (req, res) => {
  const project = await getOwnedProject(req, res);
  if (!project) return;
  res.json({ activity: serializeProject(project).activity });
});

/* ---- Documents (across the org's projects) ---- */
api.get("/documents", async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const type = String(req.query.type || "All");
  const docs = await prisma.document.findMany({
    where: { project: { orgId: req.user.orgId } },
    include: { project: true },
    orderBy: { id: "asc" },
  });
  const rows = docs
    .map((d) => ({ id: d.id, name: d.name, type: d.type, project: d.project.name, version: d.version, date: d.date, by: d.by, status: d.status }))
    .filter((d) => (type === "All" || d.type === type) && (d.name + d.project).toLowerCase().includes(q));
  const types = ["All", ...Array.from(new Set(docs.map((d) => d.type)))];
  res.json({ documents: rows, types });
});

/* ---- Clarifications: customer reply ---- */
api.post("/clarifications/:dbId/messages", async (req, res) => {
  const dbId = Number(req.params.dbId);
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "Message text is required" });
  const clar = await prisma.clarification.findUnique({ where: { id: dbId }, include: { project: true } });
  if (!clar || clar.project.orgId !== req.user.orgId) return res.status(404).json({ error: "Clarification not found" });

  await prisma.clarificationMessage.create({
    data: { clarificationId: dbId, from: req.user.name, date: today(), text },
  });
  const updated = await prisma.clarification.findUnique({ where: { id: dbId }, include: { messages: { orderBy: { id: "asc" } } } });
  res.json({
    clarification: {
      id: updated.code, dbId: updated.id, subject: updated.subject, status: updated.status,
      messages: updated.messages.map((m) => ({ from: m.from, date: m.date, text: m.text })),
    },
  });
});

/* ---- Commercial: accept quote / pay invoice ---- */
api.post("/projects/:id/quote/accept", async (req, res) => {
  const project = await getOwnedProject(req, res, {});
  if (!project) return;
  const commercial = safeParse(project.commercial, {});
  commercial.quoteAccepted = true;
  if (commercial.quote) commercial.quote.status = "Accepted";
  await prisma.project.update({ where: { id: project.id }, data: { commercial: JSON.stringify(commercial) } });
  res.json({ ok: true, quoteAccepted: true });
});

api.post("/invoices/:dbId/pay", async (req, res) => {
  const dbId = Number(req.params.dbId);
  const invoice = await prisma.invoice.findUnique({ where: { id: dbId }, include: { project: true } });
  if (!invoice || invoice.project.orgId !== req.user.orgId) return res.status(404).json({ error: "Invoice not found" });
  if (invoice.status === "Paid") return res.status(400).json({ error: "Invoice already paid" });
  const updated = await prisma.invoice.update({ where: { id: dbId }, data: { status: "Paid" } });
  await prisma.activity.create({
    data: {
      projectId: invoice.projectId, cat: "Commercial", owner: "Commercial Desk",
      time: today() + " · 00:00", head: `Payment received for ${invoice.code}`,
      notes: `Payment of ${invoice.amount} recorded via the customer portal.`, attach: "[]", order: -1,
    },
  });
  res.json({ invoice: { id: updated.code, dbId: updated.id, date: updated.date, amount: updated.amount, status: updated.status } });
});

/* ---- Tickets ---- */
api.get("/tickets", async (req, res) => {
  const tickets = await prisma.ticket.findMany({ where: { userId: req.user.id }, orderBy: { id: "desc" } });
  res.json({ tickets: tickets.map((t) => ({ id: t.code, category: t.category, priority: t.priority, description: t.description, status: t.status })) });
});

api.post("/tickets", async (req, res) => {
  const { category = "General", priority = "Normal", description = "", projectId } = req.body || {};
  if (!String(description).trim()) return res.status(400).json({ error: "A description is required" });
  const pid = projectId || (await firstProjectId(req.user.orgId));
  const count = await prisma.ticket.count();
  const ticket = await prisma.ticket.create({
    data: { code: `T-${1001 + count}`, projectId: pid, userId: req.user.id, category, priority, description: String(description).trim() },
  });
  res.status(201).json({ ticket: { id: ticket.code, category: ticket.category, priority: ticket.priority, description: ticket.description, status: ticket.status } });
});

/* ---- Messages (support chat + activity replies) ---- */
api.get("/messages", async (req, res) => {
  const where = { userId: req.user.id };
  if (req.query.channel) where.channel = String(req.query.channel);
  if (req.query.projectId) where.projectId = String(req.query.projectId);
  if (req.query.refId) where.refId = String(req.query.refId);
  const messages = await prisma.message.findMany({ where, orderBy: { id: "asc" } });
  res.json({ messages: messages.map((m) => ({ id: m.id, sender: m.sender, text: m.text, channel: m.channel, refId: m.refId })) });
});

api.post("/messages", async (req, res) => {
  const { channel = "support", projectId, refId = null, text } = req.body || {};
  if (!String(text || "").trim()) return res.status(400).json({ error: "Message text is required" });
  const pid = projectId || (await firstProjectId(req.user.orgId));
  const mine = await prisma.message.create({
    data: { projectId: pid, userId: req.user.id, channel, refId: refId ? String(refId) : null, sender: "You", text: String(text).trim() },
  });
  // Auto acknowledgement from Recon
  const replyText = channel === "support"
    ? "Got it — routing this to the right team now."
    : "Thanks for the update — noted.";
  const reply = await prisma.message.create({
    data: { projectId: pid, userId: req.user.id, channel, refId: refId ? String(refId) : null, sender: "Recon", text: replyText },
  });
  res.status(201).json({ messages: [mine, reply].map((m) => ({ id: m.id, sender: m.sender, text: m.text, channel: m.channel, refId: m.refId })) });
});

/* ---- Change request (Technical page) ---- */
api.post("/projects/:id/change-request", async (req, res) => {
  const project = await getOwnedProject(req, res, {});
  if (!project) return;
  const note = String(req.body?.note || "Customer requested a change to the technical baseline.").trim();
  const activity = await prisma.activity.create({
    data: {
      projectId: project.id, cat: "Technical", owner: req.user.name, time: today() + " · 00:00",
      head: "Change request submitted", notes: note, attach: "[]", order: -1,
    },
  });
  res.status(201).json({ activity: { id: activity.id, cat: activity.cat, owner: activity.owner, time: activity.time, head: activity.head, notes: activity.notes, attach: [] } });
});

/* ---- helpers ---- */
function today() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function safeParse(s, f) { try { return JSON.parse(s); } catch { return f; } }
async function firstProjectId(orgId) {
  const p = await prisma.project.findFirst({ where: { orgId }, orderBy: { id: "asc" } });
  return p ? p.id : null;
}
