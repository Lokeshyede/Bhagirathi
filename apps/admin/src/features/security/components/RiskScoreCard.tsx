import React from "react";
import { LucideIcon } from "lucide-react";

interface RiskScoreCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "low" | "medium" | "high" | "critical" | "info" | "hold";
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  onClick?: () => void;
}

const variantConfig = {
  default:  { card: "bg-white/5 border-white/10",                icon: "bg-slate-500/20 text-slate-300",    value: "text-white" },
  low:      { card: "bg-emerald-500/5 border-emerald-500/20",    icon: "bg-emerald-500/20 text-emerald-400", value: "text-emerald-400" },
  medium:   { card: "bg-amber-500/5 border-amber-500/20",        icon: "bg-amber-500/20 text-amber-400",     value: "text-amber-400" },
  high:     { card: "bg-orange-500/8 border-orange-500/25",      icon: "bg-orange-500/20 text-orange-400",   value: "text-orange-400" },
  critical: { card: "bg-red-500/10 border-red-500/30",           icon: "bg-red-500/20 text-red-400",         value: "text-red-400" },
  info:     { card: "bg-blue-500/8 border-blue-500/20",          icon: "bg-blue-500/20 text-blue-400",       value: "text-blue-400" },
  hold:     { card: "bg-violet-500/10 border-violet-500/30",     icon: "bg-violet-500/20 text-violet-400",   value: "text-violet-400" },
};

const trendIcons = { up: "↑", down: "↓", stable: "→" };
const trendColors = { up: "text-red-400", down: "text-emerald-400", stable: "text-slate-400" };

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
  trend,
  onClick,
}) => {
  const cfg = variantConfig[variant];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border p-5 flex items-center gap-4 transition-all duration-200
        ${cfg.card}
        ${onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20" : ""}
      `}
    >
      {/* Icon */}
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.icon}`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium truncate">{title}</p>
        <p className={`text-3xl font-bold mt-0.5 ${cfg.value}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <span className={`text-sm font-bold ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </span>
      )}
    </div>
  );
};
