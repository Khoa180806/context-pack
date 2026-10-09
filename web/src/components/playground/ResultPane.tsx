'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TokenMeter } from './TokenMeter';
import { SlicesViewer } from './SlicesViewer';
import { JsonViewer } from './JsonViewer';
import { Button } from '@/components/ui/button';
import { Tabs, TabList, TabTrigger } from '@/components/ui/tabs';
import type { ClientContextPackEnvelope, VirtualFile } from '@/types/playground';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Terminal, Copy, Check, Clock, Layers, Sparkles } from 'lucide-react';

export interface ResultPaneProps {
  language: Language;
  envelope: ClientContextPackEnvelope | null;
  budget: number;
  files: VirtualFile[];
  task: string;
  className?: string;
}

export function ResultPane({
  language,
  envelope,
  budget,
  files,
  task,
  className,
}: ResultPaneProps) {
  const t = DICTIONARY[language].playground;
  const [activeTab, setActiveTab] = React.useState<'slices' | 'json'>('slices');
  const [copiedCli, setCopiedCli] = React.useState(false);

  // Generate equivalent cx CLI command based on live inputs
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
    <div className={cn('space-y-6', className)}>
      {/* 1. Real-time Token Budget Meter */}
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

      {/* 2. Quick Action Toolbar: Copy CLI Command & Latency */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden text-xs font-mono text-slate-400">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate select-all text-slate-300">{cliCommand}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{durationMs}ms</span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleCopyCli}
            className="text-xs font-mono h-7 gap-1.5 shrink-0"
          >
            {copiedCli ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCli ? DICTIONARY[language].hero.copied : t.copyCli}</span>
          </Button>
        </div>
      </div>

      {/* 3. Output Tabs: Visual Slices vs JSON Envelope */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <TabList activeValue={activeTab} onValueChange={(val) => setActiveTab(val as 'slices' | 'json')}>
            <TabTrigger value="slices" activeValue={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.tabVisual}</span>
                {slices.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800/40">
                    {slices.length}
                  </span>
                )}
              </div>
            </TabTrigger>
            <TabTrigger value="json" activeValue={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.tabJson}</span>
              </div>
            </TabTrigger>
          </TabList>

          <div className="text-xs font-mono text-slate-500">
            {slices.length} slices selected
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
    </div>
  );
}
