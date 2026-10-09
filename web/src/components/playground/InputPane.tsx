'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { PRESET_SCENARIOS } from '@/lib/presets';
import { getAvailableEncodings } from '@/lib/engine/clientTokenizer';
import type { VirtualFile } from '@/types/playground';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { Sparkles, Sliders, FileCode, Plus, Trash2, Cpu } from 'lucide-react';

export interface InputPaneProps {
  language: Language;
  selectedPresetId: string;
  task: string;
  budget: number;
  encoding: string;
  files: VirtualFile[];
  activeFileIndex: number;
  onSelectPreset: (presetId: string) => void;
  onTaskChange: (task: string) => void;
  onBudgetChange: (budget: number) => void;
  onEncodingChange: (encoding: string) => void;
  onActiveFileChange: (index: number) => void;
  onFileContentChange: (index: number, content: string) => void;
  className?: string;
}

export function InputPane({
  language,
  selectedPresetId,
  task,
  budget,
  encoding,
  files,
  activeFileIndex,
  onSelectPreset,
  onTaskChange,
  onBudgetChange,
  onEncodingChange,
  onActiveFileChange,
  onFileContentChange,
  className,
}: InputPaneProps) {
  const t = DICTIONARY[language].playground;
  const encodings = getAvailableEncodings();

  const activeFile = files[activeFileIndex] || files[0];

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Presets Selector */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.presetsLabel}</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={cn(
                  'p-2.5 rounded-lg text-left border transition text-xs font-medium space-y-1',
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-100 shadow-sm shadow-cyan-950'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                )}
              >
                <div className="font-semibold text-slate-200 truncate">
                  {preset.title[language]}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {preset.description[language]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Task Description Input */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span>{t.taskLabel}</span>
          <span className="text-[11px] text-slate-500 font-mono lowercase">prompt</span>
        </label>
        <textarea
          value={task}
          onChange={(e) => onTaskChange(e.target.value)}
          placeholder={t.taskPlaceholder}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/80 transition resize-y font-sans leading-relaxed"
        />
      </div>

      {/* 3. Budget & Encoding Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        {/* Token Budget Slider */}
        <div className="sm:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.budgetLabel}</span>
            </label>
            <Badge variant="cyan" className="font-mono text-xs px-2 py-0.5">
              {budget.toLocaleString()} {t.tokensUnit}
            </Badge>
          </div>
          <Slider
            value={budget}
            min={200}
            max={4000}
            step={50}
            onChange={onBudgetChange}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>200 tokens</span>
            <span>2,000</span>
            <span>4,000 tokens</span>
          </div>
        </div>

        {/* Encoding Dropdown */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.encodingLabel}</span>
          </label>
          <select
            value={encoding}
            onChange={(e) => onEncodingChange(e.target.value)}
            className="w-full h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {encodings.map((enc) => (
              <option key={enc} value={enc}>
                {enc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Virtual Files Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.filesLabel}</span>
          </label>
          <span className="text-xs text-slate-500 font-mono">
            {files.length} candidate files
          </span>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {files.map((file, idx) => {
            const isActive = idx === activeFileIndex;
            return (
              <button
                key={file.name}
                type="button"
                onClick={() => onActiveFileChange(idx)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap border transition',
                  isActive
                    ? 'bg-slate-800/90 text-cyan-300 border-cyan-500/50 shadow-sm font-semibold'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40',
                )}
              >
                <span>{file.name}</span>
                <span className="text-[10px] text-slate-500 bg-slate-950 px-1 py-0.2 rounded">
                  {file.tokens || 0} tkn
                </span>
              </button>
            );
          })}
        </div>

        {/* Active File Editor */}
        {activeFile && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/70 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>{activeFile.name}</span>
              <span className="text-[11px] text-cyan-400">
                {activeFile.tokens || 0} tokens total
              </span>
            </div>
            <textarea
              value={activeFile.content}
              onChange={(e) => onFileContentChange(activeFileIndex, e.target.value)}
              rows={8}
              className="w-full p-3 bg-transparent text-xs font-mono text-slate-200 focus:outline-none resize-y leading-relaxed font-normal"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
