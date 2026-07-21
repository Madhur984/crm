import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import { api } from "./api.js";
import { T, MONO, SANS, R } from "./theme.js";
import { Toast, Spinner } from "./components/ui.jsx";
import { Pill } from "./components/ui.jsx";
import {
  LayoutDashboard, FolderKanban, FileText, Radar, ShieldCheck, Receipt, Truck,
  Files, MessageSquare, LifeBuoy, Search, Bell, ChevronDown, Building2, LogOut,
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
};

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

  const go = (pageId) => navigate(`/app/${projectId}/${pageId}`);
  const PageComp = PAGES[page] || DashboardPage;

  const initials = (name) => name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "CU";

  return (
    <div style={{ fontFamily: SANS, background: T.mist, minHeight: "100vh", color: T.ink, display: "flex", fontSize: 14 }}>
      {/* Sidebar */}
      <div style={{ width: 232, flexShrink: 0, background: T.panel, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "20px 18px 16px", display: "flex", alignItems: "center", gap: 9, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 10, height: 10, background: T.accentBright, transform: "rotate(45deg)", borderRadius: 2 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.2 }}>Recon Core</div>
            <div style={{ fontSize: 9.5, color: T.faint, letterSpacing: 0.4, textTransform: "uppercase" }}>Customer Portal</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map((n) => {
            const IconComp = n.icon;
            const active = page === n.id;
            return (
              <div key={n.id} onClick={() => go(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: R.btn,
                cursor: "pointer", marginBottom: 2, background: active ? T.accentSoft : "transparent",
                color: active ? T.accent : T.graphite, fontWeight: active ? 700 : 500, fontSize: 13,
              }}>
                <IconComp size={16} strokeWidth={2.1} />
                {n.label}
              </div>
            );
          })}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: T.faint }}>Signed in as</div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{user ? user.name : "Customer"}</div>
          </div>
          <div title="Sign out" onClick={() => { logout(); navigate("/login"); }}
            style={{ cursor: "pointer", padding: 6, borderRadius: 6, color: T.faint }}>
            <LogOut size={16} />
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          height: 58, borderBottom: `1px solid ${T.line}`, background: T.panel, display: "flex",
          alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ position: "relative" }}>
            <div onClick={() => setSwitcherOpen((o) => !o)} style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 12px",
              border: `1px solid ${T.line}`, borderRadius: 8, background: T.mist,
            }}>
              <Building2 size={14} color={T.graphite} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>{proj ? proj.name : "…"}</span>
              <span style={{ fontSize: 11, color: T.faint, fontFamily: MONO }}>{proj ? proj.code : ""}</span>
              <ChevronDown size={13} color={T.faint} />
            </div>
            {switcherOpen && (
              <div style={{ position: "absolute", top: "115%", left: 0, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, boxShadow: "0 12px 28px rgba(0,0,0,.12)", width: 260, zIndex: 60 }}>
                {summaries.map((p) => (
                  <div key={p.id} onClick={() => { setSwitcherOpen(false); navigate(`/app/${p.id}/dashboard`); }} style={{
                    padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: p.id === projectId ? T.mist : "transparent",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 10.5, color: T.faint, fontFamily: MONO }}>{p.code}</div>
                    </div>
                    <Pill status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.mist, border: `1px solid ${T.line}`, borderRadius: 7, padding: "6px 11px", width: 220 }}>
              <Search size={13} color={T.faint} />
              <input placeholder="Search this portal..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, width: "100%" }} />
            </div>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => notify("3 unread notifications")}>
              <Bell size={17} color={T.graphite} />
              <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: T.amber, border: "1.5px solid #fff" }} />
            </div>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {initials(user && user.name)}
            </div>
          </div>
        </div>

        <div style={{ padding: "26px 32px 60px", maxWidth: 1280 }}>
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
