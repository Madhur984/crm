/* Design tokens — Emerald core, sharpened for a simple, professional look. */
export const T = {
  ink: "#12151A", graphite: "#5B6470", faint: "#8A93A0",
  mist: "#F3F4F6", panel: "#FFFFFF", line: "#E3E6EA",

  // Brand accent (emerald). `blue`/`blueSoft` kept as aliases so existing
  // references pick up the accent automatically.
  accent: "#16A34A", accentSoft: "#E7F6EC", accentDeep: "#15803D", accentBright: "#34D399",
  blue: "#16A34A", blueSoft: "#E7F6EC",

  // Status semantics — kept distinct so "in progress" never reads as "done".
  green: "#16A34A", greenSoft: "#E7F6EC",   // completed / positive
  info: "#2563EB", infoSoft: "#E8EFFD",     // in progress / active
  amber: "#AD6F0C", amberSoft: "#FBF1DF",   // attention
  grey: "#6B7280", greySoft: "#F1F2F4",     // pending / neutral
};

export const MONO = "ui-monospace, SFMono-Regular, 'Roboto Mono', Menlo, Consolas, monospace";
export const SANS = "'Segoe UI', ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif";

export const STAGES = [
  "Requirements", "Engineering Review", "Recon Atlas", "Compliance",
  "Commercial", "Manufacturing", "Logistics", "Customs", "Delivery",
];

/* Corner radii — tightened for a sharper, more enterprise feel. */
export const R = { card: 8, btn: 6, pill: 4, input: 6 };
