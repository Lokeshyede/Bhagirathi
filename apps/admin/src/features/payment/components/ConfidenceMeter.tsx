import React from "react";

interface ConfidenceMeterProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getColor(score: number) {
  if (score >= 95) return { stroke: "#22c55e", text: "text-green-500 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-900" };
  if (score >= 75) return { stroke: "#f59e0b", text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-900" };
  return { stroke: "#ef4444", text: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-900" };
}

function getEmoji(score: number) {
  if (score >= 95) return "🟢";
  if (score >= 75) return "🟡";
  return "🔴";
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  label,
  size = "md",
  showLabel = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const colors = getColor(clampedScore);

  // SVG arc parameters
  const sizeMap = { sm: 64, md: 100, lg: 140 };
  const svgSize = sizeMap[size];
  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const radius = (svgSize - strokeWidth) / 2;
  const center = svgSize / 2;
  const circumference = Math.PI * radius; // half circle

  // Arc goes from 180° (left) to 0° (right) — a semicircle
  const dashArray = circumference;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  const fontSize = size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-3xl";
  const labelSize = size === "sm" ? "text-xs" : "text-xs";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: svgSize, height: svgSize / 2 + strokeWidth }}>
        <svg
          width={svgSize}
          height={svgSize / 2 + strokeWidth}
          viewBox={`0 0 ${svgSize} ${svgSize / 2 + strokeWidth}`}
          style={{ overflow: "visible" }}
        >
          {/* Track (background arc) */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth / 2} ${center}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth / 2} ${center}`}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              transformOrigin: "center",
            }}
          />
        </svg>

        {/* Score text in center bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ marginBottom: -(strokeWidth / 2) }}
        >
          <span className={`font-bold leading-none ${fontSize} ${colors.text}`}>
            {clampedScore.toFixed(0)}%
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="flex items-center gap-1 mt-1">
          <span className={labelSize}>{getEmoji(clampedScore)}</span>
          <span className={`${labelSize} font-semibold ${colors.text}`}>{label}</span>
        </div>
      )}
    </div>
  );
};

export { getColor, getEmoji };
