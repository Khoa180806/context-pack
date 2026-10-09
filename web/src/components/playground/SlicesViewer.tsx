'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ClientContextSlice } from '@/types/playground';
import { FileCode, Layers, ShieldCheck, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface SlicesViewerProps {
  slices: ClientContextSlice[];
  emptyMessage?: string;
  className?: string;
}

export function SlicesViewer({
  slices,
  emptyMessage = 'No slices match current budget and relevance criteria.',
  className,
}: SlicesViewerProps) {
  const [copiedSliceIndex, setCopiedSliceIndex] = React.useState<number | null>(null);

  const handleCopySlice = (index: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSliceIndex(index);
    setTimeout(() => setCopiedSliceIndex(null), 2000);
  };

  if (!slices || slices.length === 0) {
    return (
      <div className={cn('p-8 rounded-xl border border-slate-800 bg-slate-900/40 text-center', className)}>
        <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {slices.map((slice, index) => {
        const isCopied = copiedSliceIndex === index;

        return (
          <div
            key={`${slice.file}-${slice.start_line}-${index}`}
            className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-sm transition hover:border-slate-700"
          >
            {/* Slice Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-slate-200">{slice.file}</span>
                <span className="text-slate-500">
                  lines {slice.start_line}–{slice.end_line}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="cyan" className="text-[11px] font-mono py-0.5">
                  {slice.tokens} tokens
                </Badge>
                <Badge variant="slate" className="text-[11px] font-mono py-0.5">
                  score: {slice.relevance_score.toFixed(2)}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleCopySlice(index, slice.content)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Copy slice content"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Slice Code Viewer */}
            <div className="p-3 bg-slate-950/40 overflow-x-auto text-xs font-mono text-slate-300 max-h-56 leading-relaxed">
              <pre className="whitespace-pre">
                <code>{slice.content}</code>
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
