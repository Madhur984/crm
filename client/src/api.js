/* Thin fetch wrapper with bearer-token auth against the Recon Core API. */
const BASE = "/api";
let token = localStorage.getItem("rc_token") || null;

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("rc_token", t);
  else localStorage.removeItem("rc_token");
}
export function getToken() { return token; }

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });

  if (res.status === 401 && path !== "/auth/login") {
    setToken(null);
    if (window.location.pathname !== "/login") window.location.assign("/login");
    throw new Error("Session expired");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request("/auth/me"),

  projects: () => request("/projects"),
  project: (id) => request(`/projects/${id}`),
  bom: (id, q) => request(`/projects/${id}/bom?q=${encodeURIComponent(q || "")}`),
  activity: (id) => request(`/projects/${id}/activity`),

  documents: (q, type) => request(`/documents?q=${encodeURIComponent(q || "")}&type=${encodeURIComponent(type || "All")}`),

  replyClarification: (dbId, text) => request(`/clarifications/${dbId}/messages`, { method: "POST", body: JSON.stringify({ text }) }),
  acceptQuote: (id) => request(`/projects/${id}/quote/accept`, { method: "POST" }),
  payInvoice: (dbId) => request(`/invoices/${dbId}/pay`, { method: "POST" }),
  changeRequest: (id, note) => request(`/projects/${id}/change-request`, { method: "POST", body: JSON.stringify({ note }) }),

  tickets: () => request("/tickets"),
  createTicket: (body) => request("/tickets", { method: "POST", body: JSON.stringify(body) }),

  messages: (params) => request("/messages?" + new URLSearchParams(params).toString()),
  sendMessage: (body) => request("/messages", { method: "POST", body: JSON.stringify(body) }),
};
