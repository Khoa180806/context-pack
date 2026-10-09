'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { PlaygroundSection } from '@/components/playground/PlaygroundSection';
import { PipelineSection } from '@/components/sections/PipelineSection';
import { BenchmarkSection } from '@/components/sections/BenchmarkSection';
import { CodeDemoSection } from '@/components/sections/CodeDemoSection';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
      {/* 1. Sticky Navigation Header */}
      <Navbar language={language} onLanguageToggle={setLanguage} />

      {/* Main Page Flow */}
      <main>
        {/* 2. Hero Section */}
        <HeroSection language={language} />

        {/* 3. Interactive Web Playground (Core Highlight) */}
        <PlaygroundSection language={language} />

        {/* 4. Execution Pipeline & Architecture */}
        <PipelineSection language={language} />

        {/* 5. Empirical Benchmarks & Interactive ROI Calculator */}
        <BenchmarkSection language={language} />

        {/* 6. CLI & TypeScript SDK Showcase */}
        <CodeDemoSection language={language} />
      </main>

      {/* 7. Footer */}
      <Footer language={language} onLanguageToggle={setLanguage} />
    </div>
  );
}
