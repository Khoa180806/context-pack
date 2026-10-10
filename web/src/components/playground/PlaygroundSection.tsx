'use client';

import * as React from 'react';
import { useContextPacker } from '@/hooks/useContextPacker';
import { InputPane } from './InputPane';
import { ResultPane } from './ResultPane';
import type { Language } from '@/lib/i18n/types';
import { DICTIONARY } from '@/lib/i18n/dictionaries';
import { ShieldCheck, Zap } from 'lucide-react';

export interface PlaygroundSectionProps {
  language: Language;
}

export function PlaygroundSection({ language }: PlaygroundSectionProps) {
  const t = DICTIONARY[language].playground;

  const {
    selectedPresetId,
    task,
    budget,
    encoding,
    files,
    activeFileIndex,
    envelope,
    isProcessing,   // A-5: for button disabled state
    errorMessage,   // surface pack errors to ResultPane
    setTask,
    setBudget,
    setEncoding,
    setActiveFileIndex,
    loadPreset,
    updateFileContent,
    addFile,        // A-2
    deleteFile,     // A-3
    renameFile,     // A-4
    executePack,    // exposed for Pack button
  } = useContextPacker({ initialPresetId: 'auth-bug' });

  // Reload preset translations when language switches — skip if user is on a custom scenario
  // to avoid wiping their custom files and prompt (A-6)
  React.useEffect(() => {
    if (selectedPresetId !== 'custom') {
      loadPreset(selectedPresetId, language);
    }
  }, [language, loadPreset, selectedPresetId]);

  return (
    <section id="playground" className="py-16 md:py-24 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/30 bg-cyan-950/30 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Trải Nghiệm Web Trực Tiếp' : 'Interactive Web Playground'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            {t.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.subtitle}</span>
          </div>
        </div>

        {/* Dual-Pane Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Pane: Inputs & Configuration (5 cols on lg) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
            <InputPane
              language={language}
              selectedPresetId={selectedPresetId}
              task={task}
              budget={budget}
              encoding={encoding}
              files={files}
              activeFileIndex={activeFileIndex}
              isProcessing={isProcessing}
              onSelectPreset={(id) => loadPreset(id, language)}
              onTaskChange={setTask}
              onBudgetChange={setBudget}
              onEncodingChange={setEncoding}
              onActiveFileChange={setActiveFileIndex}
              onFileContentChange={updateFileContent}
              onAddFile={addFile}
              onDeleteFile={deleteFile}
              onRenameFile={renameFile}
              onPack={executePack}
            />
          </div>

          {/* Right Pane: Live Slices & JSON Envelope Output (7 cols on lg) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
            <ResultPane
              language={language}
              envelope={envelope}
              budget={budget}
              files={files}
              task={task}
              isProcessing={isProcessing}
              errorMessage={errorMessage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
