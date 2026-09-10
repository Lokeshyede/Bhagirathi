import React from "react";

interface RiskMeterProps {
  score: number | null | undefined;
  size?: number; // SVG diameter in px
  strokeWidth?: number;
  showLabel?: boolean;
}

function scoreToColor(score: number): { stroke: string; glow: string; label: string } {
  if (score >= 86) return { stroke: "#ef4444", glow: "#ef444440", label: "Critical" };
  if (score >= 61) return { stroke: "#f97316", glow: "#f9731640", label: "High" };
  if (score >= 31) return { stroke: "#f59e0b", glow: "#f59e0b40", label: "Medium" };
  return { stroke: "#10b981", glow: "#10b98140", label: "Low" };
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}) => {
  const s = score ?? 0;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc: 270° sweep (from 135° to 405° = -225° to 45° in screen coords)
  const totalAngle = 270;
  const startAngle = 135;
  const filled = (s / 100) * totalAngle;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const { stroke, glow, label } = scoreToColor(s);
  const bgPath = describeArc(startAngle, startAngle + totalAngle);
  const fillPath = describeArc(startAngle, startAngle + filled);
  const filterId = `glow-${s}`;

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {s > 0 && (
          <path
            d={fillPath}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={`url(#${filterId})`}
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        )}

        {/* Score text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.22}
          fontWeight="bold"
          fontFamily="system-ui"
        >
          {s}
        </text>
        <text
          x={cx}
          y={cy + size * 0.14}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize={size * 0.11}
          fontFamily="system-ui"
        >
          / 100
        </text>
      </svg>

      {showLabel && (
        <span className="text-xs font-semibold" style={{ color: stroke }}>
          {label} Risk
        </span>
      )}
    </div>
  );
};
