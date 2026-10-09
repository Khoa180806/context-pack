'use client';

import * as React from 'react';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { BarChart3, TrendingDown, DollarSign, Zap, CheckCircle2 } from 'lucide-react';

export interface BenchmarkSectionProps {
  language: Language;
}

export function BenchmarkSection({ language }: BenchmarkSectionProps) {
  const t = DICTIONARY[language].benchmarks;

  // Interactive ROI Calculator State
  const [dailyTasks, setDailyTasks] = React.useState<number>(100);
  const [codebaseTokens, setCodebaseTokens] = React.useState<number>(12000);
  const [modelRate, setModelRate] = React.useState<'gpt4o' | 'claudeSonnet' | 'o1'>('gpt4o');

  // Rates per 1M tokens ($/1M input tokens)
  const RATES = {
    gpt4o: { name: 'GPT-4o ($2.50 / 1M)', costPerToken: 2.5 / 1_000_000 },
    claudeSonnet: { name: 'Claude 3.5 Sonnet ($3.00 / 1M)', costPerToken: 3.0 / 1_000_000 },
    o1: { name: 'OpenAI o1 ($15.00 / 1M)', costPerToken: 15.0 / 1_000_000 },
  };

  // 75.2% average measured reduction
  const reductionRate = 0.752;
  const daysPerMonth = 30;

  const totalMonthlyTokensWithout = dailyTasks * codebaseTokens * daysPerMonth;
  const monthlyTokensSaved = Math.round(totalMonthlyTokensWithout * reductionRate);
  const monthlyCostSaved = monthlyTokensSaved * RATES[modelRate].costPerToken;
  const yearlyCostSaved = monthlyCostSaved * 12;

  const benchmarkRows = [
    {
      task: 'Task 1: Add new token encoding',
      baseline: '4,630',
      packed: '962',
      reduction: '-79.2%',
      latency: '24ms',
    },
    {
      task: 'Task 2: Fix token diff line counting',
      baseline: '4,630',
      packed: '1,180',
      reduction: '-74.5%',
      latency: '19ms',
    },
    {
      task: 'Task 3: Refactor cache store',
      baseline: '4,630',
      packed: '1,045',
      reduction: '-77.4%',
      latency: '21ms',
    },
    {
      task: 'Task 4: Update CLI help flags',
      baseline: '4,630',
      packed: '890',
      reduction: '-80.8%',
      latency: '18ms',
    },
    {
      task: 'Task 5: End-to-end integration test',
      baseline: '4,630',
      packed: '1,664',
      reduction: '-64.1%',
      latency: '25ms',
    },
  ];

  return (
    <section id="benchmarks" className="py-20 md:py-28 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/30 bg-emerald-950/30 text-emerald-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Empirical Verification</span>
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
              {t.avgReduction}
            </div>
            <div className="text-sm font-semibold text-slate-200">{t.avgReductionLabel}</div>
            <div className="text-xs text-slate-500 font-mono">Tested on R3 token_diff repository</div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-center p-6 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-cyan-400">
              {t.avgLatency}
            </div>
            <div className="text-sm font-semibold text-slate-200">{t.avgLatencyLabel}</div>
            <div className="text-xs text-slate-500 font-mono">100% In-memory execution</div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-center p-6 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-indigo-400">
              {t.safetyMargin}
            </div>
            <div className="text-sm font-semibold text-slate-200">{t.safetyMarginLabel}</div>
            <div className="text-xs text-slate-500 font-mono">Exceeds 20% savings threshold</div>
          </Card>
        </div>

        {/* Empirical Benchmarks Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="font-semibold text-sm text-slate-200">
              Standard Benchmark Tasks (Codebase: token_diff — 5 Scenarios)
            </div>
            <Badge variant="emerald" className="font-mono text-xs">
              42/42 Tests Passing
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-6">Task Name</th>
                  <th className="py-3 px-6">Baseline Tokens</th>
                  <th className="py-3 px-6">Packed Tokens</th>
                  <th className="py-3 px-6">Reduction</th>
                  <th className="py-3 px-6">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {benchmarkRows.map((row) => (
                  <tr key={row.task} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-6 font-medium text-slate-200">{row.task}</td>
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
                Simulate potential annual token cost reductions based on your team size and agent activity.
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
                  <span className="font-mono text-cyan-400 font-bold">{dailyTasks} tasks/day</span>
                </div>
                <Slider
                  value={dailyTasks}
                  min={10}
                  max={1000}
                  step={10}
                  onChange={setDailyTasks}
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10 tasks</span>
                  <span>500</span>
                  <span>1,000 tasks/day</span>
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
                  max={50000}
                  step={1000}
                  onChange={setCodebaseTokens}
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2,000 tokens</span>
                  <span>25,000</span>
                  <span>50,000 tokens</span>
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
                  ${monthlyCostSaved.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ month</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  ~ ${yearlyCostSaved.toFixed(0)} USD saved annually
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
