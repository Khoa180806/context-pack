'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';

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
    truncationWarning: 'TRUNCATED (Budget Ceiling Reached)',
    tokensUnit: 'tokens',
  },
}: TokenMeterProps) {
  const percentage = Math.min(100, Math.round((usedTokens / budget) * 100)) || 0;

  // Determine status color: cyan/emerald (<80%) -> indigo/purple (80-95%) -> amber/red (>95% or truncated)
  let statusColor = 'from-cyan-500 to-indigo-500 text-cyan-400';
  let badgeBorder = 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300';

  if (percentage >= 95 || truncated) {
    statusColor = 'from-amber-500 to-rose-500 text-amber-400';
    badgeBorder = 'border-amber-500/40 bg-amber-950/40 text-amber-300';
  } else if (percentage >= 80) {
    statusColor = 'from-indigo-500 to-purple-500 text-indigo-400';
    badgeBorder = 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300';
  }

  return (
    <div className={cn('p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3', className)}>
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-sans">{labels.usedTokens}:</span>
          <span className="font-semibold text-slate-100 font-mono">
            {usedTokens.toLocaleString()} / {budget.toLocaleString()} {labels.tokensUnit}
          </span>
        </div>
        <div className={cn('px-2 py-0.5 rounded text-[11px] font-mono border font-medium', badgeBorder)}>
          {percentage}%
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={cn('h-full rounded-full transition-all duration-300 bg-gradient-to-r', statusColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status Warning / Safe Indicator */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        {truncated ? (
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
        <span className="text-[11px] text-slate-500 font-mono">
          Remaining: {Math.max(0, budget - usedTokens).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
