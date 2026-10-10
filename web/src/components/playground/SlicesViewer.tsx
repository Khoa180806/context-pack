'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ClientContextSlice } from '@/types/playground';
import { FileCode, Layers, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface SlicesViewerProps {
  slices: ClientContextSlice[];
  emptyMessage?: string;
  className?: string;
}

// ─── LineNumberedSlice ────────────────────────────────────────────────────────
// D-5: renders slice code with line numbers starting from slice.start_line,
//      not from 1. Keeps the reader oriented in the original file.

interface LineNumberedSliceProps {
  content: string;
  startLine: number;
}

function LineNumberedSlice({ content, startLine }: LineNumberedSliceProps) {
  const lines = content.split('\n');
  // Trim trailing empty line that split often produces
  if (lines[lines.length - 1] === '') lines.pop();

  return (
    // D-6: overflow-x-auto + scrollbar-thin on the outer wrapper
    <div
      className="flex font-mono text-xs leading-relaxed overflow-x-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
    >
      {/* Gutter: line numbers anchored to start_line */}
      <div
        aria-hidden="true"
        className="select-none text-right pr-3 pt-3 pb-3 min-w-[3.25rem] shrink-0 bg-slate-950/60 border-r border-slate-800/50 text-slate-600"
      >
        {lines.map((_, i) => (
          <div key={i} className="leading-relaxed">
            {startLine + i}
          </div>
        ))}
      </div>

      {/* Code: whitespace-pre preserves indentation; no wrapping */}
      <pre className="flex-1 p-3 whitespace-pre text-slate-300 min-w-0 overflow-x-visible">
        <code>{lines.join('\n')}</code>
      </pre>
    </div>
  );
}

// ─── SlicesViewer ─────────────────────────────────────────────────────────────

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
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">{slice.file}</span>
                <span className="text-slate-500 shrink-0">
                  L{slice.start_line}–{slice.end_line}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="cyan" className="text-[11px] font-mono py-0.5">
                  {slice.tokens} tokens
                </Badge>
                <Badge variant="slate" className="text-[11px] font-mono py-0.5">
                  score {slice.relevance_score.toFixed(2)}
                </Badge>
                {/* D-7: Copy icon replaces ShieldCheck */}
                <button
                  type="button"
                  onClick={() => handleCopySlice(index, slice.content)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Copy slice content"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* D-5/D-6: line-numbered code viewer with real start_line offset */}
            <div className="max-h-64 overflow-y-auto bg-slate-950/40"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
              <LineNumberedSlice
                content={slice.content}
                startLine={slice.start_line}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
