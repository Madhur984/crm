/* SQL implementation of the data repository (Prisma — SQLite locally / Postgres in cloud). */
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { serializeProject, serializeSummary, projectInclude } from "../serialize.js";

function today() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtWhen(d) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function safeParse(s, f) { try { return JSON.parse(s); } catch { return f; } }
async function firstProjectId(orgId) {
  const p = await prisma.project.findFirst({ where: { orgId }, orderBy: { id: "asc" } });
  return p ? p.id : null;
}
async function ownedProject(orgId, id, include = projectInclude) {
  const p = await prisma.project.findUnique({ where: { id }, include });
  if (!p || p.orgId !== orgId) return null;
  return p;
}

export const sqliteRepo = {
  driver: "sql",

  /* ---- Auth / users ---- */
  async getUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },
  async getUserById(id) {
    const u = await prisma.user.findUnique({ where: { id }, include: { org: true } });
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, orgId: u.orgId, org: { id: u.org.id, name: u.org.name } };
  },
  async updateProfile(userId, { name, phone }) {
    const data = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof phone === "string") data.phone = phone.trim();
    const u = await prisma.user.update({ where: { id: userId }, data });
    return { id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, orgId: u.orgId };
  },
  async changePassword(userId, current, next) {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (!u) return { error: "User not found" };
    if (!(await bcrypt.compare(current || "", u.passwordHash))) return { error: "Current password is incorrect" };
    if (!next || String(next).length < 6) return { error: "New password must be at least 6 characters" };
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, 10) } });
    return { ok: true };
  },

  /* ---- Projects ---- */
  async listProjectSummaries(orgId) {
    const projects = await prisma.project.findMany({ where: { orgId }, orderBy: { id: "asc" } });
    return projects.map(serializeSummary);
  },
  async getProject(orgId, id) {
    const p = await ownedProject(orgId, id);
    return p ? serializeProject(p) : null;
  },
  async getBom(orgId, id, q) {
    const p = await ownedProject(orgId, id, { bom: { orderBy: { lineId: "asc" } } });
    if (!p) return null;
    const needle = String(q || "").toLowerCase();
    return p.bom
      .map((b) => ({ id: b.lineId, dbId: b.id, part: b.part, desc: b.desc, qty: b.qty, alt: b.alt, status: b.status }))
      .filter((b) => (b.part + b.desc + b.id).toLowerCase().includes(needle));
  },
  async getActivity(orgId, id) {
    const p = await ownedProject(orgId, id, { activities: { orderBy: { order: "asc" } } });
    return p ? serializeProject({ ...p, bom: [], clarifications: [], invoices: [] }).activity : null;
  },

  /* ---- Global search ---- */
  async search(orgId, q) {
    const needle = String(q || "").toLowerCase().trim();
    if (!needle) return { projects: [], documents: [], bom: [] };
    const [projects, docs, bom] = await Promise.all([
      prisma.project.findMany({ where: { orgId } }),
      prisma.document.findMany({ where: { project: { orgId } }, include: { project: true } }),
      prisma.bomLine.findMany({ where: { project: { orgId } } }),
    ]);
    return {
      projects: projects.filter((p) => (p.name + p.code + p.industry).toLowerCase().includes(needle)).slice(0, 5).map((p) => ({ id: p.id, name: p.name, code: p.code })),
      documents: docs.filter((d) => (d.name + d.type + d.project.name).toLowerCase().includes(needle)).slice(0, 6).map((d) => ({ name: d.name, type: d.type, project: d.project.name, projectId: d.projectId })),
      bom: bom.filter((b) => (b.part + b.desc + b.lineId).toLowerCase().includes(needle)).slice(0, 6).map((b) => ({ id: b.lineId, part: b.part, desc: b.desc, projectId: b.projectId })),
    };
  },

  /* ---- Documents ---- */
  async searchDocuments(orgId, q, type) {
    const docs = await prisma.document.findMany({ where: { project: { orgId } }, include: { project: true }, orderBy: { id: "asc" } });
    const needle = String(q || "").toLowerCase();
    const t = type || "All";
    const documents = docs
      .map((d) => ({ id: d.id, name: d.name, type: d.type, project: d.project.name, version: d.version, date: d.date, by: d.by, status: d.status }))
      .filter((d) => (t === "All" || d.type === t) && (d.name + d.project).toLowerCase().includes(needle));
    const types = ["All", ...Array.from(new Set(docs.map((d) => d.type)))];
    return { documents, types };
  },
  async uploadDocument(orgId, { projectId, name, type = "Other", by = "Customer" }) {
    const p = await ownedProject(orgId, projectId, {});
    if (!p) return null;
    const d = await prisma.document.create({ data: { projectId, name, type, version: "v1", date: today(), by, status: "Uploaded" } });
    await this._notify(orgId, projectId, "General", "Document uploaded", `${name} was uploaded to ${p.name}.`);
    return { id: d.id, name: d.name, type: d.type, project: p.name, version: d.version, date: d.date, by: d.by, status: d.status };
  },

  /* ---- Clarifications ---- */
  async replyClarification(orgId, dbId, from, text) {
    const id = Number(dbId);
    const clar = await prisma.clarification.findUnique({ where: { id }, include: { project: true } });
    if (!clar || clar.project.orgId !== orgId) return null;
    await prisma.clarificationMessage.create({ data: { clarificationId: id, from, date: today(), text } });
    const updated = await prisma.clarification.findUnique({ where: { id }, include: { messages: { orderBy: { id: "asc" } } } });
    return {
      id: updated.code, dbId: updated.id, subject: updated.subject, status: updated.status,
      messages: updated.messages.map((m) => ({ from: m.from, date: m.date, text: m.text })),
    };
  },

  /* ---- Commercial ---- */
  async acceptQuote(orgId, id) {
    const p = await ownedProject(orgId, id, {});
    if (!p) return null;
    const commercial = safeParse(p.commercial, {});
    commercial.quoteAccepted = true;
    if (commercial.quote) commercial.quote.status = "Accepted";
    await prisma.project.update({ where: { id }, data: { commercial: JSON.stringify(commercial) } });
    await this._notify(orgId, id, "Commercial", "Quotation accepted", `You accepted quotation ${commercial.quote ? commercial.quote.id : ""} for ${p.name}.`);
    return true;
  },
  async payInvoice(orgId, dbId) {
    const id = Number(dbId);
    const inv = await prisma.invoice.findUnique({ where: { id }, include: { project: true } });
    if (!inv || inv.project.orgId !== orgId) return null;
    if (inv.status === "Paid") return { alreadyPaid: true };
    const updated = await prisma.invoice.update({ where: { id }, data: { status: "Paid" } });
    await prisma.activity.create({
      data: {
        projectId: inv.projectId, cat: "Commercial", owner: "Commercial Desk",
        time: today() + " · 00:00", head: `Payment received for ${inv.code}`,
        notes: `Payment of ${inv.amount} recorded via the customer portal.`, attach: "[]", order: -1,
      },
    });
    await this._notify(orgId, inv.projectId, "Commercial", "Payment received", `${inv.code} (${inv.amount}) was recorded as paid.`);
    return { invoice: { id: updated.code, dbId: updated.id, date: updated.date, amount: updated.amount, status: updated.status } };
  },

  /* ---- Change request / approvals ---- */
  async changeRequest(orgId, id, from, note) {
    const p = await ownedProject(orgId, id, {});
    if (!p) return null;
    const a = await prisma.activity.create({
      data: { projectId: id, cat: "Technical", owner: from, time: today() + " · 00:00", head: "Change request submitted", notes: note, attach: "[]", order: -1 },
    });
    await this._notify(orgId, id, "Technical", "Change request submitted", note);
    return { id: a.id, cat: a.cat, owner: a.owner, time: a.time, head: a.head, notes: a.notes, attach: [] };
  },
  async recordApproval(orgId, id, from, label, note) {
    const p = await ownedProject(orgId, id, {});
    if (!p) return null;
    const a = await prisma.activity.create({
      data: { projectId: id, cat: "Technical", owner: from, time: today() + " · 00:00", head: label, notes: note || label, attach: "[]", order: -1 },
    });
    await this._notify(orgId, id, "Technical", label, note || label);
    return { id: a.id, cat: a.cat, owner: a.owner, time: a.time, head: a.head, notes: a.notes, attach: [] };
  },

  /* ---- Tickets ---- */
  async listTickets(userId) {
    const tickets = await prisma.ticket.findMany({ where: { userId }, orderBy: { id: "desc" } });
    return tickets.map((t) => ({ id: t.code, category: t.category, priority: t.priority, description: t.description, status: t.status }));
  },
  async createTicket(userId, orgId, { category = "General", priority = "Normal", description = "", projectId }) {
    const pid = projectId || (await firstProjectId(orgId));
    const count = await prisma.ticket.count();
    const t = await prisma.ticket.create({ data: { code: `T-${1001 + count}`, projectId: pid, userId, category, priority, description } });
    await this._notify(orgId, pid, category, "Support ticket raised", `${t.code} (${priority}) — ${description.slice(0, 80)}`);
    return { id: t.code, category: t.category, priority: t.priority, description: t.description, status: t.status };
  },

  /* ---- Meetings ---- */
  async listMeetings(userId) {
    const rows = await prisma.meeting.findMany({ where: { userId }, orderBy: { id: "desc" } });
    return rows.map((m) => ({ id: m.code, topic: m.topic, mode: m.mode, date: m.date, time: m.time, status: m.status, projectId: m.projectId }));
  },
  async createMeeting(userId, orgId, { topic, mode = "Video call", date, time, projectId }) {
    const pid = projectId || (await firstProjectId(orgId));
    const count = await prisma.meeting.count();
    const m = await prisma.meeting.create({
      data: { code: `MTG-${1001 + count}`, userId, projectId: pid, topic: topic || "Project sync", mode, date: date || "TBD", time: time || "TBD", status: "Requested" },
    });
    await this._notify(orgId, pid, "General", "Meeting requested", `${mode} — “${m.topic}” (${m.date} ${m.time}).`);
    return { id: m.code, topic: m.topic, mode: m.mode, date: m.date, time: m.time, status: m.status, projectId: m.projectId };
  },

  /* ---- Messages ---- */
  async listMessages(userId, { channel, projectId, refId }) {
    const where = { userId };
    if (channel) where.channel = channel;
    if (projectId) where.projectId = projectId;
    if (refId) where.refId = refId;
    const messages = await prisma.message.findMany({ where, orderBy: { id: "asc" } });
    return messages.map((m) => ({ id: m.id, sender: m.sender, text: m.text, channel: m.channel, refId: m.refId }));
  },
  async createMessage(userId, orgId, { channel = "support", projectId, refId = null, text }) {
    const pid = projectId || (await firstProjectId(orgId));
    const mine = await prisma.message.create({ data: { projectId: pid, userId, channel, refId: refId ? String(refId) : null, sender: "You", text } });
    const replyText = channel === "support" ? "Got it — routing this to the right team now." : "Thanks for the update — noted.";
    const reply = await prisma.message.create({ data: { projectId: pid, userId, channel, refId: refId ? String(refId) : null, sender: "Recon", text: replyText } });
    return [mine, reply].map((m) => ({ id: m.id, sender: m.sender, text: m.text, channel: m.channel, refId: m.refId }));
  },

  /* ---- Notifications ---- */
  async _notify(orgId, projectId, cat, title, body) {
    const users = await prisma.user.findMany({ where: { orgId }, select: { id: true } });
    if (!users.length) return;
    await prisma.notification.createMany({ data: users.map((u) => ({ userId: u.id, projectId: projectId || null, cat, title, body })) });
  },
  async listNotifications(userId) {
    const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { id: "desc" }, take: 50 });
    return rows.map((n) => ({ id: n.id, cat: n.cat, title: n.title, body: n.body, read: n.read, projectId: n.projectId, time: fmtWhen(n.createdAt) }));
  },
  async markNotificationRead(userId, id) {
    await prisma.notification.updateMany({ where: { id: Number(id), userId }, data: { read: true } });
    return true;
  },
  async markAllNotificationsRead(userId) {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return true;
  },
};
