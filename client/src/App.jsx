import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import { api } from "./api.js";
import { T, MONO, SANS, R, SH, BORDER, catStyle } from "./theme.js";
import { Toast, Spinner, Pill } from "./components/ui.jsx";
import {
  LayoutDashboard, FolderKanban, FileText, Radar, ShieldCheck, Receipt, Truck,
  Files, MessageSquare, LifeBuoy, Search, Bell, ChevronDown, Building2, LogOut,
  Settings, CheckCircle2, Menu, FolderKanban as ProjIcon,
} from "./icons.jsx";

import LoginPage from "./pages/Login.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import ProjectDetailsPage from "./pages/ProjectDetails.jsx";
import TechnicalPage from "./pages/Technical.jsx";
import AtlasPage from "./pages/Atlas.jsx";
import CompliancePage from "./pages/Compliance.jsx";
import CommercialPage from "./pages/Commercial.jsx";
import LogisticsPage from "./pages/Logistics.jsx";
import DocumentsPage from "./pages/Documents.jsx";
import CommunicationPage from "./pages/Communication.jsx";
import SupportPage from "./pages/Support.jsx";
import SettingsPage from "./pages/Settings.jsx";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "project", label: "Project Details", icon: FolderKanban },
  { id: "technical", label: "Technical Requirements", icon: FileText },
  { id: "atlas", label: "Recon Atlas", icon: Radar },
  { id: "compliance", label: "Compliance Centre", icon: ShieldCheck },
  { id: "commercial", label: "Commercial Centre", icon: Receipt },
  { id: "logistics", label: "Logistics Centre", icon: Truck },
  { id: "documents", label: "Document Centre", icon: Files },
  { id: "communication", label: "Communication Centre", icon: MessageSquare },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const PAGES = {
  dashboard: DashboardPage,
  project: ProjectDetailsPage,
  technical: TechnicalPage,
  atlas: AtlasPage,
  compliance: CompliancePage,
  commercial: CommercialPage,
  logistics: LogisticsPage,
  documents: DocumentsPage,
  communication: CommunicationPage,
  support: SupportPage,
  settings: SettingsPage,
};

function SearchGroup({ label, items, render }) {
  return (
    <div>
      <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 800, color: T.faint, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
      {items.map((it, i) => render(it, i))}
    </div>
  );
}
function SearchRow({ onClick, icon, title, sub }) {
  return (
    <div onClick={onClick} className="rc-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer" }}>
      <div style={{ width: 26, height: 26, borderRadius: 5, background: T.panelAlt, border: `1.5px solid ${T.edge}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ fontSize: 11, color: T.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreen><Spinner label="Loading portal…" /></FullScreen>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function FullScreen({ children }) {
  return (
    <div style={{ fontFamily: SANS, background: T.mist, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  );
}

/* /app → redirect to the first project's dashboard */
function FirstProjectRedirect() {
  const [target, setTarget] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    api.projects()
      .then(({ projects }) => setTarget(projects[0] ? `/app/${projects[0].id}/dashboard` : null))
      .catch((e) => setErr(e.message));
  }, []);
  if (err) return <FullScreen><div style={{ color: T.faint }}>{err}</div></FullScreen>;
  if (!target) return <FullScreen><Spinner label="Loading projects…" /></FullScreen>;
  return <Navigate to={target} replace />;
}

function AppShell() {
  const { projectId, page } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summaries, setSummaries] = useState([]);
  const [proj, setProj] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  };

  useEffect(() => { api.projects().then(({ projects }) => setSummaries(projects)).catch(() => {}); }, []);

  const loadProject = () => {
    setLoadErr(null);
    api.project(projectId).then(({ project }) => setProj(project)).catch((e) => setLoadErr(e.message));
  };
  useEffect(() => { setProj(null); loadProject(); /* eslint-disable-next-line */ }, [projectId]);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const loadNotifs = () => api.notifications().then(({ notifications, unread }) => { setNotifs(notifications); setUnread(unread); }).catch(() => {});
  useEffect(() => { loadNotifs(); }, []);
  const toggleNotifs = () => { const next = !notifOpen; setNotifOpen(next); if (next) loadNotifs(); };
  const clickNotif = async (n) => {
    if (!n.read) { try { await api.markNotificationRead(n.id); } catch {} }
    setNotifOpen(false);
    if (n.projectId) navigate(`/app/${n.projectId}/dashboard`); else loadNotifs();
  };
  const markAllRead = async () => { try { await api.markAllNotificationsRead(); } catch {} loadNotifs(); };

  // Global search
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    const id = setTimeout(() => api.search(q).then(setResults).catch(() => {}), 200);
    return () => clearTimeout(id);
  }, [q]);
  const goSearch = (path) => { setQ(""); setResults(null); navigate(path); };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const go = (pageId) => { navigate(`/app/${projectId}/${pageId}`); setSidebarOpen(false); };
  const PageComp = PAGES[page] || DashboardPage;

  const initials = (name) => name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "CU";

  return (
    <div style={{ fontFamily: SANS, background: T.mist, minHeight: "100vh", color: T.ink, display: "flex", fontSize: 14 }}>
      {sidebarOpen && <div className="rc-overlay" onClick={() => setSidebarOpen(false)} />}
      {/* Sidebar */}
      <div className={`rc-sidebar${sidebarOpen ? " rc-open" : ""}`} style={{ width: 238, flexShrink: 0, background: T.panel, borderRight: `1.5px solid ${T.edge}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "18px 18px 16px", display: "flex", alignItems: "center", gap: 11, borderBottom: `1.5px solid ${T.edge}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 5, background: T.accent, border: `1.5px solid ${T.edge}`, boxShadow: SH.sm, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 11, height: 11, background: "#fff", transform: "rotate(45deg)" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>Recon Core</div>
            <div style={{ fontSize: 9, color: T.faint, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>Customer Portal</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          {NAV.map((n) => {
            const IconComp = n.icon;
            const active = page === n.id;
            return (
              <div key={n.id} onClick={() => go(n.id)} className="rc-nav" style={{
                display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 5,
                cursor: "pointer", marginBottom: 5,
                background: active ? T.accentSoft : "transparent",
                border: active ? `1.5px solid ${T.edge}` : "2px solid transparent",
                boxShadow: active ? SH.sm : "none",
                color: active ? T.ink : T.graphite, fontWeight: active ? 800 : 600, fontSize: 13,
              }}>
                <IconComp size={17} strokeWidth={2.3} color={active ? T.accentDeep : T.faint} />
                {n.label}
              </div>
            );
          })}
        </div>
        <div style={{ padding: 12, borderTop: `1.5px solid ${T.edge}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 5, background: T.accentSoft, border: `1.5px solid ${T.edge}`, color: T.accentDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
            {initials(user && user.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user ? user.name : "Customer"}</div>
            <div style={{ fontSize: 10.5, color: T.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user ? user.role : ""}</div>
          </div>
          <div title="Sign out" onClick={() => { logout(); navigate("/login"); }} className="rc-btn rc-btn-ghost"
            style={{ cursor: "pointer", padding: 7, borderRadius: 5, color: T.ink, display: "flex" }}>
            <LogOut size={16} />
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rc-header" style={{
          height: 62, borderBottom: `1.5px solid ${T.edge}`, background: T.panel, display: "flex",
          alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div className="rc-hamburger rc-btn rc-btn-ghost" onClick={() => setSidebarOpen(true)} style={{ cursor: "pointer", padding: 6, borderRadius: 5, color: T.ink, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Menu size={20} />
          </div>
          <div style={{ position: "relative", minWidth: 0 }}>
            <div onClick={() => setSwitcherOpen((o) => !o)} className="rc-btn rc-btn-secondary" style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 12px",
              border: BORDER, borderRadius: 5, background: T.panel, minWidth: 0,
            }}>
              <Building2 size={14} color={T.accentDeep} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "42vw" }}>{proj ? proj.name : "…"}</span>
              <span style={{ fontSize: 11, color: T.faint, fontFamily: MONO, flexShrink: 0 }}>{proj ? proj.code : ""}</span>
              <ChevronDown size={13} color={T.ink} style={{ flexShrink: 0 }} />
            </div>
            {switcherOpen && (
              <>
                <div onClick={() => setSwitcherOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", border: BORDER, borderRadius: 5, boxShadow: SH.md, width: 288, zIndex: 60, overflow: "hidden" }}>
                  {summaries.map((p) => (
                    <div key={p.id} onClick={() => { setSwitcherOpen(false); navigate(`/app/${p.id}/dashboard`); }} className="rc-row" style={{
                      padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderBottom: `1px solid ${T.line}`, background: p.id === projectId ? T.accentSoft : "transparent",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 10.5, color: T.faint, fontFamily: MONO }}>{p.code}</div>
                      </div>
                      <Pill status={p.status} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Global search */}
            <div style={{ position: "relative" }}>
              <div className="rc-search rc-topsearch" style={{ display: "flex", alignItems: "center", gap: 7, background: T.panel, border: BORDER, borderRadius: 5, padding: "7px 11px" }}>
                <Search size={14} color={T.ink} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, docs, parts…" style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, width: "100%", fontWeight: 500 }} />
              </div>
              {results && (results.projects.length + results.documents.length + results.bom.length > 0) && (
                <>
                  <div onClick={() => { setQ(""); setResults(null); }} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, width: 324, background: "#fff", border: BORDER, borderRadius: 5, boxShadow: SH.md, zIndex: 60, overflow: "hidden", maxHeight: 420, overflowY: "auto" }}>
                    {results.projects.length > 0 && <SearchGroup label="Projects" items={results.projects} render={(p) => (
                      <SearchRow key={p.id} onClick={() => goSearch(`/app/${p.id}/dashboard`)} icon={<ProjIcon size={14} color={T.accentDeep} />} title={p.name} sub={p.code} />
                    )} />}
                    {results.documents.length > 0 && <SearchGroup label="Documents" items={results.documents} render={(d, i) => (
                      <SearchRow key={i} onClick={() => goSearch(`/app/${d.projectId || projectId}/documents`)} icon={<Files size={14} color={catStyle("Compliance").fg} />} title={d.name} sub={`${d.type} · ${d.project}`} />
                    )} />}
                    {results.bom.length > 0 && <SearchGroup label="BOM parts" items={results.bom} render={(b, i) => (
                      <SearchRow key={i} onClick={() => goSearch(`/app/${b.projectId}/technical`)} icon={<FileText size={14} color={catStyle("Technical").fg} />} title={b.part} sub={`${b.id} · ${b.desc}`} />
                    )} />}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <div onClick={toggleNotifs} className="rc-btn rc-btn-ghost" style={{ position: "relative", cursor: "pointer", padding: 6, borderRadius: 5, display: "flex" }}>
                <Bell size={18} color={T.ink} />
                {unread > 0 && <div style={{ position: "absolute", top: -2, right: -2, minWidth: 16, height: 16, padding: "0 3px", borderRadius: 5, background: T.rose, color: "#fff", fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${T.edge}` }}>{unread}</div>}
              </div>
              {notifOpen && (
                <>
                  <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 344, background: "#fff", border: BORDER, borderRadius: 5, boxShadow: SH.md, zIndex: 60, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: `1.5px solid ${T.edge}` }}>
                      <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 }}>Notifications</span>
                      {unread > 0 && <span onClick={markAllRead} className="rc-link" style={{ fontSize: 11.5, color: T.accentDeep, cursor: "pointer", fontWeight: 800 }}>Mark all read</span>}
                    </div>
                    <div style={{ maxHeight: 380, overflowY: "auto" }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding: "26px 14px", textAlign: "center", color: T.faint, fontSize: 12.5, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontWeight: 600 }}>
                          <CheckCircle2 size={20} color={T.green} /> You're all caught up.
                        </div>
                      ) : notifs.map((n) => {
                        const c = catStyle(n.cat);
                        return (
                          <div key={n.id} onClick={() => clickNotif(n)} className="rc-row" style={{ display: "flex", gap: 10, padding: "11px 14px", cursor: "pointer", borderBottom: `1px solid ${T.line}`, background: n.read ? "transparent" : T.accentSoft }}>
                            <span style={{ width: 9, height: 9, background: c.fg, border: `1.5px solid ${T.edge}`, marginTop: 4, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: n.read ? 700 : 800 }}>{n.title}</div>
                              <div style={{ fontSize: 11.5, color: T.graphite, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                              <div style={{ fontSize: 10.5, color: T.faint, marginTop: 3, fontFamily: MONO }}>{n.time}</div>
                            </div>
                            {!n.read && <span style={{ width: 7, height: 7, borderRadius: 5, background: T.rose, marginTop: 5, flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div onClick={() => go("settings")} title="Account settings" style={{ cursor: "pointer", width: 34, height: 34, borderRadius: 5, background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, border: `1.5px solid ${T.edge}`, boxShadow: SH.sm }}>
              {initials(user && user.name)}
            </div>
          </div>
        </div>

        <div className="rc-content" style={{ padding: "26px 32px 60px", maxWidth: 1280 }}>
          {loadErr ? (
            <div style={{ color: T.amber, fontSize: 14 }}>Could not load project: {loadErr}</div>
          ) : !proj ? (
            <Spinner label="Loading project…" />
          ) : (
            <PageComp proj={proj} notify={notify} go={go} allProjects={summaries} reload={loadProject} user={user} />
          )}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/app" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<RequireAuth><FirstProjectRedirect /></RequireAuth>} />
      <Route path="/app/:projectId" element={<RequireAuth><Navigate to="dashboard" replace /></RequireAuth>} />
      <Route path="/app/:projectId/:page" element={<RequireAuth><AppShell /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
