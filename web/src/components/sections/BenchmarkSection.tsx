'use client';

import * as React from 'react';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { TabList, TabTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, Layers, Database } from 'lucide-react';

export interface BenchmarkSectionProps {
  language: Language;
}

export function BenchmarkSection({ language }: BenchmarkSectionProps) {
  const t = DICTIONARY[language].benchmarks;

  // Tab: 'vibegraph' (Monorepo 994 files) | 'tokendiff' (Micro-repo 8 files)
  const [activeRepo, setActiveRepo] = React.useState<'vibegraph' | 'tokendiff'>('vibegraph');

  // Interactive ROI Calculator State
  const [dailyTasks, setDailyTasks] = React.useState<number>(100);
  const [codebaseTokens, setCodebaseTokens] = React.useState<number>(25000);
  const [modelRate, setModelRate] = React.useState<'gpt4o' | 'claudeSonnet' | 'o1'>('gpt4o');

  // Rates per 1M tokens ($/1M input tokens)
  const RATES = {
    gpt4o: { name: 'GPT-4o ($2.50 / 1M)', costPerToken: 2.5 / 1_000_000 },
    claudeSonnet: { name: 'Claude 3.5 Sonnet ($3.00 / 1M)', costPerToken: 3.0 / 1_000_000 },
    o1: { name: 'OpenAI o1 ($15.00 / 1M)', costPerToken: 15.0 / 1_000_000 },
  };

  // Measured average reduction across suites
  const reductionRate = activeRepo === 'vibegraph' ? 0.888 : 0.752;
  const daysPerMonth = 30;

  const totalMonthlyTokensWithout = dailyTasks * codebaseTokens * daysPerMonth;
  const monthlyTokensSaved = Math.round(totalMonthlyTokensWithout * reductionRate);
  const monthlyCostSaved = monthlyTokensSaved * RATES[modelRate].costPerToken;
  const yearlyCostSaved = monthlyCostSaved * 12;

  // Real-world VibeGraph-com empirical benchmark results (994 files, Java + Neo4j + Vue + AI)
  const vibegraphRows = [
    {
      task: language === 'vi' ? 'V1: Bộ lọc bảo mật & JWT Auth' : 'V1: Auth & JWT Security Filter',
      scope: 'src/**/auth/**/*.java (208 files)',
      baseline: '92,030',
      packed: '1,987',
      reduction: '-97.8%',
      latency: '1,401ms',
      highlight: 'JwtAuthFilter.java, SecurityConfig.java',
    },
    {
      task: language === 'vi' ? 'V2: Truy vấn đồ thị Neo4j Cypher' : 'V2: Neo4j Cypher Traversal',
      scope: 'src/**/graph/**/*.java (79 files)',
      baseline: '59,691',
      packed: '2,500',
      reduction: '-95.8%',
      latency: '479ms',
      highlight: 'Neo4jGraphRepository.java (L578–677)',
    },
    {
      task: language === 'vi' ? 'V3: Phân tích cú pháp AST Java' : 'V3: AST Symbol Resolution',
      scope: 'src/**/parser/**/*.java (28 files)',
      baseline: '32,422',
      packed: '1,998',
      reduction: '-93.8%',
      latency: '247ms',
      highlight: 'ParserServiceImpl.java (L400–499)',
    },
    {
      task: language === 'vi' ? 'V4: Giao diện đồ thị Vue 3 Canvas' : 'V4: Vue 3 Graph Canvas UI',
      scope: 'vibegraph-web/src/**/*.vue (70 files)',
      baseline: '269,419',
      packed: '1,922',
      reduction: '-99.3%',
      latency: '995ms',
      highlight: 'GraphCanvas.vue (L830–929)',
    },
    {
      task: language === 'vi' ? 'V5: Spring AI Gemini Client Failover' : 'V5: Spring AI Gemini Client',
      scope: 'src/**/ai/**/*.java (4 files)',
      baseline: '2,960',
      packed: '1,265',
      reduction: '-57.3%',
      latency: '22ms',
      highlight: 'GeminiChatClientConfig.java',
    },
  ];

  // Baseline token_diff empirical benchmark results (8 files)
  const tokendiffRows = [
    {
      task: language === 'vi' ? 'T1: Phân tích cờ CLI --encoding' : 'T1: Fix CLI --encoding parsing',
      scope: 'src/cli.ts, src/types.ts',
      baseline: '4,630',
      packed: '1,188',
      reduction: '-74.3%',
      latency: '47ms',
      highlight: 'src/cli.ts (0.66)',
    },
    {
      task: language === 'vi' ? 'T2: Xử lý lỗi thiếu file đầu vào' : 'T2: Missing file error handling',
      scope: 'src/cli.ts, src/errors.ts',
      baseline: '4,630',
      packed: '1,188',
      reduction: '-74.3%',
      latency: '16ms',
      highlight: 'src/cli.ts (0.65)',
    },
    {
      task: language === 'vi' ? 'T3: Tái cấu trúc cache tokenizer' : 'T3: Refactor tokenizer encodings',
      scope: 'src/tokenizer.ts',
      baseline: '4,630',
      packed: '969',
      reduction: '-79.1%',
      latency: '15ms',
      highlight: 'src/tokenizer.ts (0.44)',
    },
    {
      task: language === 'vi' ? 'T4: Viết test cho module formatter' : 'T4: Write tests for formatter',
      scope: 'src/formatter.ts',
      baseline: '4,630',
      packed: '1,188',
      reduction: '-74.3%',
      latency: '15ms',
      highlight: 'src/cli.ts (0.61)',
    },
    {
      task: language === 'vi' ? 'T5: Giải thích logic đếm token' : 'T5: Explain token counting logic',
      scope: 'src/tokenizer.ts, src/diff.ts',
      baseline: '4,630',
      packed: '1,188',
      reduction: '-74.3%',
      latency: '15ms',
      highlight: 'src/cli.ts (0.47)',
    },
  ];

  return (
    <section id="benchmarks" className="py-20 md:py-28 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/30 bg-emerald-950/30 text-emerald-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Đo kiểm thực nghiệm' : 'Empirical Verification'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base text-slate-400 font-sans">{t.subtitle}</p>
        </div>

        {/* 3 Metric Scoreboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/60 border-slate-800 text-center p-6 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-emerald-400">
              {activeRepo === 'vibegraph' ? '-88.8%' : '-75.2%'}
            </div>
            <div className="text-sm font-semibold text-slate-200">{t.avgReductionLabel}</div>
            <div className="text-xs text-slate-500 font-mono">
              {activeRepo === 'vibegraph'
                ? (language === 'vi' ? 'Đo trên Monorepo VibeGraph-com (994 files)' : 'Tested on VibeGraph-com (994 files)')
                : (language === 'vi' ? 'Đo trên repo token_diff chuẩn (8 files)' : 'Tested on token_diff benchmark repo')}
            </div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-center p-6 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-cyan-400">
              {activeRepo === 'vibegraph' ? '100%' : '21.4ms'}
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {activeRepo === 'vibegraph'
                ? (language === 'vi' ? 'Độ Chính Xác Hotspot Window' : 'Hotspot Window Accuracy')
                : t.avgLatencyLabel}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {activeRepo === 'vibegraph'
                ? (language === 'vi' ? 'Cắt trúng hàm trọng tâm (L578-677, L830-929)' : 'Accurately centered on target methods')
                : (language === 'vi' ? 'Xử lý 100% trong bộ nhớ' : '100% In-memory execution')}
            </div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-center p-6 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-indigo-400">
              {activeRepo === 'vibegraph' ? '4.4x' : t.safetyMargin}
            </div>
            <div className="text-sm font-semibold text-slate-200">{t.safetyMarginLabel}</div>
            <div className="text-xs text-slate-500 font-mono">
              {language === 'vi' ? 'Vượt xa ngưỡng tiết kiệm tối thiểu 20%' : 'Exceeds 20% savings threshold'}
            </div>
          </Card>
        </div>

        {/* Repository Tab Switcher & Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TabList
                activeValue={activeRepo}
                onValueChange={(val) => setActiveRepo(val as 'vibegraph' | 'tokendiff')}
              >
                <TabTrigger
                  value="vibegraph"
                  activeValue={activeRepo}
                  onValueChange={(v) => setActiveRepo(v as 'vibegraph' | 'tokendiff')}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>VibeGraph-com (Monorepo 994 files)</span>
                  </div>
                </TabTrigger>
                <TabTrigger
                  value="tokendiff"
                  activeValue={activeRepo}
                  onValueChange={(v) => setActiveRepo(v as 'vibegraph' | 'tokendiff')}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>token_diff (Micro-repo)</span>
                  </div>
                </TabTrigger>
              </TabList>
            </div>

            <Badge variant="emerald" className="font-mono text-xs self-start sm:self-auto">
              {activeRepo === 'vibegraph'
                ? (language === 'vi' ? '5/5 Kịch Bản Đạt Hotspot 100%' : '5/5 Scenarios 100% Hotspot')
                : (language === 'vi' ? '60/60 Tests Đạt' : '60/60 Tests Passing')}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-6">{language === 'vi' ? 'Tên Tác Vụ' : 'Task Name'}</th>
                  <th className="py-3 px-6">{language === 'vi' ? 'Phạm Vi File' : 'Scope'}</th>
                  <th className="py-3 px-6">{language === 'vi' ? 'Token Ban Đầu' : 'Baseline Tokens'}</th>
                  <th className="py-3 px-6">{language === 'vi' ? 'Token Sau Gói' : 'Packed Tokens'}</th>
                  <th className="py-3 px-6">{language === 'vi' ? 'Tỷ Lệ Giảm' : 'Reduction'}</th>
                  <th className="py-3 px-6">{language === 'vi' ? 'Độ Trễ' : 'Latency'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(activeRepo === 'vibegraph' ? vibegraphRows : tokendiffRows).map((row) => (
                  <tr key={row.task} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-6 font-medium text-slate-200">
                      <div>{row.task}</div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">{row.highlight}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">{row.scope}</td>
                    <td className="py-3.5 px-6 text-slate-400">{row.baseline}</td>
                    <td className="py-3.5 px-6 text-cyan-300 font-semibold">{row.packed}</td>
                    <td className="py-3.5 px-6">
                      <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        {row.reduction}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">{row.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Savings Calculator */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-8 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>{t.calculatorTitle}</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {language === 'vi'
                  ? 'Ước tính mức chi phí token tiết kiệm được hàng năm dựa trên quy mô nhóm và tần suất hoạt động của AI agent.'
                  : 'Simulate potential annual token cost reductions based on your team size and agent activity.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {(Object.keys(RATES) as Array<keyof typeof RATES>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModelRate(key)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                    modelRate === key
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700 font-semibold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {key === 'gpt4o' ? 'GPT-4o' : key === 'claudeSonnet' ? 'Claude 3.5' : 'o1'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Daily Tasks */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{t.dailyTasks}</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {dailyTasks} {language === 'vi' ? 'task/ngày' : 'tasks/day'}
                  </span>
                </div>
                <Slider
                  value={dailyTasks}
                  min={10}
                  max={1000}
                  step={10}
                  onChange={setDailyTasks}
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10 {language === 'vi' ? 'task' : 'tasks'}</span>
                  <span>500</span>
                  <span>1,000 {language === 'vi' ? 'task/ngày' : 'tasks/day'}</span>
                </div>
              </div>

              {/* Codebase Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{t.avgCodebaseTokens}</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {codebaseTokens.toLocaleString()} tokens
                  </span>
                </div>
                <Slider
                  value={codebaseTokens}
                  min={2000}
                  max={100000}
                  step={2000}
                  onChange={setCodebaseTokens}
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2,000 tokens</span>
                  <span>50,000</span>
                  <span>100,000 tokens</span>
                </div>
              </div>
            </div>

            {/* Live Computed Value Display (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-4 text-center sm:text-left">
              <div>
                <div className="text-xs text-slate-400 font-mono">{t.monthlyTokensSaved}</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
                  ~{(monthlyTokensSaved / 1_000_000).toFixed(2)}M tokens
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="text-xs text-slate-400 font-mono">{t.monthlyCostSaved}</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  ${monthlyCostSaved.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">
                    {language === 'vi' ? '/ tháng' : '/ month'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  ~ ${yearlyCostSaved.toFixed(0)} USD {language === 'vi' ? 'tiết kiệm mỗi năm' : 'saved annually'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
