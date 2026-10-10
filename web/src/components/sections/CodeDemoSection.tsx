'use client';

import * as React from 'react';
import Image from 'next/image';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { TabList, TabTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Terminal, Code, Copy, Check, Sparkles } from 'lucide-react';

export interface CodeDemoSectionProps {
  language: Language;
}

export function CodeDemoSection({ language }: CodeDemoSectionProps) {
  const t = DICTIONARY[language].cliDemo;
  const [activeTab, setActiveTab] = React.useState<'cli' | 'sdk'>('cli');
  const [copied, setCopied] = React.useState(false);

  const sdkCode = `import { pack } from 'ai-context-pack';

// Extract optimal context for autonomous agent prompt
const result = await pack({
  task: 'Fix authentication session bug and token expiry',
  files: ['src/**/*.ts', 'lib/**/*.js'],
  budget: 2000,              // Strict token ceiling
  encoding: 'cl100k_base',    // GPT-4 / 3.5 BPE encoding
  minRelevance: 0.1,         // Filter noise
});

console.log(\`Used \${result.data.used_tokens} / \${result.data.budget_tokens} tokens\`);
console.log(\`Packed \${result.data.slice_count} high-relevance code slices.\`);

// Pass result.data directly to LLM prompt context`;

  const handleCopySdk = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code-demo" className="py-20 md:py-28 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/30 bg-cyan-950/30 text-cyan-400">
            <Code className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Trải Nghiệm Lập Trình Viên' : 'Developer Experience'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base text-slate-400 font-sans">{t.subtitle}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <TabList activeValue={activeTab} onValueChange={(val) => setActiveTab(val as 'cli' | 'sdk')}>
            <TabTrigger value="cli" activeValue={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.cliTab}</span>
              </div>
            </TabTrigger>
            <TabTrigger value="sdk" activeValue={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.sdkTab}</span>
              </div>
            </TabTrigger>
          </TabList>
        </div>

        {/* Content Box */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
          {activeTab === 'cli' ? (
            <div className="space-y-4">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-slate-400">
                    {language === 'vi' ? 'Minh họa chạy lệnh cx trong terminal' : 'cx CLI terminal execution demo'}
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400 font-mono">v0.1.1</span>
              </div>

              {/* Terminal GIF Display */}
              <div className="relative w-full aspect-[16/9] max-h-[500px] overflow-hidden bg-slate-950">
                <Image
                  src="/screenshots/cli-demo.gif"
                  alt="Context Pack CLI Demo GIF"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Code Editor Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>packContext.ts</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySdk}
                  className="h-7 text-xs font-mono gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (language === 'vi' ? 'Đã sao chép!' : 'Copied!') : (language === 'vi' ? 'Sao chép mã' : 'Copy Code')}</span>
                </Button>
              </div>


              {/* Code Pre */}
              <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
                <pre className="whitespace-pre">
                  <code>{sdkCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
