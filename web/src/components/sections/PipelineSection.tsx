'use client';

import * as React from 'react';
import Image from 'next/image';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Database, Cpu, PackageCheck, Layers, Maximize2 } from 'lucide-react';

export interface PipelineSectionProps {
  language: Language;
}

export function PipelineSection({ language }: PipelineSectionProps) {
  const t = DICTIONARY[language].pipeline;
  const [modalOpen, setModalOpen] = React.useState(false);

  const stages = [
    {
      num: '01',
      title: t.stage1Title,
      desc: t.stage1Desc,
      icon: Search,
      tag: 'Input Resolution',
      color: 'border-cyan-500/30 text-cyan-400',
    },
    {
      num: '02',
      title: t.stage2Title,
      desc: t.stage2Desc,
      icon: Database,
      tag: 'BM25 + TF-IDF',
      color: 'border-indigo-500/30 text-indigo-400',
    },
    {
      num: '03',
      title: t.stage3Title,
      desc: t.stage3Desc,
      icon: Cpu,
      tag: 'js-tiktoken (Pure JS)',
      color: 'border-sky-500/30 text-sky-400',
    },
    {
      num: '04',
      title: t.stage4Title,
      desc: t.stage4Desc,
      icon: PackageCheck,
      tag: 'Knapsack Packing',
      color: 'border-emerald-500/30 text-emerald-400',
    },
  ];

  return (
    <section id="pipeline" className="py-20 md:py-28 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-indigo-500/30 bg-indigo-950/30 text-indigo-400">
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Kiến trúc & Quy trình' : 'Architecture & Pipeline'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base text-slate-400 font-sans">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <Card
                key={stage.num}
                className="relative bg-slate-900/60 border-slate-800 hover:border-slate-700 transition group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 font-mono font-extrabold text-3xl text-slate-800/80 group-hover:text-cyan-500/20 transition">
                  {stage.num}
                </div>

                <CardHeader className="space-y-3">
                  <div className={`w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center border ${stage.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="slate" className="text-[11px] font-mono self-start">
                    {stage.tag}
                  </Badge>
                  <CardTitle className="text-base font-bold text-slate-100">
                    {stage.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {stage.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Architecture Diagram Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-semibold text-slate-200">
              {language === 'vi' ? 'Sơ đồ Kiến trúc Hệ thống Toàn diện' : 'Complete System Architecture Diagram'}
            </span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Phóng to sơ đồ' : 'Expand Full View'}</span>
            </button>
          </div>


          <div
            onClick={() => setModalOpen(true)}
            className="group relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden cursor-zoom-in shadow-2xl transition hover:border-cyan-500/50"
          >
            <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px]">
              <Image
                src="/system-architecture.png"
                alt="Context Pack System Architecture"
                fill
                className="object-contain p-4 group-hover:scale-[1.01] transition duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-6">
              <span className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 shadow-xl flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                {language === 'vi' ? 'Nhấn để phóng to sơ đồ kiến trúc' : 'Click to inspect architecture diagram'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Full View */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-pointer"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="relative max-w-6xl w-full max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 p-4 overflow-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 text-xs font-mono">
                <span className="text-slate-300 font-semibold">
                  {language === 'vi' ? 'Sơ Đồ Kiến Trúc Context Pack' : 'Context Pack Architecture'}
                </span>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  {language === 'vi' ? 'Đóng (ESC)' : 'Close (ESC)'}
                </button>
              </div>
              <div className="relative w-full h-[70vh]">
                <Image
                  src="/system-architecture.png"
                  alt="Context Pack Full Architecture"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
