import { T, MONO, SANS, R } from "../theme.js";
import { CheckCircle2 } from "../icons.jsx";

/* ---- status → tone mapping ---- */
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
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px",
      borderRadius: R.pill, background: s.bg, color: s.fg, fontSize: 12, fontWeight: 600,
      letterSpacing: 0.1, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

export function Card({ title, action, children, style }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: R.card, padding: 20, ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          {title && <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.ink, letterSpacing: 0.2, textTransform: "uppercase" }}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Ring({ pct, size = 76, color = T.blue, label }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `conic-gradient(${color} ${pct * 3.6}deg, ${T.mist} 0deg)`,
      }} />
      <div style={{
        position: "absolute", inset: 6, borderRadius: "50%", background: T.panel,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: T.ink }}>{pct}%</span>
        {label && <span style={{ fontSize: 8, color: T.faint, marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", icon: IconComp, style, small, type = "button", disabled }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 7, cursor: disabled ? "default" : "pointer",
    border: "1px solid transparent", borderRadius: R.btn, fontWeight: 600,
    fontSize: small ? 12 : 13, padding: small ? "6px 10px" : "8px 14px",
    fontFamily: SANS, transition: "background .12s, border-color .12s", opacity: disabled ? 0.55 : 1,
  };
  const variants = {
    primary: { background: T.ink, color: "#fff" },
    secondary: { background: T.panel, color: T.ink, borderColor: T.line },
    ghost: { background: "transparent", color: T.graphite },
    subtle: { background: T.mist, color: T.ink },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {IconComp && <IconComp size={small ? 13 : 14} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: T.ink, color: "#fff", padding: "10px 18px", borderRadius: R.btn,
      fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,.25)",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <CheckCircle2 size={15} /> {message}
    </div>
  );
}

/* items: [{ label, date, status, team }] — count derived from items, not a fixed 9 */
export function LifecycleRail({ items, currentIndex, onJump, compact }) {
  const n = items.length;
  const progress = Math.max(0, currentIndex) / Math.max(1, n - 1);
  return (
    <div style={{ position: "relative", padding: compact ? "6px 4px" : "10px 4px 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
        <div style={{ position: "absolute", top: compact ? 7 : 9, left: 0, right: 0, height: 2, background: T.line, zIndex: 0 }} />
        <div style={{
          position: "absolute", top: compact ? 7 : 9, left: 0, height: 2, background: T.blue, zIndex: 0,
          width: `${progress * 100}%`, transition: "width .3s",
        }} />
        {items.map((d, i) => {
          const isCurrent = i === currentIndex;
          const s_ = TONE_STYLE[tone(d.status)];
          return (
            <div key={i} onClick={() => onJump && onJump(i)}
              style={{ flex: 1, position: "relative", zIndex: 1, textAlign: "center", cursor: onJump ? "pointer" : "default" }}>
              <div style={{
                width: compact ? 14 : 18, height: compact ? 14 : 18, margin: "0 auto", borderRadius: 5,
                transform: "rotate(45deg)", background: isCurrent ? T.blue : s_.dot,
                border: `2px solid ${T.panel}`, boxShadow: isCurrent ? `0 0 0 3px ${T.blueSoft}` : "none",
              }} />
              {!compact && (
                <div style={{ marginTop: 10, padding: "0 2px" }}>
                  <div style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? T.ink : T.graphite, lineHeight: 1.25 }}>{d.label}</div>
                  <div style={{ fontSize: 10, color: T.faint, marginTop: 3, fontFamily: MONO }}>{d.date}</div>
                  <div style={{ marginTop: 4 }}><Pill status={d.status} /></div>
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
                textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700,
                color: T.faint, textTransform: "uppercase", letterSpacing: 0.3,
                borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap",
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.line}` }}>
              {columns.map((c) => (
                <td key={c} style={{ padding: "10px 12px", color: T.ink, verticalAlign: "middle" }}>
                  {renderCell ? renderCell(r, c) : r[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ padding: "28px 12px", textAlign: "center", color: T.faint, fontSize: 13 }}>No matching records.</div>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.faint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{eyebrow}</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: -0.3 }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12, color: T.faint }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%", border: `3px solid ${T.line}`, borderTopColor: T.blue,
        animation: "rcspin 0.8s linear infinite",
      }} />
      <style>{`@keyframes rcspin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}
