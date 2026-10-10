'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ClientContextSlice } from '@/types/playground';
import { FileCode, Layers, Copy, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface SlicesViewerProps {
  slices: ClientContextSlice[];
  task?: string;
  language?: 'en' | 'vi';
  emptyMessage?: string;
  className?: string;
}


const STOP_WORDS = new Set([
  // English common stop words
  'the', 'is', 'at', 'which', 'on', 'for', 'in', 'a', 'an', 'to', 'and', 'or',
  'of', 'with', 'by', 'from', 'as', 'into', 'not', 'that', 'this', 'it', 'be',
  'are', 'was', 'were', 'been', 'will', 'would', 'should', 'can', 'could', 'has',
  'have', 'had', 'does', 'did', 'do', 'but', 'if', 'when', 'than', 'then',
  'fix', 'bug', 'issue', 'causing', 'instead',
  // Vietnamese common stop words
  'và', 'hoặc', 'của', 'với', 'cho', 'trong', 'trên', 'tại', 'bởi', 'từ', 'vào',
  'là', 'được', 'bị', 'không', 'có', 'khi', 'nếu', 'thì', 'mà', 'các', 'những',
  'sửa', 'lỗi', 'thay', 'vì', 'dẫn', 'đến', 'này', 'đó',
]);

function extractKeywords(task: string): string[] {
  if (!task) return [];
  // Match English code identifiers and Unicode words (3+ chars)
  const matches = task.toLowerCase().match(/[\p{L}0-9_]{3,}/gu) ?? [];
  return Array.from(new Set(matches)).filter((w) => !STOP_WORDS.has(w));
}


function escapeRegex(string: string): string {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

// ─── LineNumberedSlice ────────────────────────────────────────────────────────

interface LineNumberedSliceProps {
  content: string;
  startLine: number;
  keywords: string[];
}

function LineNumberedSlice({ content, startLine, keywords }: LineNumberedSliceProps) {
  const lines = content.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();

  const regex = React.useMemo(() => {
    if (keywords.length === 0) return null;
    return new RegExp(`(${keywords.map(escapeRegex).join('|')})`, 'gi');
  }, [keywords]);

  return (
    <div
      className="flex font-mono text-xs leading-relaxed overflow-x-auto"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
    >
      {/* Code with sync line numbers */}
      <div className="w-full">
        {lines.map((line, i) => {
          const lineNumber = startLine + i;
          const hasMatch = regex ? regex.test(line) : false;
          // Reset regex state after test
          if (regex) regex.lastIndex = 0;

          return (
            <div
              key={i}
              className={cn(
                'flex items-stretch hover:bg-slate-900/60 transition-colors',
                hasMatch && 'bg-cyan-950/25 border-l-2 border-cyan-400/80',
              )}
            >
              {/* Line Gutter */}
              <div
                aria-hidden="true"
                className={cn(
                  'select-none text-right pr-3 pl-2 py-0.5 min-w-[3.25rem] shrink-0 border-r border-slate-800/50',
                  hasMatch ? 'text-cyan-400 font-semibold bg-cyan-950/40' : 'text-slate-600 bg-slate-950/60',
                )}
              >
                {lineNumber}
              </div>

              {/* Line Content with keyword highlight */}
              <pre className="flex-1 px-3 py-0.5 whitespace-pre text-slate-300 min-w-0 overflow-x-visible">
                <code>
                  {regex && hasMatch
                    ? line.split(regex).map((part, idx) => {
                        const isKeyword = keywords.some(
                          (k) => k.toLowerCase() === part.toLowerCase(),
                        );
                        return isKeyword ? (
                          <mark
                            key={idx}
                            className="bg-cyan-500/25 text-cyan-200 font-semibold px-1 py-0.2 rounded border border-cyan-400/40"
                          >
                            {part}
                          </mark>
                        ) : (
                          <span key={idx}>{part}</span>
                        );
                      })
                    : line}
                </code>
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SlicesViewer ─────────────────────────────────────────────────────────────

export function SlicesViewer({
  slices,
  task = '',
  language = 'en',
  emptyMessage = 'No slices match current budget and relevance criteria.',
  className,
}: SlicesViewerProps) {
  const [copiedSliceIndex, setCopiedSliceIndex] = React.useState<number | null>(null);
  const keywords = React.useMemo(() => extractKeywords(task), [task]);

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
      {/* Keyword hint pill when keywords are active */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-[11px] font-mono text-cyan-400">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="text-slate-400">
            {language === 'vi' ? 'Từ khóa trọng tâm:' : 'Highlighted keywords:'}
          </span>
          {keywords.slice(0, 5).map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.2 rounded bg-cyan-900/40 text-cyan-200 border border-cyan-700/40"
            >
              {kw}
            </span>
          ))}
          {keywords.length > 5 && (
            <span className="text-slate-500">
              +{keywords.length - 5} {language === 'vi' ? 'từ khác' : 'more'}
            </span>
          )}
        </div>
      )}


      {slices.map((slice, index) => {
        const isCopied = copiedSliceIndex === index;

        return (
          <div
            key={`${slice.file}-${slice.start_line}-${index}`}
            className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-sm transition hover:border-slate-700"
          >
            {/* Slice Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">{slice.file}</span>
                <span className="text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40 shrink-0">
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

            {/* Line-numbered & Keyword-highlighted code area */}
            <div
              className="max-h-72 overflow-y-auto bg-slate-950/50"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            >
              <LineNumberedSlice
                content={slice.content}
                startLine={slice.start_line}
                keywords={keywords}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
