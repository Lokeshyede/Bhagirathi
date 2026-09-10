export const colors = {
  primary: "#DC2626",
  primaryHover: "#B91C1C",
  primaryLight: "#FEE2E2",
  background: "#F5F7FB",
  surface: "#FFFFFF",
  sidebar: "#FCFCFD",
  border: "#E5E7EB",
  divider: "#EEF2F7",
  text: {
    primary: "#111827",
    secondary: "#64748B",
    muted: "#94A3B8",
  },
  success: "#22C55E",
  successLight: "#DCFCE7",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
  reserved: "#8B5CF6",
  maintenance: "#6B7280",
} as const;

export type ColorType = typeof colors;
export default colors;
