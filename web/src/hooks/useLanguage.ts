'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Language } from '@/lib/i18n/types';

const STORAGE_KEY = 'context_pack_lang';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en');

  // Detect browser language or stored preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === 'en' || stored === 'vi') {
        setLanguageState(stored);
        document.documentElement.lang = stored;
        return;
      }

      // Check browser locale
      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('vi')) {
        setLanguageState('vi');
        document.documentElement.lang = 'vi';
      } else {
        setLanguageState('en');
        document.documentElement.lang = 'en';
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  }, []);

  return {
    language,
    setLanguage,
  };
}
