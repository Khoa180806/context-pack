'use client';

import * as React from 'react';
import Image from 'next/image';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { ExternalLink, Terminal, GitBranch, Heart } from 'lucide-react';

export interface FooterProps {
  language: Language;
  onLanguageToggle: (lang: Language) => void;
}

export function Footer({ language, onLanguageToggle }: FooterProps) {
  const t = DICTIONARY[language].footer;

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/70 py-16 text-xs font-mono text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/30">
                <Image src="/logo.svg" alt="Context Pack" fill className="object-contain p-0.5" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">Context Pack</span>
              <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                v0.1.1
              </span>
            </div>

            <p className="text-slate-400 text-xs font-sans leading-relaxed max-w-md">
              {t.tagline}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <LanguageToggle currentLang={language} onToggle={onLanguageToggle} />
            </div>
          </div>

          {/* Docs Links */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              {t.docs}
            </div>
            <ul className="space-y-2 text-slate-400 font-sans text-xs">
              <li>
                <a
                  href="https://github.com/Khoa180806/context-pack/blob/main/docs/SPEC.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  <span>{t.spec}</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Khoa180806/context-pack/blob/main/docs/BENCHMARK_RESULTS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  <span>{t.benchmarkReport}</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/ai-context-pack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  <span>npm: ai-context-pack</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
            </ul>
          </div>

          {/* Ecosystem / Community Links */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              {t.community}
            </div>
            <ul className="space-y-2 text-slate-400 font-sans text-xs">
              <li>
                <a
                  href="https://github.com/Khoa180806/context-pack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.githubRepo}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Khoa180806/context-pack/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  <span>{t.reportIssue}</span>
                </a>
              </li>
              <li>
                <span className="text-slate-500">{t.mitLicense}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>{t.license}</div>
          <div className="flex items-center gap-1">
            <span>{t.author}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
