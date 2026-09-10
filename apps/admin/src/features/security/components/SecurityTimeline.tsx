import React from "react";
import { SecurityEvent } from "../hooks/useSecurityHooks";
import {
  AlertTriangle, Lock, Unlock, Shield, ShieldAlert, ShieldCheck,
  Activity, Zap, UserX, RefreshCw
} from "lucide-react";

interface SecurityTimelineProps {
  events: SecurityEvent[];
  loading?: boolean;
}

const eventConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
}> = {
  DUPLICATE_UTR:           { icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/20",     label: "Duplicate UTR Detected" },
  SCREENSHOT_REUSE:        { icon: AlertTriangle, color: "text-orange-400",  bg: "bg-orange-500/20",  label: "Screenshot Reuse Alert" },
  RISK_CALCULATED:         { icon: Activity,      color: "text-blue-400",    bg: "bg-blue-500/20",    label: "Risk Score Calculated" },
  SECURITY_HOLD_APPLIED:   { icon: Lock,          color: "text-red-400",     bg: "bg-red-500/20",     label: "Security Hold Applied" },
  SECURITY_HOLD_RELEASED:  { icon: Unlock,        color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Security Hold Released" },
  MANUAL_OVERRIDE:         { icon: ShieldCheck,   color: "text-violet-400",  bg: "bg-violet-500/20",  label: "Manual Override" },
  FRAUD_DETECTED:          { icon: ShieldAlert,   color: "text-red-400",     bg: "bg-red-500/20",     label: "Fraud Detected" },
  RULE_TRIGGERED:          { icon: Zap,           color: "text-amber-400",   bg: "bg-amber-500/20",   label: "Rule Triggered" },
  ACCOUNT_LOCK:            { icon: UserX,         color: "text-red-400",     bg: "bg-red-500/20",     label: "Account Locked" },
  RATE_LIMIT_HIT:          { icon: Shield,        color: "text-orange-400",  bg: "bg-orange-500/20",  label: "Rate Limit Hit" },
};

function formatTime(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export const SecurityTimeline: React.FC<SecurityTimelineProps> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-white/5 shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 w-32 bg-white/5 rounded" />
              <div className="h-2.5 w-48 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
        <Activity className="h-8 w-8 opacity-30" />
        <p className="text-sm">No security events</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-white/5" />

      <div className="space-y-1">
        {events.map((event) => {
          const cfg = eventConfig[event.event_type] ?? {
            icon: RefreshCw,
            color: "text-slate-400",
            bg: "bg-slate-500/20",
            label: event.event_type,
          };
          const Icon = cfg.icon;

          return (
            <div key={event.id} className="relative flex gap-3 py-2.5 px-1">
              {/* Icon node */}
              <div className={`relative z-10 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">{formatTime(event.created_at)}</p>
                    <p className="text-[10px] text-slate-600">{formatDate(event.created_at)}</p>
                  </div>
                </div>
                {event.description && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {event.description}
                  </p>
                )}
                {event.risk_level && (
                  <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400">
                    {event.risk_level} Risk
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
