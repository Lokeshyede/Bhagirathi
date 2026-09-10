import React, { useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { useSecurityEvents } from "../hooks/useSecurityHooks";
import { SecurityTimeline } from "../components/SecurityTimeline";

const EVENT_TYPE_OPTIONS = [
  { label: "All Events", value: "" },
  { label: "Duplicate UTR", value: "DUPLICATE_UTR" },
  { label: "Screenshot Reuse", value: "SCREENSHOT_REUSE" },
  { label: "Risk Calculated", value: "RISK_CALCULATED" },
  { label: "Hold Applied", value: "SECURITY_HOLD_APPLIED" },
  { label: "Hold Released", value: "SECURITY_HOLD_RELEASED" },
  { label: "Manual Override", value: "MANUAL_OVERRIDE" },
  { label: "Fraud Detected", value: "FRAUD_DETECTED" },
  { label: "Rule Triggered", value: "RULE_TRIGGERED" },
  { label: "Rate Limit Hit", value: "RATE_LIMIT_HIT" },
];

const RISK_OPTIONS = [
  { label: "All", value: "" },
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

export const SecurityEventTimelinePage: React.FC = () => {
  const [eventType, setEventType] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [skip, setSkip] = useState(0);
  const LIMIT = 50;

  const { data, isLoading, refetch, isFetching } = useSecurityEvents({
    eventType: eventType || undefined,
    riskLevel: riskLevel || undefined,
    skip,
    limit: LIMIT,
  });

  const events = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 sm:px-6 py-4 sm:py-5 bg-slate-900/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold">Security Event Timeline</h1>
              <p className="text-xs text-slate-400">{total} event{total !== 1 ? "s" : ""} total</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select
              value={eventType}
              onChange={(e) => { setEventType(e.target.value); setSkip(0); }}
              className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {EVENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
              ))}
            </select>

            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setSkip(0); }}
              className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {RISK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
              ))}
            </select>

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

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-4xl mx-auto w-full">
        <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4 sm:p-5">
          <SecurityTimeline events={events} loading={isLoading} />
        </div>

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
              Page {Math.floor(skip / LIMIT) + 1} of {Math.ceil(total / LIMIT)}
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

export default SecurityEventTimelinePage;
