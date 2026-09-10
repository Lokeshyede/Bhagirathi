import React from "react";
import { Users, AlertTriangle, RefreshCw, Lock, Copy, Fingerprint, MessageSquare } from "lucide-react";
import { useSuspiciousUsers } from "../hooks/useSecurityHooks";

export const SuspiciousUsersPage: React.FC = () => {
  const { data, isLoading, refetch, isFetching } = useSuspiciousUsers({ minRiskScore: 10 });

  const users = data?.items ?? [];

  function getRiskColor(score: number) {
    if (score >= 80) return "text-red-400";
    if (score >= 50) return "text-orange-400";
    if (score >= 25) return "text-amber-400";
    return "text-emerald-400";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/5 px-4 sm:px-6 py-4 sm:py-5 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-base font-bold">Suspicious Users</h1>
              <p className="text-xs text-slate-400">{data?.total ?? 0} tenants with elevated risk</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !users.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Users className="h-12 w-12 opacity-20" />
            <p className="text-sm">No suspicious users detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div
                key={user.tenant_id}
                className="rounded-2xl border border-white/8 bg-slate-900/60 p-5 hover:border-white/15 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{user.tenant_name}</p>
                    {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getRiskColor(user.risk_score)}`}>
                      {user.risk_score}
                    </p>
                    <p className="text-[10px] text-slate-500">risk score</p>
                  </div>
                </div>

                {/* Risk signals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { icon: AlertTriangle, label: "Rejected", value: user.rejected_payments, color: "text-red-400" },
                    { icon: Copy, label: "Duplicate UTR", value: user.duplicate_utr_events, color: "text-orange-400" },
                    { icon: Fingerprint, label: "Screenshot Reuse", value: user.screenshot_reuse_events, color: "text-orange-400" },
                    { icon: MessageSquare, label: "Clarifications", value: user.clarification_requests, color: "text-amber-400" },
                    { icon: Lock, label: "Active Holds", value: user.active_security_holds, color: "text-violet-400" },
                    { icon: Lock, label: "Holds Applied", value: user.security_holds_applied, color: "text-slate-400" },
                  ].map((sig) => (
                    <div key={sig.label} className="flex items-center gap-2 text-xs">
                      <sig.icon className={`h-3.5 w-3.5 shrink-0 ${sig.color}`} />
                      <span className="text-slate-400 truncate">{sig.label}</span>
                      <span className={`ml-auto font-semibold ${sig.value > 0 ? sig.color : "text-slate-600"}`}>
                        {sig.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspiciousUsersPage;
