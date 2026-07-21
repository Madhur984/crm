/* Turn a Project DB row (JSON string columns + child relations) into the rich
   object the frontend consumes — shaped to match the original prototype. */

const J = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

export function serializeProject(p) {
  const commercial = J(p.commercial, {});
  // Fold invoice records back into commercial for the Commercial page
  commercial.invoices = (p.invoices || []).map((i) => ({
    id: i.code, dbId: i.id, date: i.date, amount: i.amount, status: i.status,
  }));

  return {
    id: p.id, code: p.code, name: p.name, industry: p.industry, application: p.application,
    quantity: p.quantity, value: p.value, currency: p.currency, location: p.location,
    kickoff: p.kickoff, targetDelivery: p.targetDelivery, status: p.status, risk: p.risk,
    riskReason: p.riskReason, completion: p.completion, currentStageIndex: p.currentStageIndex,
    confidence: p.confidence, confidenceLabel: p.confidenceLabel,
    categories: J(p.categories, []),
    stageDates: J(p.stageDates, []),
    contacts: J(p.contacts, []),
    reconTeam: J(p.reconTeam, []),
    certifications: J(p.certifications, []),
    complianceDocs: J(p.complianceDocs, []),
    customs: J(p.customs, { importReview: "Pending", exportReview: "Pending", hs: [] }),
    commercial,
    logistics: J(p.logistics, {}),
    bom: (p.bom || []).map((b) => ({
      id: b.lineId, dbId: b.id, part: b.part, desc: b.desc, qty: b.qty, alt: b.alt, status: b.status,
    })),
    clarifications: (p.clarifications || []).map((c) => ({
      id: c.code, dbId: c.id, subject: c.subject, status: c.status,
      messages: (c.messages || []).map((m) => ({ from: m.from, date: m.date, text: m.text })),
    })),
    activity: (p.activities || []).map((a) => ({
      id: a.id, cat: a.cat, owner: a.owner, time: a.time, head: a.head, notes: a.notes,
      attach: J(a.attach, []),
    })),
  };
}

export function serializeSummary(p) {
  return { id: p.id, code: p.code, name: p.name, status: p.status, risk: p.risk, targetDelivery: p.targetDelivery };
}

export const projectInclude = {
  bom: { orderBy: { lineId: "asc" } },
  clarifications: { include: { messages: { orderBy: { id: "asc" } } }, orderBy: { id: "desc" } },
  invoices: { orderBy: { id: "asc" } },
  activities: { orderBy: { order: "asc" } },
};
