import React from "react";
import { formatCurrency } from "@bhagirathi/utils";

interface StatisticsCardsProps {
  stats: {
    totalMonthlyRent: number;
    collectedRent: number;
    pendingRent: number;
    overdueRent: number;
    collectionPercentage: number;
  };
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  const collectedRent = stats.collectedRent ?? (stats as any).total_collected ?? 0;
  const pendingRent = stats.pendingRent ?? (stats as any).total_pending_amount ?? 0;
  const overdueRent = stats.overdueRent ?? 0;
  const collectionPercentage = stats.collectionPercentage ?? (stats as any).collection_rate ?? 0;

  // SVG Circular progress dimensions
  const radius = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (collectionPercentage / 100) * circumference;

  const currentMonthName = new Date().toLocaleString("default", { month: "short" });
  const monthlyData = [
    { label: currentMonthName, collected: Number(collectedRent) || 0, due: Number(pendingRent) + Number(overdueRent) || 0 }
  ];

  const maxVal = Math.max(...monthlyData.map(d => d.collected + d.due), 10000);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* 1. Collection Percentage Gauge */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between select-none min-w-0">
        <div>
          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Collection Ratio</h5>
          <p className="text-[10px] text-gray-400 mt-0.5">Summary efficiency rating</p>
        </div>

        <div className="flex items-center justify-around py-4">
          <div className="relative h-24 w-24 flex-shrink-0 flex items-center justify-center">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-gray-100 dark:stroke-gray-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-red-600"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">{collectionPercentage}%</span>
              <span className="text-[9px] text-gray-400 block font-bold uppercase mt-0.5">Paid</span>
            </div>
          </div>

          <div className="space-y-2 text-[11px] font-semibold text-gray-600 dark:text-gray-400 min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded bg-green-500 flex-shrink-0"></div>
              <span className="truncate">Collected: <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(collectedRent)}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded bg-red-500 flex-shrink-0"></div>
              <span className="truncate">Outstand: <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(pendingRent + overdueRent)}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Collection Trend chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between select-none min-w-0">
        <div>
          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Monthly Collection Trend</h5>
          <p className="text-[10px] text-gray-400 mt-0.5">Last 5 billing months overview</p>
        </div>

        <div className="flex items-end justify-center h-28 pt-4 pb-2 px-1">
          {monthlyData.map((d, i) => {
            const collectHt = (d.collected / maxVal) * 80;
            const dueHt = (d.due / maxVal) * 80;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 w-1/5 group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition p-2 bg-gray-900 text-white rounded text-[9px] font-bold pointer-events-none z-10 w-24 text-center shadow-lg">
                  <div>Paid: {formatCurrency(d.collected)}</div>
                  <div className="text-red-400 mt-0.5">Due: {formatCurrency(d.due)}</div>
                </div>

                <div className="w-4 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex flex-col justify-end h-20">
                  <div className="w-full bg-red-600" style={{ height: `${dueHt}px` }}></div>
                  <div className="w-full bg-green-500" style={{ height: `${collectHt}px` }}></div>
                </div>
                <span className="text-[9px] font-bold text-gray-500 uppercase">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Overdue & Balance Analysis */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between select-none min-w-0">
        <div>
          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Outstanding Bill Ratios</h5>
          <p className="text-[10px] text-gray-400 mt-0.5">Status share comparison</p>
        </div>

        <div className="space-y-4 py-2">
          {/* Segmented bar */}
          <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-500" style={{ width: `${collectionPercentage}%` }}></div>
            <div className="h-full bg-red-500" style={{ width: `${(overdueRent / maxVal) * 100}%` }}></div>
            <div className="h-full bg-blue-500" style={{ width: `${(pendingRent / maxVal) * 100}%` }}></div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
            <div className="space-y-1 min-w-0">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Collection</span>
              <span className="text-green-600 truncate block">{formatCurrency(collectedRent)}</span>
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Overdue</span>
              <span className="text-red-600 truncate block">{formatCurrency(overdueRent)}</span>
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Pending</span>
              <span className="text-blue-500 truncate block">{formatCurrency(pendingRent)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatisticsCards;
