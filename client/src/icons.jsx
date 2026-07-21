/* Self-contained lucide-style outline SVG icons — no external deps */
export function Icon({ size = 16, color = "currentColor", strokeWidth = 2, children, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

export const LayoutDashboard = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>;
export const FolderKanban = (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><line x1="9" y1="12" x2="9" y2="17"/><line x1="13" y1="10" x2="13" y2="17"/><line x1="17" y1="13" x2="17" y2="17"/></Icon>;
export const FileText = (p) => <Icon {...p}><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></Icon>;
export const Radar = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="M12 3v0"/></Icon>;
export const ShieldCheck = (p) => <Icon {...p}><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6Z"/><path d="M9 12l2 2 4-4"/></Icon>;
export const Receipt = (p) => <Icon {...p}><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21Z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/></Icon>;
export const Truck = (p) => <Icon {...p}><rect x="1" y="7" width="13" height="10" rx="1"/><path d="M14 10h4l3 3v4h-7Z"/><circle cx="6" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/></Icon>;
export const Files = (p) => <Icon {...p}><path d="M8 3h8l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M4 7v12a2 2 0 0 0 2 2h9"/></Icon>;
export const MessageSquare = (p) => <Icon {...p}><path d="M21 12a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></Icon>;
export const LifeBuoy = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="5.2" y1="5.2" x2="9.2" y2="9.2"/><line x1="14.8" y1="14.8" x2="18.8" y2="18.8"/><line x1="18.8" y1="5.2" x2="14.8" y2="9.2"/><line x1="9.2" y1="14.8" x2="5.2" y2="18.8"/></Icon>;
export const Search = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></Icon>;
export const Bell = (p) => <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"/><path d="M10 19a2 2 0 0 0 4 0"/></Icon>;
export const ChevronDown = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>;
export const ChevronRight = (p) => <Icon {...p}><polyline points="9 6 15 12 9 18"/></Icon>;
export const Download = (p) => <Icon {...p}><path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M4 19h16"/></Icon>;
export const CheckCircle2 = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.3 2.3L16 10"/></Icon>;
export const AlertTriangle = (p) => <Icon {...p}><path d="M12 3.5 21.5 20h-19Z"/><line x1="12" y1="10" x2="12" y2="14.5"/><circle cx="12" cy="17.3" r="0.4" fill={p.color || "currentColor"}/></Icon>;
export const Circle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/></Icon>;
export const X = (p) => <Icon {...p}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></Icon>;
export const Plus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
export const Phone = (p) => <Icon {...p}><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2Z"/></Icon>;
export const Video = (p) => <Icon {...p}><rect x="2" y="6" width="13" height="12" rx="1.5"/><path d="M15 10l6-3v10l-6-3Z"/></Icon>;
export const Send = (p) => <Icon {...p}><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></Icon>;
export const Paperclip = (p) => <Icon {...p}><path d="M21 11.5 12 20.5a4.5 4.5 0 0 1-6.4-6.4l9-9a3 3 0 0 1 4.3 4.2l-8.9 8.9a1.5 1.5 0 0 1-2.1-2.1l8-8"/></Icon>;
export const Building2 = (p) => <Icon {...p}><rect x="4" y="3" width="10" height="18"/><rect x="16" y="9" width="5" height="12"/><line x1="7" y1="7" x2="7" y2="7.1"/><line x1="11" y1="7" x2="11" y2="7.1"/><line x1="7" y1="11" x2="7" y2="11.1"/><line x1="11" y1="11" x2="11" y2="11.1"/><line x1="7" y1="15" x2="7" y2="15.1"/><line x1="11" y1="15" x2="11" y2="15.1"/></Icon>;
export const Calendar = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>;
export const LogOut = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
