import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert, AlertTriangle, Lock, Users, Activity,
  Fingerprint, Copy, TrendingUp, Zap, BarChart3,
} from "lucide-react";
import { useSecurityDashboard, useSecurityEvents } from "../hooks/useSecurityHooks";
import { RiskScoreCard } from "../components/RiskScoreCard";
import { SecurityTimeline } from "../components/SecurityTimeline";

export const SecurityDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useSecurityDashboard();
  const { data: events, isLoading: eventsLoading } = useSecurityEvents({ limit: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">Security Dashboard</h1>
              <p className="text-[10px] sm:text-xs text-slate-400">Fraud Protection & Risk Intelligence</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden xs:inline">Live</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6 max-w-7xl mx-auto">

        {/* Risk Level Cards */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Risk Levels</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <RiskScoreCard
              title="Critical Risk"
              value={isLoading ? "—" : stats?.critical_risk_payments ?? 0}
              icon={ShieldAlert}
              variant="critical"
              subtitle="Payments on Security Hold"
              onClick={() => navigate("/security/high-risk?levels=Critical")}
            />
            <RiskScoreCard
              title="High Risk"
              value={isLoading ? "—" : stats?.high_risk_payments ?? 0}
              icon={AlertTriangle}
              variant="high"
              subtitle="Requires admin review"
              onClick={() => navigate("/security/high-risk?levels=High")}
            />
            <RiskScoreCard
              title="Medium Risk"
              value={isLoading ? "—" : stats?.medium_risk_payments ?? 0}
              icon={Activity}
              variant="medium"
              subtitle="Monitor closely"
              onClick={() => navigate("/security/high-risk?levels=Medium")}
            />
            <RiskScoreCard
              title="Low Risk"
              value={isLoading ? "—" : stats?.low_risk_payments ?? 0}
              icon={BarChart3}
              variant="low"
              subtitle="Normal payments"
              onClick={() => navigate("/security/high-risk?levels=Low")}
            />
          </div>
        </div>

        {/* Alert Cards */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fraud Alerts</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <RiskScoreCard
              title="Duplicate UTR Alerts"
              value={isLoading ? "—" : stats?.duplicate_utr_alerts ?? 0}
              icon={Copy}
              variant="high"
              onClick={() => navigate("/security/events?event_type=DUPLICATE_UTR")}
            />
            <RiskScoreCard
              title="Screenshot Alerts"
              value={isLoading ? "—" : stats?.duplicate_screenshot_alerts ?? 0}
              icon={Fingerprint}
              variant="high"
              onClick={() => navigate("/security/events?event_type=SCREENSHOT_REUSE")}
            />
            <RiskScoreCard
              title="Fraud Alerts"
              value={isLoading ? "—" : stats?.fraud_alerts ?? 0}
              icon={ShieldAlert}
              variant="critical"
              onClick={() => navigate("/security/fraud")}
            />
            <RiskScoreCard
              title="Security Holds"
              value={isLoading ? "—" : stats?.security_holds ?? 0}
              icon={Lock}
              variant="hold"
              subtitle="Locked from verification"
              onClick={() => navigate("/security/high-risk?hold=true")}
            />
          </div>
        </div>

        {/* Account & User Cards */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">User Risk</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <RiskScoreCard
              title="Blocked Users"
              value={isLoading ? "—" : stats?.locked_accounts ?? 0}
              icon={Users}
              variant="critical"
              onClick={() => navigate("/security/suspicious-users")}
            />
            <RiskScoreCard
              title="Suspicious Users"
              value={isLoading ? "—" : stats?.suspicious_users ?? 0}
              icon={Users}
              variant="high"
              onClick={() => navigate("/security/suspicious-users")}
            />
            <RiskScoreCard
              title="Avg Risk Score"
              value={isLoading ? "—" : `${stats?.average_risk_score ?? 0}/100`}
              icon={TrendingUp}
              variant="info"
              subtitle="Across all scored payments"
            />
            <RiskScoreCard
              title="Events Today"
              value={isLoading ? "—" : stats?.security_events_today ?? 0}
              icon={Zap}
              variant="info"
              onClick={() => navigate("/security/events")}
            />
          </div>
        </div>

        {/* Main content: Timeline + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Timeline */}
          <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-slate-900/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Security Event Timeline</h2>
              </div>
              <button
                onClick={() => navigate("/security/events")}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                View all →
              </button>
            </div>
            <div className="p-5">
              <SecurityTimeline
                events={events?.items ?? []}
                loading={eventsLoading}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "High Risk Queue", path: "/security/high-risk", icon: ShieldAlert, color: "text-red-400" },
                  { label: "Fraud Alerts", path: "/security/fraud", icon: AlertTriangle, color: "text-orange-400" },
                  { label: "Security Rules", path: "/security/rules", icon: Zap, color: "text-blue-400" },
                  { label: "Suspicious Users", path: "/security/suspicious-users", icon: Users, color: "text-violet-400" },
                  { label: "Event Timeline", path: "/security/events", icon: Activity, color: "text-emerald-400" },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 hover:bg-white/8 transition-colors text-left cursor-pointer group"
                  >
                    <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                    <span className="ml-auto text-slate-600 group-hover:text-slate-400 text-xs">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-semibold text-amber-400 mb-1">🔒 Security Policy</p>
              <p className="text-xs text-amber-400/70 leading-relaxed">
                No payment is automatically rejected. Every flagged payment requires Admin review. All overrides are permanently audited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboardPage;
