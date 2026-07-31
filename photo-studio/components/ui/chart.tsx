"use client";

import React, { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

interface BarChartProps {
  data: Array<{
    label: string;
    [key: string]: any;
  }>;
  categories: { key: string; name: string; color: string }[];
  className?: string;
  height?: number;
}

export function BarChart({
  data,
  categories,
  className,
  height = 240,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Find max value for scaling
  let maxValue = 0;
  data.forEach((item) => {
    categories.forEach((cat) => {
      const val = Number(item[cat.key] || 0);
      if (val > maxValue) maxValue = val;
    });
  });

  if (maxValue === 0) maxValue = 1; // Prevent division by 0

  return (
    <div className={cn("w-full select-none", className)}>
      <div
        className="relative flex items-end justify-between gap-2 pt-6 pb-2 border-b border-border/80"
        style={{ height: `${height}px` }}
      >
        {/* Background Grid Lines */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none pb-6">
          {[1, 0.75, 0.5, 0.25, 0].map((step, idx) => (
            <div
              key={idx}
              className="flex items-center w-full border-t border-border/40"
            >
              <span className="text-[10px] text-muted-foreground/60 -mt-4 pr-1">
                {step > 0
                  ? formatCurrency(maxValue * step).replace("R$", "")
                  : "0"}
              </span>
            </div>
          ))}
        </div>

        {/* Bars */}
        {data.map((item, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={item.label + index}
              className="relative flex-1 flex flex-col items-center h-full justify-end z-10 group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 z-30 px-3 py-2 rounded-lg bg-popover text-popover-foreground shadow-xl border border-border text-xs min-w-[140px] pointer-events-none transition-all animate-in fade-in-0 zoom-in-95">
                  <p className="font-semibold text-foreground mb-1">
                    {item.label}
                  </p>
                  {categories.map((cat) => (
                    <div
                      key={cat.key}
                      className="flex items-center justify-between gap-3 text-[11px]"
                    >
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}:
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(Number(item[cat.key] || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end justify-center gap-1 w-full max-w-[48px] h-full pb-0.5">
                {categories.map((cat) => {
                  const val = Number(item[cat.key] || 0);
                  const pct = Math.max(0, Math.min(100, (val / maxValue) * 100));
                  return (
                    <div
                      key={cat.key}
                      className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-90"
                      style={{
                        height: `${Math.max(4, pct)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex items-center justify-between pt-2 px-1">
        {data.map((item, index) => (
          <span
            key={item.label + index}
            className="text-center flex-1 text-[11px] font-medium text-muted-foreground truncate"
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-muted-foreground font-medium">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AreaChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  color?: string;
  className?: string;
  height?: number;
  valueFormatter?: (val: number) => string;
}

export function AreaChart({
  data,
  color = "#8b5cf6",
  className,
  height = 180,
  valueFormatter = (val) => `${val}%`,
}: AreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const points = data.map((d, idx) => {
    const x =
      data.length === 1 ? 50 : (idx / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / range) * 80; // keep within top/bottom padding
    return { x, y, label: d.label, value: d.value };
  });

  const pathD =
    points.length > 0
      ? `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`
      : "";

  const areaD =
    points.length > 0
      ? `M ${points[0].x} 100 L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${
          points[points.length - 1].x
        } 100 Z`
      : "";

  return (
    <div className={cn("w-full select-none", className)}>
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          {/* Gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under line */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Dots */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill={color}
              className="transition-all cursor-pointer hover:r-4"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Hover overlay tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-md px-3 py-1.5 rounded-lg text-xs pointer-events-none z-20"
          >
            <span className="font-semibold text-muted-foreground mr-1">
              {data[hoveredIdx].label}:
            </span>
            <span className="font-bold text-foreground">
              {valueFormatter(data[hoveredIdx].value)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        {data.map((item, index) => (
          <span
            key={item.label + index}
            className="text-center flex-1 text-[10px] font-medium text-muted-foreground truncate"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  className?: string;
  size?: number;
}

const DEFAULT_COLORS = [
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#64748b",
];

export function DonutChart({
  data,
  className,
  size = 160,
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-xs text-muted-foreground bg-muted/30 rounded-full",
          className
        )}
        style={{ width: size, height: size }}
      >
        Sem dados
      </div>
    );
  }

  let accumulatedAngle = 0;

  const slices = data.map((item, idx) => {
    const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      ...item,
      color,
      percentage,
      startAngle,
      endAngle: accumulatedAngle,
    };
  });

  // SVG arc calculation helper
  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-6",
        className
      )}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {slices.map((slice, idx) => {
            // When single slice is 100%
            if (slice.percentage >= 0.999) {
              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="18"
                />
              );
            }

            const pathData = describeArc(
              50,
              50,
              35,
              slice.startAngle,
              slice.endAngle
            );

            return (
              <path
                key={idx}
                d={pathData}
                fill="none"
                stroke={slice.color}
                strokeWidth="18"
                className="transition-all hover:opacity-80"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground">
            Total
          </span>
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-w-full">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="font-medium text-foreground truncate">
                {slice.name}
              </span>
            </div>
            <span className="font-mono text-muted-foreground ml-2">
              {Math.round(slice.percentage * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
