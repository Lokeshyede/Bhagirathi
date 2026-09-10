import React from "react";
import { CheckCircle2, XCircle, AlertCircle, MinusCircle, Eye, Copy } from "lucide-react";
import type { RuleBreakdownItem } from "../hooks/useReconciliation";

interface RuleBreakdownTableProps {
  rules: RuleBreakdownItem[];
  totalScore: number;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; classes: string }> = {
  MATCHED: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Matched",
    classes: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
  },
  PARTIAL: {
    icon: <AlertCircle className="h-4 w-4" />,
    label: "Partial Match",
    classes: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  },
  MISSING: {
    icon: <MinusCircle className="h-4 w-4" />,
    label: "Missing",
    classes: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  },
  MISMATCH: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Mismatch",
    classes: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
  },
  OCR_FAILED: {
    icon: <Eye className="h-4 w-4" />,
    label: "OCR Failed",
    classes: "text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900",
  },
  LOW_CONFIDENCE: {
    icon: <AlertCircle className="h-4 w-4" />,
    label: "Low Confidence",
    classes: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
  },
  DUPLICATE: {
    icon: <Copy className="h-4 w-4" />,
    label: "Duplicate",
    classes: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
  },
};

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const color =
    score === maxScore
      ? "bg-green-500"
      : score > 0
      ? "bg-amber-500"
      : "bg-gray-200 dark:bg-gray-700";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
        +{score}/{maxScore}
      </span>
    </div>
  );
}

export const RuleBreakdownTable: React.FC<RuleBreakdownTableProps> = ({
  rules,
  totalScore,
}) => {
  if (!rules || rules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        No rule breakdown available. Run AI reconciliation to generate results.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/60 text-left">
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Rule</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Detail</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-right">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rules.map((rule, idx) => {
            const cfg = STATUS_CONFIG[rule.status] ?? STATUS_CONFIG["MISSING"];
            return (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {rule.rule}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-gray-600 dark:text-gray-400 text-xs leading-snug">
                    {rule.detail || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ScoreBar score={rule.score} maxScore={rule.max_score} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700">
            <td colSpan={3} className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
              Final AI Confidence Score
            </td>
            <td className="px-4 py-3 text-right">
              <span className="font-bold text-base text-gray-900 dark:text-white font-mono">
                {totalScore.toFixed(0)}%
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
