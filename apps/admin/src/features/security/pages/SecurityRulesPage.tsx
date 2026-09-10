import React, { useState } from "react";
import { Settings, RefreshCw, CheckCircle2, XCircle, Save } from "lucide-react";
import { useSecurityRules, useUpdateSecurityRule } from "../hooks/useSecurityHooks";
import type { SecurityRule } from "../hooks/useSecurityHooks";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/20",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

interface EditingState {
  threshold_value?: number | null;
  severity?: string;
}

export const SecurityRulesPage: React.FC = () => {
  const { data: rules, isLoading, refetch } = useSecurityRules();
  const updateRule = useUpdateSecurityRule();
  const [editing, setEditing] = useState<Record<string, EditingState>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const handleToggle = (rule: SecurityRule) => {
    updateRule.mutate({ ruleKey: rule.rule_key, payload: { is_enabled: !rule.is_enabled } });
  };

  const handleSave = (rule: SecurityRule) => {
    const changes = editing[rule.rule_key];
    if (!changes) return;
    updateRule.mutate(
      { ruleKey: rule.rule_key, payload: changes },
      {
        onSuccess: () => {
          setEditing((prev) => { const n = { ...prev }; delete n[rule.rule_key]; return n; });
          setSaved(rule.rule_key);
          setTimeout(() => setSaved(null), 2000);
          refetch();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 sm:px-6 py-4 sm:py-5 bg-slate-900/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold">Security Rules</h1>
              <p className="text-xs text-slate-400">Configure fraud detection thresholds — changes apply immediately</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-4xl mx-auto w-full space-y-3">
        {/* Policy note */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-400 mb-4">
          <strong>Admin Only:</strong> Changes to security rules take effect on the next payment analysis run. Disabling a rule does not affect existing flags — only new payments will be evaluated without the disabled rule.
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          rules?.map((rule) => {
            const isEdited = !!editing[rule.rule_key];
            const isSaved = saved === rule.rule_key;
            const currentThreshold = editing[rule.rule_key]?.threshold_value ?? rule.threshold_value;
            const currentSeverity = editing[rule.rule_key]?.severity ?? rule.severity;

            return (
              <div
                key={rule.rule_key}
                className={`rounded-2xl border p-5 transition-all duration-200
                  ${rule.is_enabled
                    ? "bg-slate-900/60 border-white/8"
                    : "bg-slate-900/30 border-white/4 opacity-60"
                  }
                  ${isEdited ? "border-blue-500/30 bg-blue-500/5" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(rule)}
                    disabled={updateRule.isPending}
                    className="mt-0.5 shrink-0 cursor-pointer"
                    title={rule.is_enabled ? "Disable rule" : "Enable rule"}
                  >
                    {rule.is_enabled ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-slate-600" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-white">{rule.rule_name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[currentSeverity]}`}>
                        {currentSeverity}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">{rule.rule_key}</span>
                    </div>
                    {rule.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>
                    )}

                    {/* Editable fields */}
                    {rule.threshold_value != null && (
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500">Threshold:</label>
                          <input
                            type="number"
                            value={currentThreshold ?? ""}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [rule.rule_key]: {
                                  ...prev[rule.rule_key],
                                  threshold_value: parseFloat(e.target.value),
                                },
                              }))
                            }
                            className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          />
                          <span className="text-xs text-slate-500">{rule.threshold_unit}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500">Severity:</label>
                          <select
                            value={currentSeverity}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [rule.rule_key]: {
                                  ...prev[rule.rule_key],
                                  severity: e.target.value,
                                },
                              }))
                            }
                            className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                          >
                            {["Low", "Medium", "High", "Critical"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEdited && (
                            <button
                              onClick={() => handleSave(rule)}
                              disabled={updateRule.isPending}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 cursor-pointer transition-colors"
                            >
                              <Save className="h-3 w-3" />
                              {updateRule.isPending ? "Saving..." : "Save"}
                            </button>
                          )}

                          {isSaved && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Saved
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SecurityRulesPage;
