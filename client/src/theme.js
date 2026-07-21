/* ============================================================
   Recon Core — design tokens (Neobrutalist)
   Sharp edges · heavy ink borders · hard offset shadows ·
   flat, punchy color. Category palette stays CVD-safe
   (fg values unchanged — validated via the dataviz validator).
   ============================================================ */

export const T = {
  // Surfaces & neutrals — soft warm canvas so panels sit calmly.
  bg: "#F4F4EF", mist: "#F4F4EF", panel: "#FFFFFF", panelAlt: "#FAFAF6",
  ink: "#111827", graphite: "#3B424E", faint: "#6B7280",
  edge: "#2B3340",                         // softened border (not jet-black)
  line: "#E2E2DA", lineSoft: "#EEEEE7",    // internal dividers only

  // Brand accent (emerald). `blue`/`blueSoft` kept as aliases.
  accent: "#16A34A", accentDeep: "#15803D", accentSoft: "#DCFCE7", accentBright: "#22C55E",
  blue: "#16A34A", blueSoft: "#DCFCE7",

  // Status semantics — reserved, never reused for categories.
  green: "#16A34A", greenSoft: "#DCFCE7",   // done / positive
  info: "#2563EB", infoSoft: "#DBEAFE",     // in progress
  amber: "#B45309", amberSoft: "#FCE9C8",   // attention
  grey: "#6B7280", greySoft: "#ECECE3",     // pending / neutral
  rose: "#E11D48", roseSoft: "#FCE1E7",     // negative / balance
};

/* Category identity palette — CVD-safe fg (unchanged); punchier soft tints. */
export const CAT = {
  Technical:  { fg: "#4F46E5", soft: "#E4E4FD" },
  Compliance: { fg: "#0D9488", soft: "#D2F0EB" },
  Commercial: { fg: "#9333EA", soft: "#EEDCFC" },
  Logistics:  { fg: "#D97706", soft: "#FCE9C8" },
  General:    { fg: "#64748B", soft: "#E3E9F0" },
};
export const catStyle = (c) => CAT[c] || CAT.General;

/* Accent hues for stat / icon blocks (same validated family). */
export const HUE = {
  emerald: { fg: "#16A34A", soft: "#DCFCE7" },
  indigo:  { fg: "#4F46E5", soft: "#E4E4FD" },
  violet:  { fg: "#9333EA", soft: "#EEDCFC" },
  amber:   { fg: "#D97706", soft: "#FCE9C8" },
  teal:    { fg: "#0D9488", soft: "#D2F0EB" },
  rose:    { fg: "#E11D48", soft: "#FCE1E7" },
  cyan:    { fg: "#0891B2", soft: "#D5EEF6" },
};

/* Restrained hard offset shadows — structure without the poster look. */
const E = "#2B3340";
export const SH = {
  sm: `1px 1px 0 ${E}`,
  md: `2px 2px 0 ${E}`,
  lg: `3px 3px 0 ${E}`,
  color: (c) => `2px 2px 0 ${c}`,
};

/* Softly squared — small radius keeps it crisp, not childish. */
export const R = { card: 6, btn: 5, pill: 5, input: 5, tile: 5 };
export const BORDER = `1.5px solid ${E}`;

export const MONO = "ui-monospace, SFMono-Regular, 'Roboto Mono', Menlo, Consolas, monospace";
export const SANS = "'Segoe UI', ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif";

export const STAGES = [
  "Requirements", "Engineering Review", "Recon Atlas", "Compliance",
  "Commercial", "Manufacturing", "Logistics", "Customs", "Delivery",
];
