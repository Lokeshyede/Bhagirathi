import React from "react";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface RiskBadgeProps {
  level: RiskLevel | string | null | undefined;
  score?: number | null;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

const levelConfig: Record<string, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  Low:      { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400", glow: "" },
  Medium:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-400",   glow: "" },
  High:     { bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/40",  dot: "bg-orange-400",  glow: "shadow-orange-500/20 shadow-sm" },
  Critical: { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/40",     dot: "bg-red-500",     glow: "shadow-red-500/30 shadow-md animate-pulse" },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = "md",
  showScore = false,
}) => {
  const normalized = level ?? "Low";
  const cfg = levelConfig[normalized] ?? levelConfig.Low;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide
        ${cfg.bg} ${cfg.text} ${cfg.border} ${cfg.glow} ${sizeConfig[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {normalized}
      {showScore && score != null && (
        <span className="opacity-70">· {score}/100</span>
      )}
    </span>
  );
};
