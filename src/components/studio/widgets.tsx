"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Area as RArea, AreaChart as RAreaChart, Bar as RBar, BarChart as RBarChart, CartesianGrid,
  Line as RLine, LineChart as RLineChart, Pie as RPie, PieChart as RPieChart,
  Radar as RRadar, RadarChart as RRadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Cell,
} from "recharts";
import { LineChart, AreaChart, BarChart3, PieChart, Radar as RadarIcon, Boxes } from "lucide-react";
import { cn, compact, seedGradient, deltaPctStr, fmtHours } from "@/lib/studio/utils";
import type { Kpi, ChartType } from "@/lib/studio/types";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ViewHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-words">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base break-words">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 min-w-0">{actions}</div>}
    </div>
  );
}

export function Sparkline({ data, className, strokeWidth = 2 }: { data: number[]; className?: string; strokeWidth?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 30;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-8 w-24 overflow-visible", className)} preserveAspectRatio="none">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({ kpi, className }: { kpi: Kpi; className?: string }) {
  const positive = kpi.deltaPct >= 0;
  const value =
    kpi.format === "compact"
      ? compact(kpi.value)
      : kpi.format === "hours"
        ? fmtHours(kpi.value)
        : kpi.format === "percent"
          ? `${(kpi.value * 100).toFixed(1)}%`
          : compact(kpi.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "obsidian-card card-elevated p-4 md:p-5 group hover:ring-focus transition-shadow",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-0">{kpi.label}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            positive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          )}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {deltaPctStr(kpi.deltaPct)}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl md:text-3xl font-bold font-mono tabular-nums">{value}</p>
        <Sparkline data={kpi.spark} className={cn("text-primary/70", positive ? "text-emerald-400/70" : "text-red-400/70")} />
      </div>
    </motion.div>
  );
}

export function ScoreRing({ value, size = 120, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  const color = value >= 70 ? "var(--chart-4)" : value >= 45 ? "var(--chart-2)" : "var(--chart-1)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono">{Math.round(value)}</span>
        {label && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

export function Thumb({ seed, className, icon }: { seed: string; className?: string; icon?: React.ReactNode }) {
  const g = seedGradient(seed);
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg flex items-center justify-center", className)}
      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-black/10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.25), transparent 55%)" }} />
      {icon && <span className="relative text-white/80">{icon}</span>}
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("obsidian-card card-elevated", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 md:px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide min-w-0">
          {icon && <span className="text-primary shrink-0">{icon}</span>}
          <span className="truncate">{title}</span>
        </h2>
        {action && <div className="flex items-center gap-2 min-w-0 flex-wrap">{action}</div>}
      </header>
      <div className={cn("p-4 md:p-5", contentClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon, title, hint, action }: { icon?: React.ReactNode; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-2xl bg-muted/60 p-4 text-muted-foreground">{icon}</div>
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

export function StatusDot({ ok, pulse }: { ok: boolean; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {ok && pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", ok ? "bg-emerald-400" : "bg-muted-foreground/40")} />
    </span>
  );
}

/* ============================================================= */
/* Charts — switchable visualisation types (line/area/bar/pie/    */
/* radar/3D) shared by Dashboard, Analytics and the YouTube Hub.  */
/* ============================================================= */

export const chartTooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    maxWidth: 260,
    overflowWrap: "anywhere" as const,
  },
  labelStyle: { color: "var(--muted-foreground)" },
};

export const CHART_TYPE_META: Record<string, { icon: React.ReactNode; i18nKey: string }> = {
  line: { icon: <LineChart className="h-3.5 w-3.5" />, i18nKey: "chart.line" },
  area: { icon: <AreaChart className="h-3.5 w-3.5" />, i18nKey: "chart.area" },
  bar: { icon: <BarChart3 className="h-3.5 w-3.5" />, i18nKey: "chart.bar" },
  pie: { icon: <PieChart className="h-3.5 w-3.5" />, i18nKey: "chart.pie" },
  radar: { icon: <RadarIcon className="h-3.5 w-3.5" />, i18nKey: "chart.radar" },
  "3d": { icon: <Boxes className="h-3.5 w-3.5" />, i18nKey: "chart.3d" },
};

/** Segmented control to pick the chart type — shows only the allowed types */
export function ChartTypeSwitcher({
  value,
  onChange,
  allowed = ["line", "area", "bar", "3d"],
  size = "sm",
}: {
  value: string;
  onChange: (t: ChartType) => void;
  allowed?: ChartType[];
  size?: "sm" | "xs";
}) {
  return (
    <div
      role="group"
      aria-label="chart type"
      className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 max-w-full overflow-x-auto no-scrollbar"
    >
      {allowed.map((t) => {
        const meta = CHART_TYPE_META[t];
        return (
          <button
            key={t}
            type="button"
            title={meta.i18nKey}
            aria-pressed={value === t}
            onClick={() => onChange(t)}
            className={cn(
              "flex items-center gap-1 rounded-md transition-colors",
              size === "xs" ? "h-6 px-1.5" : "h-7 px-2",
              value === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {meta.icon}
          </button>
        );
      })}
    </div>
  );
}

/** Pseudo-3D isometric bar shape for Recharts <Bar shape={...}> */
function Iso3DBar(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  fill?: string;
}) {
  const x = Number(props.x || 0);
  const y = Number(props.y || 0);
  const width = Number(props.width || 0);
  const height = Number(props.height || 0);
  const fill = props.fill || "var(--chart-1)";
  const d = Math.min(10, Math.max(4, width * 0.3));
  if (height <= 0 || width <= 0) return null;
  const front = `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
  const top = `M ${x} ${y} L ${x + d} ${y - d} L ${x + width + d} ${y - d} L ${x + width} ${y} Z`;
  const side = `M ${x + width} ${y} L ${x + width + d} ${y - d} L ${x + width + d} ${y + height - d} L ${x + width} ${y + height} Z`;
  return (
    <g>
      <path d={front} fill={fill} />
      <path d={top} fill={fill} opacity={0.85} transform="translate(0,-1)" />
      <path d={side} fill={fill} opacity={0.45} />
    </g>
  );
}

export interface MetricSeries {
  key: string;
  name: string;
  color: string;
  unit?: string;
}

/**
 * Time-series chart with switchable type: line / area / bar / 3D.
 * Always wrapped in a fixed-height box by the caller.
 */
export function MetricChart({
  data,
  xKey = "date",
  series,
  type = "area",
  height = 224,
  interval = "preserveStartEnd",
}: {
  data: Record<string, string | number>[];
  xKey?: string;
  series: MetricSeries[];
  type?: ChartType;
  height?: number;
  interval?: number | "preserveStartEnd" | "equidistantPreserveStart";
}) {
  const yWidth = Math.min(52, Math.max(36, String(Math.max(...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)))).length * 8));
  const common = (
    <>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey={xKey}
        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
        tickLine={false}
        axisLine={false}
        interval={interval}
      />
      <YAxis
        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
        tickLine={false}
        axisLine={false}
        width={yWidth}
        tickFormatter={(v: number) => compact(v)}
      />
      <RTooltip {...chartTooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
    </>
  );

  if (type === "bar" || type === "3d") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }} barCategoryGap={type === "3d" ? "18%" : "12%"}>
          {common}
          {series.map((s) => (
            <RBar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={type === "bar" ? [4, 4, 0, 0] : undefined}
              shape={type === "3d" ? <Iso3DBar /> : undefined}
            />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        {common}
        {series.map((s) =>
          type === "line" ? (
            <RLine key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} unit={s.unit} />
          ) : (
            <RArea key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.key})`} unit={s.unit} />
          )
        )}
      </RAreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Categorical chart with switchable type: pie (donut) / radar / bar / 3D.
 * `data`: [{ label, value }]
 */
export function CategoryChart({
  data,
  type = "pie",
  height = 224,
  colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"],
}: {
  data: { label: string; value: number }[];
  type?: ChartType;
  height?: number;
  colors?: string[];
}) {
  if (type === "radar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RRadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <PolarRadiusAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickFormatter={(v: number) => compact(v)} />
          <RRadar dataKey="value" name="" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
          <RTooltip {...chartTooltipStyle} />
        </RRadarChart>
      </ResponsiveContainer>
    );
  }
  if (type === "bar" || type === "3d") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RBarChart data={data} margin={{ top: 6, right: 10, bottom: 10, left: 0 }} barCategoryGap="18%">
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => compact(v)} />
          <RTooltip {...chartTooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
          <RBar
            dataKey="value"
            radius={type === "bar" ? [4, 4, 0, 0] : undefined}
            shape={type === "3d" ? <Iso3DBar /> : undefined}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </RBar>
        </RBarChart>
      </ResponsiveContainer>
    );
  }
  // pie / donut
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <RPie data={data} dataKey="value" nameKey="label" innerRadius={"48%"} outerRadius={"80%"} paddingAngle={2} strokeWidth={0}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </RPie>
        <RTooltip {...chartTooltipStyle} />
      </RPieChart>
    </ResponsiveContainer>
  );
}
