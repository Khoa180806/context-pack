'use client';

import * as React from 'react';
import Image from 'next/image';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { Button } from '@/components/ui/button';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Terminal, Copy, Check, ExternalLink, Menu, X } from 'lucide-react';

export interface NavbarProps {
  language: Language;
  onLanguageToggle: (lang: Language) => void;
}

export function Navbar({ language, onLanguageToggle }: NavbarProps) {
  const t = DICTIONARY[language];
  const [copied, setCopied] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const installCmd = 'npm i -g ai-context-pack';

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090D16]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/30 shadow-md shadow-cyan-500/20">
            <Image src="/logo.svg" alt="Context Pack Logo" fill className="object-contain p-0.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-white tracking-tight">Context Pack</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
              v0.1.1
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            type="button"
            onClick={() => scrollTo('playground')}
            className="hover:text-cyan-400 transition"
          >
            {t.nav.playground}
          </button>
          <button
            type="button"
            onClick={() => scrollTo('pipeline')}
            className="hover:text-cyan-400 transition"
          >
            {t.nav.howItWorks}
          </button>
          <button
            type="button"
            onClick={() => scrollTo('benchmarks')}
            className="hover:text-cyan-400 transition"
          >
            {t.nav.benchmarks}
          </button>
          <button
            type="button"
            onClick={() => scrollTo('code-demo')}
            className="hover:text-cyan-400 transition"
          >
            {t.nav.cliSdk}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Install Pill */}
          <button
            type="button"
            onClick={handleCopy}
            className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:border-slate-700 transition"
            title="Click to copy global install command"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{installCmd}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
            )}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/Khoa180806/context-pack"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800 transition"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Language Toggle */}
          <LanguageToggle currentLang={language} onToggle={onLanguageToggle} />

          {/* CTA Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => scrollTo('playground')}
            className="hidden sm:inline-flex text-xs font-semibold h-8"
          >
            {t.nav.tryDemo}
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-slate-950/95 border-b border-slate-800 text-sm font-medium">
          <button
            type="button"
            onClick={() => scrollTo('playground')}
            className="block w-full text-left py-2 text-slate-300 hover:text-cyan-400"
          >
            {t.nav.playground}
          </button>
          <button
            type="button"
            onClick={() => scrollTo('pipeline')}
            className="block w-full text-left py-2 text-slate-300 hover:text-cyan-400"
          >
            {t.nav.howItWorks}
          </button>
          <button
            type="button"
            onClick={() => scrollTo('benchmarks')}
            className="block w-full text-left py-2 text-slate-300 hover:text-cyan-400"
          >
            {t.nav.benchmarks}
          </button>
          <button
            type="button"
            onClick={() => scrollTo('code-demo')}
            className="block w-full text-left py-2 text-slate-300 hover:text-cyan-400"
          >
            {t.nav.cliSdk}
          </button>
        </div>
      )}
    </header>
  );
}
