'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import {
  Sparkles,
  ArrowRight,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Zap,
} from 'lucide-react';

export interface HeroSectionProps {
  language: Language;
}

export function HeroSection({ language }: HeroSectionProps) {
  const t = DICTIONARY[language].hero;
  const [activePkgManager, setActivePkgManager] = React.useState<'npm' | 'npx' | 'pnpm' | 'yarn'>('npm');
  const [copied, setCopied] = React.useState(false);

  const commands = {
    npm: 'npm i -g ai-context-pack',
    npx: 'npx ai-context-pack -t "Fix bug" -f "src/**/*.ts"',
    pnpm: 'pnpm add -g ai-context-pack',
    yarn: 'yarn global add ai-context-pack',
  };

  const currentCmd = commands[activePkgManager];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToPlayground = () => {
    const el = document.getElementById('playground');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[300px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
        {/* Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-950">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.badge}</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            <span>{t.titleLine1}</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              {t.titleLine2}
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-sans leading-relaxed pt-2">
            {t.description}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={scrollToPlayground}
            className="text-sm font-semibold gap-2 shadow-xl shadow-cyan-500/25 px-6"
          >
            <span>{t.tryPlayground}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <a
            href="https://github.com/Khoa180806/context-pack"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white font-medium text-sm transition"
          >
            <span>{t.viewGithub}</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Interactive Install Box */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                {(['npm', 'npx', 'pnpm', 'yarn'] as const).map((pkg) => (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => setActivePkgManager(pkg)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                      activePkgManager === pkg
                        ? 'bg-slate-800 text-cyan-300 font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-slate-500">terminal</span>
            </div>

            {/* Command Display */}
            <div className="flex items-center justify-between px-4 py-3 font-mono text-xs text-slate-200">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate select-all text-left">{currentCmd}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-7 text-xs font-mono gap-1.5 ml-3 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : language === 'vi' ? 'Sao chép' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust & Architecture Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-mono">
          <Badge variant="cyan" className="gap-1.5 py-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Thuần JS (Không cần WASM)' : 'Pure JS (Zero WASM)'}</span>
          </Badge>
          <Badge variant="emerald" className="gap-1.5 py-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? '60 Tests Đạt (100% Xanh)' : '60 Tests Passed (100% Green)'}</span>
          </Badge>
          <Badge variant="indigo" className="gap-1.5 py-1">
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? '-75.2% Tiết Kiệm Token' : '-75.2% Token Reduction'}</span>
          </Badge>
          <Badge variant="slate" className="py-1">
            {language === 'vi' ? 'Giấy phép MIT' : 'MIT Licensed'}
          </Badge>
        </div>
      </div>
    </section>

  );
}
