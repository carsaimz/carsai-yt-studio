"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn, compact, seedGradient, deltaPctStr, fmtHours } from "@/lib/studio/utils";
import type { Kpi } from "@/lib/studio/types";
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
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
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
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
      <header className="flex items-center justify-between gap-2 border-b border-border/60 px-4 md:px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h2>
        {action}
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
