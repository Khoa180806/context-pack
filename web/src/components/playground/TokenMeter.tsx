'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Zap, TrendingUp } from 'lucide-react';

export interface TokenMeterProps {
  usedTokens: number;
  budget: number;
  truncated: boolean;
  className?: string;
  labels?: {
    usedTokens: string;
    truncationWarning: string;
    tokensUnit: string;
  };
}

export function TokenMeter({
  usedTokens,
  budget,
  truncated,
  className,
  labels = {
    usedTokens: 'Tokens Used',
    truncationWarning: 'Budget ceiling reached — output truncated',
    tokensUnit: 'tokens',
  },
}: TokenMeterProps) {
  // D-1: compute real percentage without capping — shows actual overflow
  const rawPercentage = budget > 0 ? Math.round((usedTokens / budget) * 100) : 0;
  const displayPercentage = rawPercentage || 0;
  // bar width is capped at 100% visually; badge shows the real number
  const barWidth = Math.min(100, displayPercentage);

  // D-1: overflow = actual usage exceeds budget
  const isOverflow = usedTokens > budget;
  const overflowPercent = isOverflow ? rawPercentage - 100 : 0;

  // Color thresholds
  let barClass = 'bg-gradient-to-r from-cyan-500 to-indigo-500';
  let badgeBorder = 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300';
  let remainingColor = 'text-slate-500';

  if (isOverflow || truncated) {
    barClass = 'bg-rose-500 animate-pulse';   // D-1: pulse when overflow
    badgeBorder = 'border-rose-500/40 bg-rose-950/40 text-rose-300';
    remainingColor = 'text-rose-400';
  } else if (displayPercentage >= 95) {
    barClass = 'bg-gradient-to-r from-amber-500 to-rose-500';
    badgeBorder = 'border-amber-500/40 bg-amber-950/40 text-amber-300';
    remainingColor = 'text-amber-400';
  } else if (displayPercentage >= 80) {
    barClass = 'bg-gradient-to-r from-indigo-500 to-purple-500';
    badgeBorder = 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300';
  }

  return (
    <div className={cn('p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3', className)}>
      {/* Row 1: label + actual token count + real % badge */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400 font-sans">{labels.usedTokens}:</span>
          <span className="font-semibold text-slate-100">
            {usedTokens.toLocaleString()} / {budget.toLocaleString()} {labels.tokensUnit}
          </span>
        </div>
        {/* D-1: badge shows real %, no Math.min(100) cap */}
        <div className={cn('px-2 py-0.5 rounded text-[11px] font-mono border font-semibold', badgeBorder)}>
          {displayPercentage}%
        </div>
      </div>

      {/* Row 2: progress bar track */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barClass)}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Row 3: status row */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        {/* D-2: distinct overflow alert when budget exceeded */}
        {isOverflow ? (
          <div className="flex items-center gap-1.5 text-rose-400 font-mono font-medium">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>
              Budget exceeded by {overflowPercent}% — output will be truncated
            </span>
          </div>
        ) : truncated ? (
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{labels.truncationWarning}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Within budget threshold</span>
          </div>
        )}

        <span className={cn('text-[11px] font-mono shrink-0', remainingColor)}>
          {isOverflow
            ? `+${(usedTokens - budget).toLocaleString()} over`
            : `${Math.max(0, budget - usedTokens).toLocaleString()} remaining`}
        </span>
      </div>
    </div>
  );
}
