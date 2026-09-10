import React from "react";
import { Brain, CheckCircle2, AlertTriangle, XCircle, Copy, ShieldAlert } from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";

interface AISummaryPanelProps {
  confidence_score: number;
  confidence_label: string;
  recommendation: string;
  ai_summary: string;
  matched_rules: string[];
  failed_rules: string[];
  partial_rules: string[];
}

const RECOMMENDATION_CONFIG: Record<
  string,
  { icon: React.ReactNode; classes: string; badge: string }
> = {
  "Ready to Verify": {
    icon: <CheckCircle2 className="h-4 w-4" />,
    classes:
      "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    badge: "bg-green-500",
  },
  "Needs Review": {
    icon: <AlertTriangle className="h-4 w-4" />,
    classes:
      "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    badge: "bg-amber-500",
  },
  "Manual Verification Required": {
    icon: <XCircle className="h-4 w-4" />,
    classes:
      "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    badge: "bg-red-500",
  },
  Duplicate: {
    icon: <Copy className="h-4 w-4" />,
    classes:
      "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    badge: "bg-orange-500",
  },
  "Possible Fraud": {
    icon: <ShieldAlert className="h-4 w-4" />,
    classes:
      "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800",
    badge: "bg-red-600",
  },
};

export const AISummaryPanel: React.FC<AISummaryPanelProps> = ({
  confidence_score,
  confidence_label,
  recommendation,
  ai_summary,
  matched_rules,
  failed_rules,
  partial_rules,
}) => {
  const recCfg =
    RECOMMENDATION_CONFIG[recommendation] ??
    RECOMMENDATION_CONFIG["Manual Verification Required"];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-violet-50/60 to-indigo-50/60 dark:from-violet-950/20 dark:to-indigo-950/20">
        <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">AI Decision Summary</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Explainable AI · Rule-based Scoring</p>
        </div>
      </div>

      <div className="p-5">
        {/* Confidence + Recommendation row */}
        <div className="flex flex-wrap items-start gap-6 mb-5">
          <ConfidenceMeter
            score={confidence_score}
            label={confidence_label}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-medium">
              AI Recommendation
            </p>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${recCfg.classes}`}
            >
              {recCfg.icon}
              {recommendation}
            </span>

            {/* Rule counts */}
            <div className="flex flex-wrap gap-3 mt-3">
              {matched_rules.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{matched_rules.length} matched</span>
                </div>
              )}
              {partial_rules.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{partial_rules.length} partial</span>
                </div>
              )}
              {failed_rules.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>{failed_rules.length} failed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary text */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 px-4 py-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ai_summary}</p>
        </div>

        {/* Matched / Failed rule pills */}
        {(matched_rules.length > 0 || failed_rules.length > 0) && (
          <div className="mt-4 space-y-2">
            {matched_rules.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {matched_rules.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs border border-green-200 dark:border-green-900"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {r}
                  </span>
                ))}
              </div>
            )}
            {failed_rules.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {failed_rules.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs border border-red-200 dark:border-red-900"
                  >
                    <XCircle className="h-3 w-3" />
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
