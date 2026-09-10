export const radius = {
  button: "12px",  // 12px
  input: "14px",   // 14px
  card: "18px",    // 18px
  dialog: "24px",  // 24px
  badge: "999px",  // 999px (full pill style)
} as const;

export const radiusClass = {
  button: "rounded-button", // mapped in tailwind to 12px
  input: "rounded-input",   // mapped in tailwind to 14px
  card: "rounded-card",     // mapped in tailwind to 18px
  dialog: "rounded-dialog", // mapped in tailwind to 24px
  badge: "rounded-badge",   // mapped in tailwind to 999px
} as const;

export type RadiusType = typeof radius;
export default radius;
