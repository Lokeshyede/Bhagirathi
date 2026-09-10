import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap, CheckCircle2, XCircle, Clock, ShieldAlert, Copy,
  Brain, TrendingUp, AlertTriangle, ChevronRight, RefreshCw,
  Play, BarChart3, Target,
} from "lucide-react";
import {
  useVerificationDashboard,
  useVerifyAllReady,
} from "../hooks/useVerification";
import { VerifyAllReadyDialog } from "../components/VerifyAllReadyDialog";

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  onClick?: () => void;
  highlight?: boolean;
  badge?: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon, iconBg, onClick, highlight, badge }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`relative rounded-2xl border bg-white dark:bg-gray-900 p-5 shadow-sm transition-all
        ${onClick ? "cursor-pointer hover:shadow-md" : ""}
        ${highlight ? "border-violet-300 dark:border-violet-700 ring-1 ring-violet-200 dark:ring-violet-800" : "border-gray-200 dark:border-gray-700"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {badge}
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{subtitle}</p>}
      {onClick && <ChevronRight className="absolute right-4 bottom-4 h-4 w-4 text-gray-400" />}
    </motion.div>
  );
}

// ─── Accuracy Ring ────────────────────────────────────────────────────────────

function AccuracyRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 90 ? "#22c55e" : clamped >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor"
          strokeWidth={8} className="text-gray-200 dark:text-gray-700" />
        <circle cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold" style={{ color }}>{clamped.toFixed(0)}%</span>
        <span className="text-xs text-gray-500">accuracy</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const SmartVerificationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, refetch, isFetching } = useVerificationDashboard();
  const verifyAllReady = useVerifyAllReady();
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  const handleVerifyAllReady = async () => {
    await verifyAllReady.mutateAsync({ min_confidence: 95 });
  };

  const s = stats;
  const isDataLoading = isLoading || !s;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Verification</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-assisted bulk verification · Full audit trail · Admin control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowVerifyDialog(true)}
            disabled={isDataLoading || (s?.ai_ready ?? 0) === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/25 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Verify All Ready
            {!isDataLoading && (s?.ai_ready ?? 0) > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                {s?.ai_ready}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* 9 Stat Cards */}
      {isDataLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <StatCard
            title="Pending Verification"
            value={s?.pending_verification ?? 0}
            icon={<Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            onClick={() => navigate("/payments/queue")}
            subtitle="Submitted + Under Review"
          />
          <StatCard
            title="AI Ready"
            value={s?.ai_ready ?? 0}
            icon={<Brain className="h-5 w-5 text-green-600 dark:text-green-400" />}
            iconBg="bg-green-50 dark:bg-green-950/40"
            subtitle="Confidence ≥95%"
            highlight
            badge={
              (s?.ai_ready ?? 0) > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-bold">
                  🟢 Ready
                </span>
              ) : undefined
            }
          />
          <StatCard
            title="Manual Review"
            value={s?.manual_review_queue ?? 0}
            icon={<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            subtitle="Confidence <75%"
            onClick={() => navigate("/payments/manual-review")}
          />
          <StatCard
            title="Rejected (Total)"
            value={s?.rejected_count ?? 0}
            icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            iconBg="bg-red-50 dark:bg-red-950/40"
          />
          <StatCard
            title="Verified Today"
            value={s?.verified_today ?? 0}
            icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
            iconBg="bg-green-50 dark:bg-green-950/40"
            subtitle={`${s?.total_verified ?? 0} total verified`}
          />
          <StatCard
            title="Rejected Today"
            value={s?.rejected_today ?? 0}
            icon={<XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
            iconBg="bg-rose-50 dark:bg-rose-950/40"
          />
          <StatCard
            title="Avg. Confidence"
            value={`${(s?.average_confidence ?? 0).toFixed(1)}%`}
            icon={<Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
            iconBg="bg-violet-50 dark:bg-violet-950/40"
            subtitle="Across all reconciled"
          />
          <StatCard
            title="Duplicate Alerts"
            value={s?.duplicate_alerts ?? 0}
            icon={<Copy className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
            iconBg="bg-orange-50 dark:bg-orange-950/40"
          />
          <StatCard
            title="Fraud Alerts"
            value={s?.fraud_alerts ?? 0}
            icon={<ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />}
            iconBg="bg-red-50 dark:bg-red-950/40"
          />
        </motion.div>
      )}

      {/* Accuracy + Quick Stats Panel */}
      {!isDataLoading && s && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Accuracy Ring */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 flex flex-col items-center justify-center gap-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verification Accuracy</p>
            <AccuracyRing value={s.verification_accuracy} />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {s.total_verified} verified of {s.total_submitted} submitted
            </p>
          </div>

          {/* AI Signal panel */}
          <div className="md:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">AI Signal Summary</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "AI Ready (≥95%)", value: s.ai_ready, total: s.pending_verification, color: "bg-green-500" },
                { label: "Needs Review (75–94%)", value: Math.max(0, s.pending_verification - s.ai_ready - s.manual_review_queue), total: s.pending_verification, color: "bg-amber-500" },
                { label: "Manual Review (<75%)", value: s.manual_review_queue, total: s.pending_verification, color: "bg-red-500" },
              ].map((bar) => {
                const pct = s.pending_verification > 0 ? Math.round((bar.value / s.pending_verification) * 100) : 0;
                return (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-44 shrink-0">{bar.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className={`h-full rounded-full ${bar.color}`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-16 text-right">
                      {bar.value} <span className="text-gray-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Action Cards */}
      {!isDataLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              title: "Verification Queue",
              desc: `${s?.pending_verification ?? 0} payments awaiting review`,
              path: "/payments/queue",
              icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
              color: "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-900",
            },
            {
              title: "Manual Review Queue",
              desc: `${s?.manual_review_queue ?? 0} payments need investigation`,
              path: "/payments/manual-review",
              icon: <Clock className="h-6 w-6 text-amber-500" />,
              color: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900",
            },
            {
              title: "AI Reconciliation",
              desc: "Run AI reconciliation engine",
              path: "/payments/reconciliation",
              icon: <Brain className="h-6 w-6 text-violet-500" />,
              color: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-900",
            },
          ].map((card) => (
            <motion.button
              key={card.path}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.path)}
              className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r text-left hover:shadow-md transition-all ${card.color}`}
            >
              <div className="flex-shrink-0">{card.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{card.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{card.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Verify All Ready Dialog */}
      <VerifyAllReadyDialog
        isOpen={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
        onConfirm={handleVerifyAllReady}
        aiReadyCount={s?.ai_ready ?? 0}
        minConfidence={95}
      />
    </div>
  );
};

export default SmartVerificationDashboard;
