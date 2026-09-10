import React, { useState, useRef, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../utils";

export interface ChartDataItem {
  label: string;
  value: number;
  [key: string]: any;
}

// 1. AREA CHART
export interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartDataItem[];
  color?: string;
  gradientId?: string;
  height?: number;
  valueFormatter?: (val: number) => string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  color = "#DC2626", // primary
  gradientId = "chartAreaGrad",
  height = 200,
  valueFormatter = (val) => `${val}`,
  className,
  ...props
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width || 300);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1) * 1.1; // 10% breathing room
  const minVal = Math.min(...values, 0);
  const valRange = maxVal - minVal;

  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1)) * (containerWidth - 40) + 20;
    const y = height - 40 - ((item.value - minVal) / valRange) * (height - 60);
    return { x, y, item, idx };
  });

  const pathD = points.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const fillD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${height - 30} L ${points[0].x} ${height - 30} Z`
    : "";

  return (
    <div ref={containerRef} className={cn("w-full relative select-none", className)} {...props}>
      <svg width="100%" height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
          const y = 20 + r * (height - 60);
          return (
            <line
              key={idx}
              x1="20"
              y1={y}
              x2={containerWidth - 20}
              y2={y}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
              className="dark:stroke-gray-800"
            />
          );
        })}

        {/* Render filled area */}
        {fillD && <path d={fillD} fill={`url(#${gradientId})`} />}

        {/* Render line stroke */}
        {pathD && (
          <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        )}

        {/* Render dots and hover interactions */}
        {points.map((p) => (
          <g key={p.idx}>
            {hoveredIndex === p.idx && (
              <>
                <line
                  x1={p.x}
                  y1="20"
                  x2={p.x}
                  y2={height - 30}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.6}
                />
                <circle cx={p.x} cy={p.y} r={6} fill={color} />
                <circle cx={p.x} cy={p.y} r={9} fill={color} opacity={0.2} />
              </>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === p.idx ? 4 : 3}
              fill={hoveredIndex === p.idx ? "#FFFFFF" : color}
              stroke={color}
              strokeWidth={2}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIndex(p.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p) => (
          <text
            key={p.idx}
            x={p.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="10"
            className="fill-text-secondary font-semibold"
          >
            {p.item.label}
          </text>
        ))}
      </svg>

      {/* Glass tooltip overlay */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none bg-white/95 border border-border shadow-dropdown p-2.5 rounded-button text-xs font-semibold text-text-primary backdrop-blur-sm dark:bg-gray-900/90 dark:border-gray-800 dark:text-white"
          style={{
            left: `${points[hoveredIndex].x}px`,
            top: `${points[hoveredIndex].y - 50}px`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-[10px] uppercase text-text-secondary mb-0.5">
            {points[hoveredIndex].item.label}
          </p>
          <p className="text-sm font-extrabold text-primary">
            {valueFormatter(points[hoveredIndex].item.value)}
          </p>
        </div>
      )}
    </div>
  );
};

// 2. BAR CHART
export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartDataItem[];
  color?: string;
  height?: number;
  valueFormatter?: (val: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  color = "#DC2626", // primary
  height = 200,
  valueFormatter = (val) => `${val}`,
  className,
  ...props
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width || 300);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1) * 1.1;
  const minVal = Math.min(...values, 0);
  const valRange = maxVal - minVal;

  const barWidth = Math.max(12, Math.min(48, (containerWidth - 40) / data.length - 12));

  const bars = data.map((item, idx) => {
    const x = (idx / (data.length - 0.5)) * (containerWidth - 30) + 15;
    const barHeight = ((item.value - minVal) / valRange) * (height - 60);
    const y = height - 40 - barHeight;
    return { x, y, barHeight, item, idx };
  });

  return (
    <div ref={containerRef} className={cn("w-full relative select-none", className)} {...props}>
      <svg width="100%" height={height} className="overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
          const y = 20 + r * (height - 60);
          return (
            <line
              key={idx}
              x1="20"
              y1={y}
              x2={containerWidth - 20}
              y2={y}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
              className="dark:stroke-gray-800"
            />
          );
        })}

        {/* Render Bars */}
        {bars.map((b) => (
          <g key={b.idx}>
            <rect
              x={b.x - barWidth / 2}
              y={b.y}
              width={barWidth}
              height={Math.max(b.barHeight, 2)}
              rx={4}
              fill={color}
              opacity={hoveredIndex === b.idx ? 0.95 : 0.8}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIndex(b.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </g>
        ))}

        {/* X Axis Labels */}
        {bars.map((b) => (
          <text
            key={b.idx}
            x={b.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="10"
            className="fill-text-secondary font-semibold"
          >
            {b.item.label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && bars[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none bg-white/95 border border-border shadow-dropdown p-2.5 rounded-button text-xs font-semibold text-text-primary backdrop-blur-sm dark:bg-gray-900/90 dark:border-gray-800 dark:text-white"
          style={{
            left: `${bars[hoveredIndex].x}px`,
            top: `${bars[hoveredIndex].y - 50}px`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-[10px] uppercase text-text-secondary mb-0.5">
            {bars[hoveredIndex].item.label}
          </p>
          <p className="text-sm font-extrabold text-primary">
            {valueFormatter(bars[hoveredIndex].item.value)}
          </p>
        </div>
      )}
    </div>
  );
};

// 3. LINE CHART
export const LineChart: React.FC<AreaChartProps> = ({ color = "#3B82F6", ...props }) => {
  // LineChart uses identical grid geometry but strips the gradient fill
  return <AreaChart color={color} gradientId="lineChartDummyGrad" {...props} />;
};

// 4. PIE CHART
export interface PieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartDataItem[];
  colors?: string[];
  height?: number;
  valueFormatter?: (val: number) => string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  colors = ["#DC2626", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#6B7280"],
  height = 200,
  valueFormatter = (val) => `${val}`,
  className,
  ...props
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  let accumulatedAngle = 0;
  const sectors = data.map((item, idx) => {
    const percentage = total > 0 ? item.value / total : 0;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return { startAngle, angle, item, idx, percentage };
  });

  // Center coordinate mapping
  const cx = 90;
  const cy = height / 2;
  const r = Math.min(cx, cy) - 20;

  return (
    <div className={cn("w-full flex items-center justify-between gap-6 select-none", className)} {...props}>
      <svg width={cx * 2} height={height} className="overflow-visible shrink-0">
        {sectors.map((sec) => {
          // Math helper for drawing pie slices
          const x1 = cx + r * Math.cos((Math.PI * (sec.startAngle - 90)) / 180);
          const y1 = cy + r * Math.sin((Math.PI * (sec.startAngle - 90)) / 180);
          const x2 = cx + r * Math.cos((Math.PI * (sec.startAngle + sec.angle - 90)) / 180);
          const y2 = cy + r * Math.sin((Math.PI * (sec.startAngle + sec.angle - 90)) / 180);

          const largeArcFlag = sec.angle > 180 ? 1 : 0;
          const strokeColor = colors[sec.idx % colors.length];

          const d = `
            M ${cx} ${cy}
            L ${x1} ${y1}
            A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          const isHovered = hoveredIndex === sec.idx;

          return (
            <path
              key={sec.idx}
              d={d}
              fill={strokeColor}
              opacity={hoveredIndex === null ? 0.95 : isHovered ? 1 : 0.6}
              transform={isHovered ? `scale(1.03) translate(${-cx * 0.03}, ${-cy * 0.03})` : ""}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIndex(sec.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>

      {/* Legend list */}
      <div className="flex-1 flex flex-col gap-2.5">
        {sectors.map((sec) => {
          const color = colors[sec.idx % colors.length];
          const isHovered = hoveredIndex === sec.idx;

          return (
            <div
              key={sec.idx}
              className={cn(
                "flex items-center justify-between text-xs py-1 transition duration-150 px-2 rounded-button",
                isHovered && "bg-background font-bold"
              )}
              onMouseEnter={() => setHoveredIndex(sec.idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-text-secondary truncate">{sec.item.label}</span>
              </div>
              <span className="text-text-primary font-bold shrink-0">
                {valueFormatter(sec.item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. KPI TREND SPARKLINE
export interface KPITrendProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[];
  isPositive?: boolean;
}

export const KPITrend: React.FC<KPITrendProps> = ({ data, isPositive = true, className, ...props }) => {
  const width = 100;
  const height = 40;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 6) + 3;
      const y = height - 5 - ((val - min) / range) * (height - 10);
      return `${x},${y}`;
    })
    .join(" ");

  const color = isPositive ? "#22C55E" : "#EF4444";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("flex items-center gap-3.5 select-none", className)} {...props}>
      <svg width={width} height={height} className="overflow-visible">
        <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className={cn("flex items-center gap-1 text-xs font-bold", isPositive ? "text-success" : "text-danger")}>
        <TrendIcon className="h-4.5 w-4.5" />
        <span>{isPositive ? "Up" : "Down"}</span>
      </div>
    </div>
  );
};
export default AreaChart;
