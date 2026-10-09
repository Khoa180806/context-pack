'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ClientContextPackEnvelope } from '@/types/playground';
import { Copy, Check, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface JsonViewerProps {
  envelope: ClientContextPackEnvelope | null;
  className?: string;
  copyLabel?: string;
  copiedLabel?: string;
}

export function JsonViewer({
  envelope,
  className,
  copyLabel = 'Copy JSON Envelope',
  copiedLabel = 'Copied!',
}: JsonViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const formattedJson = React.useMemo(() => {
    if (!envelope) return '// No pack result generated yet.';
    return JSON.stringify(envelope, null, 2);
  }, [envelope]);

  const handleCopy = () => {
    if (!envelope) return;
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <FileJson className="w-4 h-4 text-indigo-400" />
          <span>application/json</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          disabled={!envelope}
          className="h-7 text-xs font-mono gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </Button>
      </div>

      <div className="p-4 overflow-x-auto max-h-[480px] font-mono text-xs leading-relaxed text-cyan-300">
        <pre className="whitespace-pre">
          <code>{formattedJson}</code>
        </pre>
      </div>
    </div>
  );
}
