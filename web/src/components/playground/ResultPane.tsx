'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TokenMeter } from './TokenMeter';
import { SlicesViewer } from './SlicesViewer';
import { JsonViewer } from './JsonViewer';
import { Button } from '@/components/ui/button';
import { TabList, TabTrigger } from '@/components/ui/tabs';
import type { ClientContextPackEnvelope, VirtualFile } from '@/types/playground';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Terminal, Copy, Check, Clock, Layers, Package, Loader, AlertCircle } from 'lucide-react';

export interface ResultPaneProps {
  language: Language;
  envelope: ClientContextPackEnvelope | null;
  budget: number;
  files: VirtualFile[];
  task: string;
  isProcessing: boolean;
  errorMessage?: string | null;
  className?: string;
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
// D-4: shown while isProcessing = true

function SkeletonPulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn('animate-pulse rounded bg-slate-800/60', className)} style={style} />
  );
}

function ProcessingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Fake slice cards */}
      {[80, 60, 70].map((w, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/60 border-b border-slate-800">
            <SkeletonPulse className="w-4 h-4 rounded" />
            <SkeletonPulse className={`h-3 rounded w-${w === 80 ? '32' : w === 60 ? '24' : '28'}`} />
            <SkeletonPulse className="h-3 rounded w-16 ml-auto" />
          </div>
          <div className="p-3 space-y-1.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <SkeletonPulse key={j} className="h-2.5 rounded" style={{ width: `${60 + Math.sin(i + j) * 20}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Idle placeholder ─────────────────────────────────────────────────────────
// D-3: shown when envelope is null and not processing

function IdlePlaceholder({ language }: { language: Language }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 text-center">
      <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
        <Package className="w-8 h-8 text-slate-600" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <p className="text-sm font-semibold text-slate-300">
          {language === 'vi' ? 'Sẵn sàng đóng gói' : 'Ready to pack'}
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          {language === 'vi'
            ? 'Chọn kịch bản, nhập prompt, sau đó nhấn "Đóng gói" để phân tích và hiển thị kết quả ở đây.'
            : 'Select a scenario, write your prompt, then click "Pack Context" to analyse and display results here.'}
        </p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-[11px] font-mono text-cyan-500/70">
        <Loader className="w-3 h-3" />
        <span>{language === 'vi' ? 'Kết quả sẽ xuất hiện ở đây' : 'Results will appear here'}</span>
      </div>
    </div>
  );
}

// ─── ResultPane ───────────────────────────────────────────────────────────────

export function ResultPane({
  language,
  envelope,
  budget,
  files,
  task,
  isProcessing,
  errorMessage,
  className,
}: ResultPaneProps) {
  const t = DICTIONARY[language].playground;
  const [activeTab, setActiveTab] = React.useState<'slices' | 'json'>('slices');
  const [copiedCli, setCopiedCli] = React.useState(false);

  const cliCommand = React.useMemo(() => {
    const escapedTask = task.replace(/"/g, '\\"');
    const fileList = files.map((f) => f.name).join(',');
    return `cx -t "${escapedTask}" -f "${fileList}" -b ${budget}`;
  }, [task, files, budget]);

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const usedTokens = envelope?.data.used_tokens ?? 0;
  const truncated = envelope?.data.truncated ?? false;
  const durationMs = envelope?.metadata.duration_ms ?? 0;
  const slices = envelope?.data.slices ?? [];

  return (
    <div className={cn('space-y-5', className)}>

      {/* 1. Token Budget Meter — always visible, shows 0 when idle */}
      <TokenMeter
        usedTokens={usedTokens}
        budget={budget}
        truncated={truncated}
        labels={{
          usedTokens: t.usedTokens,
          truncationWarning: t.truncationWarning,
          tokensUnit: t.tokensUnit,
        }}
      />

      {/* 2. CLI Command toolbar — always visible */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden text-xs font-mono text-slate-400">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate select-all text-slate-300">{cliCommand}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {envelope && (
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{durationMs}ms</span>
            </div>
          )}
          <Button
            size="sm"
            variant="primary"
            onClick={handleCopyCli}
            className="text-xs font-mono h-7 gap-1.5 shrink-0"
          >
            {copiedCli ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCli ? DICTIONARY[language].hero.copied : t.copyCli}</span>
          </Button>
        </div>
      </div>

      {/* 3. Content area: idle / processing / error / results */}
      {isProcessing ? (
        /* D-4: skeleton loader */
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse">
            <Loader className="w-3.5 h-3.5 animate-spin" />
            <span>{language === 'vi' ? 'Đang phân tích...' : 'Analysing files...'}</span>
          </div>
          <ProcessingSkeleton />
        </div>
      ) : errorMessage ? (
        /* Error state — visible pack failure */
        <div className="flex flex-col items-center gap-3 py-10 rounded-xl border border-rose-800/40 bg-rose-950/20 text-center px-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-rose-300">
              {language === 'vi' ? 'Lỗi khi đóng gói' : 'Pack failed'}
            </p>
            <p className="text-xs text-rose-400/80 font-mono break-all">{errorMessage}</p>
          </div>
        </div>
      ) : envelope === null ? (
        /* D-3: idle placeholder */
        <IdlePlaceholder language={language} />
      ) : (
        /* Results: tabs with slices / JSON */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <TabList
              activeValue={activeTab}
              onValueChange={(val) => setActiveTab(val as 'slices' | 'json')}
            >
              <TabTrigger
                value="slices"
                activeValue={activeTab}
                onValueChange={(v) => setActiveTab(v as 'slices' | 'json')}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.tabVisual}</span>
                  {slices.length > 0 && (
                    <span className="ml-1 px-1.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800/40">
                      {slices.length}
                    </span>
                  )}
                </div>
              </TabTrigger>
              <TabTrigger
                value="json"
                activeValue={activeTab}
                onValueChange={(v) => setActiveTab(v as 'slices' | 'json')}
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.tabJson}</span>
                </div>
              </TabTrigger>
            </TabList>

            <div className="text-xs font-mono text-slate-500">
              {slices.length} {language === 'vi' ? 'lát cắt' : 'slices'}
            </div>
          </div>

          {activeTab === 'slices' ? (
            <SlicesViewer slices={slices} emptyMessage={t.noSlices} />
          ) : (
            <JsonViewer
              envelope={envelope}
              copyLabel={t.copyJson}
              copiedLabel={DICTIONARY[language].hero.copied}
            />
          )}
        </div>
      )}
    </div>
  );
}
