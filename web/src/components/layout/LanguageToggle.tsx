'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';

export interface LanguageToggleProps {
  currentLang: Language;
  onToggle: (lang: Language) => void;
  className?: string;
}

export function LanguageToggle({ currentLang, onToggle, className }: LanguageToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono',
        className
      )}
    >
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
      <button
        type="button"
        onClick={() => onToggle('en')}
        className={cn(
          'px-2 py-1 rounded transition-colors duration-150 cursor-pointer font-semibold',
          currentLang === 'en'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            : 'text-slate-400 hover:text-slate-200'
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onToggle('vi')}
        className={cn(
          'px-2 py-1 rounded transition-colors duration-150 cursor-pointer font-semibold',
          currentLang === 'vi'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            : 'text-slate-400 hover:text-slate-200'
        )}
      >
        VI
      </button>
    </div>
  );
}
