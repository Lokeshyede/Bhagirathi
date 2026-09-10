import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldAlert, Lock, RefreshCw, ChevronRight } from "lucide-react";
import { useHighRiskPayments } from "../hooks/useSecurityHooks";
import { RiskBadge } from "../components/RiskBadge";
import { DuplicateWarningBadge } from "../components/SecurityAlerts";

const RISK_FILTER_OPTIONS = [
  { label: "All High+", value: "High,Critical" },
  { label: "Critical Only", value: "Critical" },
  { label: "High Only", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "All Levels", value: "Low,Medium,High,Critical" },
];

export const HighRiskQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [riskFilter, setRiskFilter] = useState(searchParams.get("levels") ?? "High,Critical");
  const [holdOnly, setHoldOnly] = useState(searchParams.get("hold") === "true");
  const [skip, setSkip] = useState(0);
  const LIMIT = 20;

  const { data, isLoading, refetch, isFetching } = useHighRiskPayments({
    riskLevels: riskFilter,
    securityHoldOnly: holdOnly,
    skip,
    limit: LIMIT,
  });

  const payments = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 sm:px-6 py-4 sm:py-5 bg-slate-900/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">High Risk Queue</h1>
              <p className="text-xs text-slate-400">{total} payment{total !== 1 ? "s" : ""} flagged</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Risk filter */}
            <div className="flex rounded-xl border border-white/10 overflow-x-auto whitespace-nowrap scrollbar-none w-full sm:w-auto">
              {RISK_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setRiskFilter(opt.value); setSkip(0); }}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex-shrink-0
                    ${riskFilter === opt.value
                      ? "bg-red-500/20 text-red-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              {/* Hold toggle */}
              <button
                onClick={() => setHoldOnly(!holdOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer
                  ${holdOnly
                    ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Security Hold Only
              </button>

              {/* Refresh */}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !payments.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <ShieldAlert className="h-12 w-12 opacity-20" />
            <p className="text-sm">No high-risk payments found</p>
            <p className="text-xs">with the current filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.payment_id}
                onClick={() => navigate(`/security/payment/${p.payment_id}`)}
                className={`group rounded-xl border p-4 flex items-center gap-4 cursor-pointer transition-all duration-150 hover:scale-[1.005] hover:shadow-lg hover:shadow-black/20
                  ${p.risk_level === "Critical"
                    ? "bg-red-500/8 border-red-500/20 hover:border-red-500/40"
                    : p.risk_level === "High"
                    ? "bg-orange-500/6 border-orange-500/15 hover:border-orange-500/30"
                    : "bg-white/3 border-white/8 hover:border-white/15"
                  }`}
              >
                {/* Risk badge */}
                <div className="shrink-0">
                  <RiskBadge level={p.risk_level} score={p.risk_score} showScore />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{p.tenant_name}</p>
                    {p.security_hold && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                        <Lock className="h-3 w-3" /> Security Hold
                      </span>
                    )}
                    {(p.is_duplicate || p.is_fraud_flagged) && (
                      <DuplicateWarningBadge
                        type={p.is_duplicate ? "utr" : "screenshot"}
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.payment_reference ?? "No reference"} · ₹{p.amount.toLocaleString("en-IN")} · {p.payment_type ?? "—"}
                  </p>
                  {p.triggered_rules.length > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {p.triggered_rules.map((r) => r.type).join(", ")}
                    </p>
                  )}
                </div>

                {/* Score + date */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-lg font-bold text-white">{p.risk_score ?? "—"}</p>
                  <p className="text-[10px] text-slate-500">/ 100</p>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={skip === 0}
              onClick={() => setSkip(Math.max(0, skip - LIMIT))}
              className="px-4 py-2 rounded-xl text-sm bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-slate-400">
              {Math.floor(skip / LIMIT) + 1} / {Math.ceil(total / LIMIT)}
            </span>
            <button
              disabled={skip + LIMIT >= total}
              onClick={() => setSkip(skip + LIMIT)}
              className="px-4 py-2 rounded-xl text-sm bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HighRiskQueuePage;
