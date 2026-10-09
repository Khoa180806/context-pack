'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { PlaygroundSection } from '@/components/playground/PlaygroundSection';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Layers, Terminal, Sparkles, ExternalLink } from 'lucide-react';

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const t = DICTIONARY[language];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090D16]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Layers className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Context Pack</span>
              <span className="text-xs font-mono text-cyan-400">v0.1.1</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Khoa180806/context-pack"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800 transition"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <LanguageToggle currentLang={language} onToggle={setLanguage} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Core Live Web Playground */}
        <PlaygroundSection language={language} />
      </main>

      {/* Basic Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-slate-950/40 text-center text-xs font-mono text-slate-500 space-y-3">
        <div>{t.footer.tagline}</div>
        <div>{t.footer.license} — {t.footer.author}</div>
      </footer>
    </div>
  );
}
