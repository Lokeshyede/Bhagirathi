export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
  hover: "0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
  dialog: "0 25px 50px -12px rgba(0, 0, 0, 0.12)",
  dropdown: "0 10px 20px -5px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
} as const;

export const shadowClass = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  hover: "shadow-hover",
  dialog: "shadow-dialog",
  dropdown: "shadow-dropdown",
} as const;

export type ShadowsType = typeof shadows;
export default shadows;
