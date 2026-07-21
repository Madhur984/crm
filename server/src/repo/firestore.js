/* Firestore implementation of the data repository.
   Projects are stored as denormalized documents (already in the shape the
   frontend consumes), so reads are direct. Mutations read-modify-write the
   project doc. Composite dbIds ("projectId:code") let clarification/invoice
   mutations locate their parent without a scan. */
import bcrypt from "bcryptjs";
import { getFirestoreDB } from "../firebase.js";

function today() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtWhen(d) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const firestoreRepo = {
  driver: "firestore",

  async getUserByEmail(email) {
    const db = getFirestoreDB();
    const snap = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },
  async getUserById(id) {
    const db = getFirestoreDB();
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) return null;
    const u = doc.data();
    const orgDoc = await db.collection("organizations").doc(u.orgId).get();
    return { id: doc.id, email: u.email, name: u.name, role: u.role, orgId: u.orgId, org: { id: u.orgId, name: orgDoc.exists ? orgDoc.data().name : "" } };
  },

  async _projectsForOrg(orgId) {
    const db = getFirestoreDB();
    const snap = await db.collection("projects").where("orgId", "==", orgId).get();
    return snap.docs.map((d) => d.data()).sort((a, b) => a.id.localeCompare(b.id));
  },
  async _ownedProject(orgId, id) {
    const db = getFirestoreDB();
    const doc = await db.collection("projects").doc(id).get();
    if (!doc.exists) return null;
    const p = doc.data();
    return p.orgId === orgId ? p : null;
  },

  async listProjectSummaries(orgId) {
    const projects = await this._projectsForOrg(orgId);
    return projects.map((p) => ({ id: p.id, code: p.code, name: p.name, status: p.status, risk: p.risk, targetDelivery: p.targetDelivery }));
  },
  async getProject(orgId, id) {
    return this._ownedProject(orgId, id);
  },
  async getBom(orgId, id, q) {
    const p = await this._ownedProject(orgId, id);
    if (!p) return null;
    const needle = String(q || "").toLowerCase();
    return (p.bom || []).filter((b) => (b.part + b.desc + b.id).toLowerCase().includes(needle));
  },
  async getActivity(orgId, id) {
    const p = await this._ownedProject(orgId, id);
    return p ? (p.activity || []) : null;
  },

  async searchDocuments(orgId, q, type) {
    const db = getFirestoreDB();
    const projects = await this._projectsForOrg(orgId);
    const ids = projects.map((p) => p.id);
    if (ids.length === 0) return { documents: [], types: ["All"] };
    const snap = await db.collection("documents").where("projectId", "in", ids.slice(0, 30)).get();
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const needle = String(q || "").toLowerCase();
    const t = type || "All";
    const documents = all
      .map((d) => ({ id: d.id, name: d.name, type: d.type, project: d.project, version: d.version, date: d.date, by: d.by, status: d.status, _o: d.order || 0 }))
      .filter((d) => (t === "All" || d.type === t) && (d.name + d.project).toLowerCase().includes(needle))
      .sort((a, b) => a._o - b._o)
      .map(({ _o, ...d }) => d);
    const types = ["All", ...Array.from(new Set(all.map((d) => d.type)))];
    return { documents, types };
  },

  async replyClarification(orgId, dbId, from, text) {
    const db = getFirestoreDB();
    const [projectId] = String(dbId).split(":");
    const p = await this._ownedProject(orgId, projectId);
    if (!p) return null;
    const clar = (p.clarifications || []).find((c) => c.dbId === dbId);
    if (!clar) return null;
    clar.messages = [...(clar.messages || []), { from, date: today(), text }];
    await db.collection("projects").doc(projectId).update({ clarifications: p.clarifications });
    return { id: clar.id, dbId: clar.dbId, subject: clar.subject, status: clar.status, messages: clar.messages };
  },

  async acceptQuote(orgId, id) {
    const db = getFirestoreDB();
    const p = await this._ownedProject(orgId, id);
    if (!p) return null;
    p.commercial = p.commercial || {};
    p.commercial.quoteAccepted = true;
    if (p.commercial.quote) p.commercial.quote.status = "Accepted";
    await db.collection("projects").doc(id).update({ commercial: p.commercial });
    return true;
  },

  async payInvoice(orgId, dbId) {
    const db = getFirestoreDB();
    const [projectId] = String(dbId).split(":");
    const p = await this._ownedProject(orgId, projectId);
    if (!p) return null;
    const inv = ((p.commercial && p.commercial.invoices) || []).find((i) => i.dbId === dbId);
    if (!inv) return null;
    if (inv.status === "Paid") return { alreadyPaid: true };
    inv.status = "Paid";
    p.activity = [{
      id: `${projectId}-a-${Date.now()}`, cat: "Commercial", owner: "Commercial Desk",
      time: today() + " · 00:00", head: `Payment received for ${inv.id}`,
      notes: `Payment of ${inv.amount} recorded via the customer portal.`, attach: [],
    }, ...(p.activity || [])];
    await db.collection("projects").doc(projectId).update({ commercial: p.commercial, activity: p.activity });
    return { invoice: { id: inv.id, dbId: inv.dbId, date: inv.date, amount: inv.amount, status: inv.status } };
  },

  async changeRequest(orgId, id, from, note) {
    const db = getFirestoreDB();
    const p = await this._ownedProject(orgId, id);
    if (!p) return null;
    const a = { id: `${id}-a-${Date.now()}`, cat: "Technical", owner: from, time: today() + " · 00:00", head: "Change request submitted", notes: note, attach: [] };
    p.activity = [a, ...(p.activity || [])];
    await db.collection("projects").doc(id).update({ activity: p.activity });
    return a;
  },

  async listTickets(userId) {
    const db = getFirestoreDB();
    const snap = await db.collection("tickets").where("userId", "==", userId).get();
    return snap.docs.map((d) => d.data())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .map((t) => ({ id: t.code, category: t.category, priority: t.priority, description: t.description, status: t.status }));
  },
  async createTicket(userId, orgId, { category = "General", priority = "Normal", description = "", projectId }) {
    const db = getFirestoreDB();
    let pid = projectId;
    if (!pid) { const ps = await this._projectsForOrg(orgId); pid = ps[0] ? ps[0].id : null; }
    const count = (await db.collection("tickets").get()).size;
    const code = `T-${1001 + count}`;
    const t = { code, projectId: pid, userId, category, priority, description, status: "Open", createdAt: Date.now() };
    await db.collection("tickets").add(t);
    return { id: t.code, category: t.category, priority: t.priority, description: t.description, status: t.status };
  },

  async listMessages(userId, { channel, projectId, refId }) {
    const db = getFirestoreDB();
    const snap = await db.collection("messages").where("userId", "==", userId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((m) => (!channel || m.channel === channel) && (!projectId || m.projectId === projectId) && (!refId || m.refId === refId))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .map((m) => ({ id: m.id, sender: m.sender, text: m.text, channel: m.channel, refId: m.refId || null }));
  },
  async createMessage(userId, orgId, { channel = "support", projectId, refId = null, text }) {
    const db = getFirestoreDB();
    let pid = projectId;
    if (!pid) { const ps = await this._projectsForOrg(orgId); pid = ps[0] ? ps[0].id : null; }
    const now = Date.now();
    const base = { projectId: pid, userId, channel, refId: refId ? String(refId) : null };
    const mineRef = await db.collection("messages").add({ ...base, sender: "You", text, createdAt: now });
    const replyText = channel === "support" ? "Got it — routing this to the right team now." : "Thanks for the update — noted.";
    const replyRef = await db.collection("messages").add({ ...base, sender: "Recon", text: replyText, createdAt: now + 1 });
    return [
      { id: mineRef.id, sender: "You", text, channel, refId: base.refId },
      { id: replyRef.id, sender: "Recon", text: replyText, channel, refId: base.refId },
    ];
  },

  /* ---- Users / profile ---- */
  async updateProfile(userId, { name, phone }) {
    const db = getFirestoreDB();
    const ref = db.collection("users").doc(userId);
    const data = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof phone === "string") data.phone = phone.trim();
    await ref.update(data);
    const u = (await ref.get()).data();
    return { id: userId, email: u.email, name: u.name, role: u.role, phone: u.phone || null, orgId: u.orgId };
  },
  async changePassword(userId, current, next) {
    const db = getFirestoreDB();
    const ref = db.collection("users").doc(userId);
    const u = (await ref.get()).data();
    if (!u) return { error: "User not found" };
    if (!(await bcrypt.compare(current || "", u.passwordHash))) return { error: "Current password is incorrect" };
    if (!next || String(next).length < 6) return { error: "New password must be at least 6 characters" };
    await ref.update({ passwordHash: await bcrypt.hash(next, 10) });
    return { ok: true };
  },

  /* ---- Global search ---- */
  async search(orgId, q) {
    const needle = String(q || "").toLowerCase().trim();
    if (!needle) return { projects: [], documents: [], bom: [] };
    const projects = await this._projectsForOrg(orgId);
    const projMatches = projects.filter((p) => (p.name + p.code + p.industry).toLowerCase().includes(needle)).slice(0, 5).map((p) => ({ id: p.id, name: p.name, code: p.code }));
    const bomMatches = projects.flatMap((p) => (p.bom || []).map((b) => ({ ...b, projectId: p.id })))
      .filter((b) => (b.part + b.desc + b.id).toLowerCase().includes(needle)).slice(0, 6).map((b) => ({ id: b.id, part: b.part, desc: b.desc, projectId: b.projectId }));
    const { documents } = await this.searchDocuments(orgId, needle, "All");
    return { projects: projMatches, documents: documents.slice(0, 6).map((d) => ({ name: d.name, type: d.type, project: d.project, projectId: d.projectId || null })), bom: bomMatches };
  },

  /* ---- Documents ---- */
  async uploadDocument(orgId, { projectId, name, type = "Other", by = "Customer" }) {
    const db = getFirestoreDB();
    const p = await this._ownedProject(orgId, projectId);
    if (!p) return null;
    const doc = { projectId, project: p.name, name, type, version: "v1", date: today(), by, status: "Uploaded", order: Date.now() };
    const ref = await db.collection("documents").add(doc);
    await this._notify(orgId, projectId, "General", "Document uploaded", `${name} was uploaded to ${p.name}.`);
    return { id: ref.id, ...doc };
  },

  /* ---- Approvals ---- */
  async recordApproval(orgId, id, from, label, note) {
    const db = getFirestoreDB();
    const p = await this._ownedProject(orgId, id);
    if (!p) return null;
    const a = { id: `${id}-a-${Date.now()}`, cat: "Technical", owner: from, time: today() + " · 00:00", head: label, notes: note || label, attach: [] };
    p.activity = [a, ...(p.activity || [])];
    await db.collection("projects").doc(id).update({ activity: p.activity });
    await this._notify(orgId, id, "Technical", label, note || label);
    return a;
  },

  /* ---- Meetings ---- */
  async listMeetings(userId) {
    const db = getFirestoreDB();
    const snap = await db.collection("meetings").where("userId", "==", userId).get();
    return snap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .map((m) => ({ id: m.code, topic: m.topic, mode: m.mode, date: m.date, time: m.time, status: m.status, projectId: m.projectId }));
  },
  async createMeeting(userId, orgId, { topic, mode = "Video call", date, time, projectId }) {
    const db = getFirestoreDB();
    let pid = projectId;
    if (!pid) { const ps = await this._projectsForOrg(orgId); pid = ps[0] ? ps[0].id : null; }
    const count = (await db.collection("meetings").get()).size;
    const m = { code: `MTG-${1001 + count}`, userId, projectId: pid, topic: topic || "Project sync", mode, date: date || "TBD", time: time || "TBD", status: "Requested", createdAt: Date.now() };
    await db.collection("meetings").add(m);
    await this._notify(orgId, pid, "General", "Meeting requested", `${mode} — “${m.topic}” (${m.date} ${m.time}).`);
    return { id: m.code, topic: m.topic, mode: m.mode, date: m.date, time: m.time, status: m.status, projectId: m.projectId };
  },

  /* ---- Notifications ---- */
  async _notify(orgId, projectId, cat, title, body) {
    const db = getFirestoreDB();
    const snap = await db.collection("users").where("orgId", "==", orgId).get();
    const now = Date.now();
    await Promise.all(snap.docs.map((u) => db.collection("notifications").add({ userId: u.id, projectId: projectId || null, cat, title, body, read: false, createdAt: now })));
  },
  async listNotifications(userId) {
    const db = getFirestoreDB();
    const snap = await db.collection("notifications").where("userId", "==", userId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 50)
      .map((n) => ({ id: n.id, cat: n.cat, title: n.title, body: n.body, read: !!n.read, projectId: n.projectId, time: fmtWhen(n.createdAt) }));
  },
  async markNotificationRead(userId, id) {
    const db = getFirestoreDB();
    const ref = db.collection("notifications").doc(String(id));
    const doc = await ref.get();
    if (doc.exists && doc.data().userId === userId) await ref.update({ read: true });
    return true;
  },
  async markAllNotificationsRead(userId) {
    const db = getFirestoreDB();
    const snap = await db.collection("notifications").where("userId", "==", userId).where("read", "==", false).get();
    await Promise.all(snap.docs.map((d) => d.ref.update({ read: true })));
    return true;
  },
};
