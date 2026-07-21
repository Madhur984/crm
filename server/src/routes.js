import express from "express";
import { db } from "./repo/index.js";

export const api = express.Router();

/* ---- Projects ---- */
api.get("/projects", async (req, res) => {
  const projects = await db.listProjectSummaries(req.user.orgId);
  res.json({ projects });
});

api.get("/projects/:id", async (req, res) => {
  const project = await db.getProject(req.user.orgId, req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ project });
});

api.get("/projects/:id/bom", async (req, res) => {
  const bom = await db.getBom(req.user.orgId, req.params.id, req.query.q);
  if (bom === null) return res.status(404).json({ error: "Project not found" });
  res.json({ bom });
});

api.get("/projects/:id/activity", async (req, res) => {
  const activity = await db.getActivity(req.user.orgId, req.params.id);
  if (activity === null) return res.status(404).json({ error: "Project not found" });
  res.json({ activity });
});

/* ---- Documents ---- */
api.get("/documents", async (req, res) => {
  const result = await db.searchDocuments(req.user.orgId, req.query.q, req.query.type);
  res.json(result);
});

/* ---- Clarifications ---- */
api.post("/clarifications/:dbId/messages", async (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "Message text is required" });
  const clarification = await db.replyClarification(req.user.orgId, req.params.dbId, req.user.name, text);
  if (!clarification) return res.status(404).json({ error: "Clarification not found" });
  res.json({ clarification });
});

/* ---- Commercial ---- */
api.post("/projects/:id/quote/accept", async (req, res) => {
  const ok = await db.acceptQuote(req.user.orgId, req.params.id);
  if (!ok) return res.status(404).json({ error: "Project not found" });
  res.json({ ok: true, quoteAccepted: true });
});

api.post("/invoices/:dbId/pay", async (req, res) => {
  const result = await db.payInvoice(req.user.orgId, req.params.dbId);
  if (!result) return res.status(404).json({ error: "Invoice not found" });
  if (result.alreadyPaid) return res.status(400).json({ error: "Invoice already paid" });
  res.json({ invoice: result.invoice });
});

/* ---- Change request ---- */
api.post("/projects/:id/change-request", async (req, res) => {
  const note = String(req.body?.note || "Customer requested a change to the technical baseline.").trim();
  const activity = await db.changeRequest(req.user.orgId, req.params.id, req.user.name, note);
  if (!activity) return res.status(404).json({ error: "Project not found" });
  res.status(201).json({ activity });
});

/* ---- Tickets ---- */
api.get("/tickets", async (req, res) => {
  const tickets = await db.listTickets(req.user.id);
  res.json({ tickets });
});

api.post("/tickets", async (req, res) => {
  const { category, priority, description, projectId } = req.body || {};
  if (!String(description || "").trim()) return res.status(400).json({ error: "A description is required" });
  const ticket = await db.createTicket(req.user.id, req.user.orgId, { category, priority, description: String(description).trim(), projectId });
  res.status(201).json({ ticket });
});

/* ---- Messages ---- */
api.get("/messages", async (req, res) => {
  const messages = await db.listMessages(req.user.id, { channel: req.query.channel, projectId: req.query.projectId, refId: req.query.refId });
  res.json({ messages });
});

api.post("/messages", async (req, res) => {
  const { channel, projectId, refId, text } = req.body || {};
  if (!String(text || "").trim()) return res.status(400).json({ error: "Message text is required" });
  const messages = await db.createMessage(req.user.id, req.user.orgId, { channel, projectId, refId, text: String(text).trim() });
  res.status(201).json({ messages });
});

/* ---- Global search ---- */
api.get("/search", async (req, res) => {
  const results = await db.search(req.user.orgId, req.query.q);
  res.json(results);
});

/* ---- Notifications ---- */
api.get("/notifications", async (req, res) => {
  const notifications = await db.listNotifications(req.user.id);
  res.json({ notifications, unread: notifications.filter((n) => !n.read).length });
});
api.post("/notifications/read-all", async (req, res) => {
  await db.markAllNotificationsRead(req.user.id);
  res.json({ ok: true });
});
api.post("/notifications/:id/read", async (req, res) => {
  await db.markNotificationRead(req.user.id, req.params.id);
  res.json({ ok: true });
});

/* ---- Meetings ---- */
api.get("/meetings", async (req, res) => {
  const meetings = await db.listMeetings(req.user.id);
  res.json({ meetings });
});
api.post("/meetings", async (req, res) => {
  const { topic, mode, date, time, projectId } = req.body || {};
  if (!String(topic || "").trim()) return res.status(400).json({ error: "A topic is required" });
  const meeting = await db.createMeeting(req.user.id, req.user.orgId, { topic: String(topic).trim(), mode, date, time, projectId });
  res.status(201).json({ meeting });
});

/* ---- Profile ---- */
api.patch("/profile", async (req, res) => {
  const { name, phone } = req.body || {};
  const user = await db.updateProfile(req.user.id, { name, phone });
  res.json({ user });
});
api.post("/profile/password", async (req, res) => {
  const { current, next } = req.body || {};
  const result = await db.changePassword(req.user.id, current, next);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ ok: true });
});

/* ---- Document upload ---- */
api.post("/projects/:id/documents", async (req, res) => {
  const { name, type } = req.body || {};
  if (!String(name || "").trim()) return res.status(400).json({ error: "A document name is required" });
  const document = await db.uploadDocument(req.user.orgId, { projectId: req.params.id, name: String(name).trim(), type, by: "Customer" });
  if (!document) return res.status(404).json({ error: "Project not found" });
  res.status(201).json({ document });
});

/* ---- Approvals ---- */
api.post("/projects/:id/approve", async (req, res) => {
  const { label, note } = req.body || {};
  const activity = await db.recordApproval(req.user.orgId, req.params.id, req.user.name, String(label || "Approval recorded").trim(), note);
  if (!activity) return res.status(404).json({ error: "Project not found" });
  res.status(201).json({ activity });
});
