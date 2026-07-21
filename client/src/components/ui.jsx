import { T, MONO, SANS, R, SH, BORDER, catStyle, HUE } from "../theme.js";
import { CheckCircle2, X } from "../icons.jsx";

export const inputStyle = { width: "100%", padding: "9px 11px", border: BORDER, borderRadius: 5, fontSize: 13, outline: "none", fontFamily: SANS, background: "#fff", fontWeight: 500 };

export function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 13 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: T.ink, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      <div style={{ marginTop: 5 }}>{children}</div>
    </label>
  );
}

export function Modal({ title, subtitle, onClose, children, width = 460 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", border: BORDER, borderRadius: 8, padding: 22, width, maxWidth: "100%", boxShadow: SH.lg, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: -0.2 }}>{title}</h3>
            {subtitle && <div style={{ fontSize: 12.5, color: T.faint, marginTop: 3, fontWeight: 600 }}>{subtitle}</div>}
          </div>
          <span onClick={onClose} className="rc-btn rc-btn-ghost" style={{ cursor: "pointer", padding: 5, borderRadius: 5, display: "flex", color: T.ink }}><X size={18} /></span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---- status → tone mapping (reserved status colors) ---- */
export function tone(status) {
  const good = ["Completed", "Validated", "Confirmed", "Verified", "Paid", "On Track", "Resolved", "Acknowledged", "Signed", "Current", "Bound", "Accepted", "Finalized"];
  const active = ["In Progress", "Monitoring", "Monitored", "Answered", "Issued", "Invoiced"];
  const attention = ["Needs Attention", "Under Review", "Clarification Needed", "Overdue", "Elevated", "Open"];
  if (good.includes(status)) return "good";
  if (active.includes(status)) return "active";
  if (attention.includes(status)) return "attention";
  return "pending";
}

export const TONE_STYLE = {
  good: { bg: T.greenSoft, fg: T.green, dot: T.green },
  active: { bg: T.infoSoft, fg: T.info, dot: T.info },
  attention: { bg: T.amberSoft, fg: T.amber, dot: T.amber },
  pending: { bg: T.greySoft, fg: T.grey, dot: T.faint },
};

export function Pill({ status }) {
  const s = TONE_STYLE[tone(status)];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 5,
      background: s.bg, color: s.fg, fontSize: 11, fontWeight: 700, letterSpacing: 0.2, textTransform: "uppercase",
      whiteSpace: "nowrap", border: `1px solid ${s.fg}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 2, background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

/* Category chip — colored identity, always with its text label (secondary encoding). */
export function CatChip({ cat, subtle }) {
  const c = catStyle(cat);
  if (subtle) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: c.fg }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: c.fg }} />{cat}
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 5,
      background: c.soft, color: c.fg, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase",
      border: `1px solid ${c.fg}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 2, background: c.fg }} />{cat}
    </span>
  );
}

export function Card({ title, action, children, style, hover }) {
  return (
    <div className={`rc-card${hover ? " rc-card-hover" : ""}`} style={{
      background: T.panel, border: BORDER, borderRadius: 5,
      padding: 20, boxShadow: SH.sm, ...style,
    }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
          {title && <h3 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: T.ink, letterSpacing: 0.6, textTransform: "uppercase" }}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* Colored KPI tile — solid color icon block + value + label. */
export function StatTile({ icon: IconComp, hue = "emerald", label, value, sub, valueMono = true, accentValue }) {
  const h = HUE[hue] || HUE.emerald;
  return (
    <div className="rc-card rc-card-hover" style={{
      background: T.panel, border: BORDER, borderRadius: 5, padding: 16, boxShadow: SH.sm,
      display: "flex", flexDirection: "column", gap: 10, minHeight: 104,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.ink, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
        {IconComp && (
          <div style={{ width: 32, height: 32, borderRadius: 5, background: h.fg, border: `1.5px solid ${T.edge}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconComp size={16} color="#fff" strokeWidth={2.3} />
          </div>
        )}
      </div>
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontFamily: valueMono ? MONO : SANS, fontSize: 23, fontWeight: 800, color: accentValue ? h.fg : T.ink, lineHeight: 1.1, letterSpacing: -0.3 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: T.faint, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function Ring({ pct, size = 76, color = T.accent, label, track = T.lineSoft }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, border: `2px solid ${T.edge}`, borderRadius: "50%" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: `conic-gradient(${color} ${pct * 3.6}deg, ${track} 0deg)` }} />
      <div style={{
        position: "absolute", inset: 6, borderRadius: "50%", background: T.panel, border: `1.5px solid ${T.edge}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: MONO, fontSize: size > 80 ? 20 : 16, fontWeight: 800, color: T.ink }}>{pct}%</span>
        {label && <span style={{ fontSize: 8, color: T.faint, marginTop: 1, letterSpacing: 0.5, fontWeight: 700 }}>{label}</span>}
      </div>
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", icon: IconComp, style, small, type = "button", disabled }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    cursor: disabled ? "default" : "pointer", border: BORDER, borderRadius: 5,
    fontWeight: 700, fontSize: small ? 12 : 13, padding: small ? "6px 11px" : "9px 15px",
    fontFamily: SANS, opacity: disabled ? 0.45 : 1, letterSpacing: 0.2,
  };
  const variants = {
    primary: { background: T.accentDeep, color: "#fff" },
    secondary: { background: T.panel, color: T.ink },
    ghost: { background: "transparent", color: T.graphite, border: "2px solid transparent" },
    subtle: { background: T.accentSoft, color: T.accentDeep },
    dark: { background: T.ink, color: "#fff" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`rc-btn rc-btn-${variant}`} style={{ ...base, ...variants[variant], ...style }}>
      {IconComp && <IconComp size={small ? 13 : 15} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: T.ink, color: "#fff", padding: "11px 18px", borderRadius: 5,
      fontSize: 13, fontWeight: 700, zIndex: 200, boxShadow: SH.sm, border: `2px solid ${T.edge}`,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <CheckCircle2 size={15} color={T.accentBright} /> {message}
    </div>
  );
}

/* items: [{ label, date, status, team }] */
export function LifecycleRail({ items, currentIndex, onJump, compact }) {
  const n = items.length;
  const progress = Math.max(0, currentIndex) / Math.max(1, n - 1);
  return (
    <div style={{ position: "relative", padding: compact ? "6px 4px" : "10px 4px 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
        <div style={{ position: "absolute", top: compact ? 8 : 10, left: 0, right: 0, height: 4, background: T.lineSoft, border: `1px solid ${T.edge}`, zIndex: 0 }} />
        <div style={{
          position: "absolute", top: compact ? 8 : 10, left: 0, height: 4, border: `1px solid ${T.edge}`,
          background: T.accent, zIndex: 0, width: `${progress * 100}%`, transition: "width .4s ease",
        }} />
        {items.map((d, i) => {
          const isCurrent = i === currentIndex;
          const s_ = TONE_STYLE[tone(d.status)];
          return (
            <div key={i} onClick={() => onJump && onJump(i)}
              style={{ flex: 1, position: "relative", zIndex: 1, textAlign: "center", cursor: onJump ? "pointer" : "default" }}>
              <div style={{
                width: compact ? 15 : 18, height: compact ? 15 : 18, margin: "0 auto", borderRadius: 5,
                transform: "rotate(45deg)", background: isCurrent ? T.accent : s_.dot,
                border: `1.5px solid ${T.edge}`, boxShadow: isCurrent ? SH.sm : "none",
              }} />
              {!compact && (
                <div style={{ marginTop: 12, padding: "0 2px" }}>
                  <div style={{ fontSize: 11, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? T.ink : T.graphite, lineHeight: 1.25 }}>{d.label}</div>
                  <div style={{ fontSize: 10, color: T.faint, marginTop: 3, fontFamily: MONO }}>{d.date}</div>
                  <div style={{ marginTop: 5 }}><Pill status={d.status} /></div>
                  {d.team && <div style={{ fontSize: 9.5, color: T.faint, marginTop: 4 }}>{d.team}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Table({ columns, rows, renderCell }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={{
                textAlign: "left", padding: "9px 12px", fontSize: 11, fontWeight: 800,
                color: T.graphite, textTransform: "uppercase", letterSpacing: 0.5,
                borderBottom: `1.5px solid ${T.edge}`, whiteSpace: "nowrap", background: T.panelAlt,
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="rc-row" style={{ borderBottom: `1px solid ${T.line}` }}>
              {columns.map((c) => (
                <td key={c} style={{ padding: "11px 12px", color: T.ink, verticalAlign: "middle", fontWeight: 500 }}>
                  {renderCell ? renderCell(r, c) : r[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ padding: "30px 12px", textAlign: "center", color: T.faint, fontSize: 13, fontWeight: 600 }}>No matching records.</div>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
          <span style={{ width: 9, height: 9, background: T.accent, border: `1.5px solid ${T.edge}` }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: T.accentDeep, textTransform: "uppercase", letterSpacing: 0.8 }}>{eyebrow}</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: T.ink, letterSpacing: -0.6 }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12, color: T.faint }}>
      <div style={{ width: 26, height: 26, borderRadius: 5, border: `3px solid ${T.edge}`, borderTopColor: T.accent, animation: "rcspin 0.8s linear infinite" }} />
      <style>{`@keyframes rcspin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  );
}
