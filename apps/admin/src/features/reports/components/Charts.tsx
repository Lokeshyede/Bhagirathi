import React from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { ChartPoint } from "../types";
import type { DashboardCharts } from "../types";

// ─── Shared Tokens ────────────────────────────────────────────────────────────
const RED    = "#c0392b";
const GREEN  = "#27ae60";
const BLUE   = "#2980b9";
const AMBER  = "#e67e22";
const PURPLE = "#8e44ad";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--tooltip-bg, #ffffff)",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
};

// ─── Chart Wrapper Card ───────────────────────────────────────────────────────
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
  >
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
    {children}
  </motion.div>
);

// ─── Revenue Chart ────────────────────────────────────────────────────────────
interface RevenueChartProps {
  data: ChartPoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => (
  <ChartCard title="Monthly Revenue" subtitle="Collected rent per month (₹)" delay={0}>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={RED} stopOpacity={0.25} />
            <stop offset="95%" stopColor={RED} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
        <Area type="monotone" dataKey="value" stroke={RED} strokeWidth={2.5}
          fill="url(#revenueGrad)" activeDot={{ r: 5, fill: RED }} />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ─── Occupancy Chart ─────────────────────────────────────────────────────────
interface OccupancyChartProps {
  data: ChartPoint[];
}

export const OccupancyChart: React.FC<OccupancyChartProps> = ({ data }) => (
  <ChartCard title="Occupancy Trend" subtitle="New check-ins per month" delay={0.05}>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, "Check-ins"]} />
        <Bar dataKey="value" fill={RED} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ─── Rent Collection Trend ────────────────────────────────────────────────────
interface RentCollectionChartProps {
  data: ChartPoint[];
}

export const RentCollectionChart: React.FC<RentCollectionChartProps> = ({ data }) => (
  <ChartCard title="Rent Collection Rate" subtitle="% of rent collected per month" delay={0.1}>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
          domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v)}%`, "Collection Rate"]} />
        <Line type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2.5}
          dot={{ r: 4, fill: GREEN }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ─── Payment Trend Chart ──────────────────────────────────────────────────────
interface PaymentTrendChartProps {
  data: Array<{ label: string; verified: number; rejected: number }>;
}

export const PaymentChart: React.FC<PaymentTrendChartProps> = ({ data }) => (
  <ChartCard title="Payment Trend" subtitle="Verified vs rejected payments per month" delay={0.15}>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
        <Bar dataKey="verified" name="Verified" fill={GREEN} radius={[3, 3, 0, 0]} maxBarSize={30} />
        <Bar dataKey="rejected" name="Rejected" fill={RED}   radius={[3, 3, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ─── Complaint Trend Chart ────────────────────────────────────────────────────
interface ComplaintTrendChartProps {
  data: Array<{ label: string; open: number; resolved: number }>;
}

export const ComplaintChart: React.FC<ComplaintTrendChartProps> = ({ data }) => (
  <ChartCard title="Complaint Trend" subtitle="Open vs resolved complaints per month" delay={0.2}>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={AMBER} stopOpacity={0.3} />
            <stop offset="95%" stopColor={AMBER} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={GREEN} stopOpacity={0.3} />
            <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
        <Area type="monotone" dataKey="open"     name="Open"     stroke={AMBER} fill="url(#openGrad)"     strokeWidth={2} />
        <Area type="monotone" dataKey="resolved" name="Resolved" stroke={GREEN} fill="url(#resolvedGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ─── Notice Engagement Chart ──────────────────────────────────────────────────
interface NoticeEngagementChartProps {
  data: Array<{ label: string; reads: number; published: number }>;
}

export const NoticeChart: React.FC<NoticeEngagementChartProps> = ({ data }) => (
  <ChartCard title="Notice Engagement" subtitle="Reads vs notices published per month" delay={0.25}>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
        <Bar dataKey="reads"     name="Reads"     fill={BLUE}   radius={[3, 3, 0, 0]} maxBarSize={30} />
        <Bar dataKey="published" name="Published" fill={PURPLE} radius={[3, 3, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ─── Tenant Growth Chart ──────────────────────────────────────────────────────
interface TenantGrowthChartProps {
  data: ChartPoint[];
}

export const TenantGrowthChart: React.FC<TenantGrowthChartProps> = ({ data }) => (
  <ChartCard title="Tenant Growth" subtitle="Active tenant count over time" delay={0.3}>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tenantGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={PURPLE} stopOpacity={0.3} />
            <stop offset="95%" stopColor={PURPLE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, "Active Tenants"]} />
        <Area type="monotone" dataKey="value" stroke={PURPLE} strokeWidth={2.5}
          fill="url(#tenantGrad)" activeDot={{ r: 5, fill: PURPLE }} />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ─── Charts Grid ──────────────────────────────────────────────────────────────
interface ChartsGridProps {
  charts: DashboardCharts;
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({ charts }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
    <RevenueChart        data={charts.monthly_revenue} />
    <OccupancyChart      data={charts.occupancy_trend} />
    <RentCollectionChart data={charts.rent_collection_trend} />
    <PaymentChart        data={charts.payment_trend} />
    <ComplaintChart      data={charts.complaint_trend} />
    <NoticeChart         data={charts.notice_engagement} />
    <div className="lg:col-span-2 xl:col-span-3">
      <TenantGrowthChart data={charts.tenant_growth} />
    </div>
  </div>
);
