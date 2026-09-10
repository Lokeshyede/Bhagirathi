import React from "react";
import { TrendingUp, TrendingDown, FileText, AlertCircle, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import type { StatementPreview } from "../hooks/useBankStatement";

interface StatementSummaryCardsProps {
  preview: StatementPreview;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
  bgGradient: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, accent, bgGradient }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-border dark:border-gray-800 bg-white dark:bg-gray-900 p-5 group hover:shadow-md transition-shadow duration-200`}>
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${bgGradient}`} />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-lg ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-primaryText dark:text-gray-100 tracking-tight leading-none">
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] font-bold text-muted mt-1.5 uppercase tracking-wide">{subtitle}</p>
      )}
    </div>
  </div>
);

export const StatementSummaryCards: React.FC<StatementSummaryCardsProps> = ({ preview }) => {
  const { statement, valid_count, invalid_count, warning_count, duplicate_count } = preview;
  const netFlow = statement.total_credits - statement.total_debits;
  const isPositive = netFlow >= 0;

  return (
    <div className="space-y-4">
      {/* Row 1: Financial metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Transactions"
          value={statement.total_transactions.toLocaleString("en-IN")}
          subtitle={`from ${statement.file_name || "statement"}`}
          icon={<FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          accent="bg-indigo-50 dark:bg-indigo-950/40"
          bgGradient="bg-gradient-to-br from-indigo-50/0 to-indigo-50/30 dark:from-indigo-950/0 dark:to-indigo-950/20"
        />
        <MetricCard
          title="Total Credits"
          value={formatCurrency(statement.total_credits)}
          subtitle="Money received"
          icon={<TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
          accent="bg-green-50 dark:bg-green-950/40"
          bgGradient="bg-gradient-to-br from-green-50/0 to-green-50/30 dark:from-green-950/0 dark:to-green-950/20"
        />
        <MetricCard
          title="Total Debits"
          value={formatCurrency(statement.total_debits)}
          subtitle="Money sent out"
          icon={<TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />}
          accent="bg-red-50 dark:bg-red-950/40"
          bgGradient="bg-gradient-to-br from-red-50/0 to-red-50/30 dark:from-red-950/0 dark:to-red-950/20"
        />
      </div>

      {/* Row 2: Validation metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Valid"
          value={valid_count.toLocaleString("en-IN")}
          subtitle="Clean transactions"
          icon={<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
          accent="bg-green-50 dark:bg-green-950/40"
          bgGradient="bg-gradient-to-br from-green-50/0 to-green-50/20 dark:from-green-950/0 dark:to-green-950/10"
        />
        <MetricCard
          title="Invalid"
          value={invalid_count.toLocaleString("en-IN")}
          subtitle="Require attention"
          icon={<AlertCircle className="h-4 w-4 text-danger" />}
          accent="bg-red-50 dark:bg-red-950/40"
          bgGradient="bg-gradient-to-br from-red-50/0 to-red-50/20 dark:from-red-950/0 dark:to-red-950/10"
        />
        <MetricCard
          title="Warnings"
          value={warning_count.toLocaleString("en-IN")}
          subtitle="Missing UTR / narration"
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          accent="bg-amber-50 dark:bg-amber-950/40"
          bgGradient="bg-gradient-to-br from-amber-50/0 to-amber-50/20 dark:from-amber-950/0 dark:to-amber-950/10"
        />
        <MetricCard
          title="Duplicates"
          value={duplicate_count.toLocaleString("en-IN")}
          subtitle="Possible duplicates"
          icon={<Copy className="h-4 w-4 text-blue-500" />}
          accent="bg-blue-50 dark:bg-blue-950/40"
          bgGradient="bg-gradient-to-br from-blue-50/0 to-blue-50/20 dark:from-blue-950/0 dark:to-blue-950/10"
        />
      </div>

      {/* Net flow banner */}
      <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl border ${
        isPositive
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40"
          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
      }`}>
        <span className="text-xs font-bold text-muted uppercase tracking-wide">Net Flow</span>
        <span className={`text-sm font-black ${isPositive ? "text-green-700 dark:text-green-400" : "text-danger"}`}>
          {isPositive ? "+" : ""}{formatCurrency(netFlow)}
        </span>
      </div>
    </div>
  );
};
