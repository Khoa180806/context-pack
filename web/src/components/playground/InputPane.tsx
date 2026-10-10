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
import {
  Sparkles,
  Sliders,
  FileCode,
  Plus,
  Trash2,
  Cpu,
  Package,
  Loader,
  Pencil,
  Check,
  X,
  PenLine,
} from 'lucide-react';

export interface InputPaneProps {
  language: Language;
  selectedPresetId: string;
  task: string;
  budget: number;
  encoding: string;
  files: VirtualFile[];
  activeFileIndex: number;
  isProcessing: boolean;
  onSelectPreset: (presetId: string) => void;
  onTaskChange: (task: string) => void;
  onBudgetChange: (budget: number) => void;
  onEncodingChange: (encoding: string) => void;
  onActiveFileChange: (index: number) => void;
  onFileContentChange: (index: number, content: string) => void;
  onAddFile: (name: string, content?: string) => void;
  onDeleteFile: (index: number) => void;
  onRenameFile: (index: number, newName: string) => void;
  onPack: () => void;
  className?: string;
}

// ─── LineNumberedEditor ──────────────────────────────────────────────────────
// Twin-scroll textarea with a synchronized line-number gutter.
// No external library — pure React + CSS.

interface LineNumberedEditorProps {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
}

function LineNumberedEditor({ value, onChange, rows = 12 }: LineNumberedEditorProps) {
  const gutterRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineCount = value.split('\n').length;

  // Sync gutter scroll position with textarea scroll
  const handleScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex w-full overflow-hidden font-mono text-xs leading-relaxed">
      {/* Gutter — line numbers */}
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="select-none overflow-hidden text-right pr-3 pt-3 pb-3 min-w-[2.75rem] bg-slate-950/80 border-r border-slate-800/60 text-slate-600"
        style={{ maxHeight: `${rows * 1.625}rem` }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="leading-relaxed">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        rows={rows}
        spellCheck={false}
        className="flex-1 p-3 bg-transparent text-slate-200 focus:outline-none resize-y leading-relaxed overflow-x-auto whitespace-pre"
        style={{ minHeight: `${rows * 1.625}rem` }}
      />
    </div>
  );
}

// ─── AddFileDialog ────────────────────────────────────────────────────────────
// Inline "new file" prompt — appears as an input row above the file list.

interface AddFileDialogProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function AddFileDialog({ onConfirm, onCancel }: AddFileDialogProps) {
  const [name, setName] = React.useState('src/new-file.ts');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onConfirm(name.trim() || 'new-file.ts');
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/20">
      <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-xs font-mono text-cyan-100 focus:outline-none min-w-0"
        placeholder="src/file.ts"
      />
      <button
        type="button"
        onClick={() => onConfirm(name.trim() || 'new-file.ts')}
        className="p-0.5 rounded text-emerald-400 hover:text-emerald-300 transition"
        title="Confirm"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-0.5 rounded text-slate-500 hover:text-slate-300 transition"
        title="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── RenameInput ──────────────────────────────────────────────────────────────
// Inline rename field shown inside an active file tab.

interface RenameInputProps {
  currentName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function RenameInput({ currentName, onConfirm, onCancel }: RenameInputProps) {
  const [name, setName] = React.useState(currentName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') onConfirm(name.trim() || currentName);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <input
      ref={inputRef}
      value={name}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      className="w-24 bg-transparent text-xs font-mono text-cyan-100 focus:outline-none border-b border-cyan-500/60"
      placeholder={currentName}
    />
  );
}

// ─── InputPane ────────────────────────────────────────────────────────────────

export function InputPane({
  language,
  selectedPresetId,
  task,
  budget,
  encoding,
  files,
  activeFileIndex,
  isProcessing,
  onSelectPreset,
  onTaskChange,
  onBudgetChange,
  onEncodingChange,
  onActiveFileChange,
  onFileContentChange,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  onPack,
  className,
}: InputPaneProps) {
  const t = DICTIONARY[language].playground;
  const encodings = getAvailableEncodings();

  const activeFile = files[activeFileIndex] ?? files[0];

  // Local UI state
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [renamingIndex, setRenamingIndex] = React.useState<number | null>(null);

  const handleAddConfirm = (name: string) => {
    onAddFile(name);
    setShowAddDialog(false);
  };

  const handleRenameConfirm = (newName: string) => {
    if (renamingIndex !== null) onRenameFile(renamingIndex, newName);
    setRenamingIndex(null);
  };

  const handleDeleteActive = () => {
    if (files.length <= 1) return; // guard: keep at least 1 file
    onDeleteFile(activeFileIndex);
  };

  return (
    <div className={cn('space-y-5', className)}>

      {/* ── 1. Preset Selector (C-1, C-2) ──────────────────────────────── */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.presetsLabel}</span>
        </label>

        {/* C-1: flex-wrap replaces grid — no truncation */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            const isCustom = preset.id === 'custom';
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                // native tooltip = full description (no extra lib)
                title={preset.description[language]}
                className={cn(
                  'flex-1 min-w-[120px] max-w-[160px] p-2.5 rounded-lg text-left border transition text-xs font-medium',
                  isSelected && !isCustom
                    ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-100 shadow-sm shadow-cyan-950'
                    : isSelected && isCustom
                      ? 'border-indigo-500/80 bg-indigo-950/40 text-indigo-100 shadow-sm'
                      : isCustom
                        ? 'border-slate-700 border-dashed bg-slate-900/40 text-slate-400 hover:border-indigo-500/50 hover:text-slate-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                )}
              >
                {/* C-2: custom gets Plus icon; others get regular label */}
                <div className="flex items-center gap-1 font-semibold text-slate-200 line-clamp-2 leading-tight mb-1">
                  {isCustom && <PenLine className="w-3 h-3 shrink-0 text-indigo-400" />}
                  <span>{preset.title[language]}</span>
                </div>
                {/* C-1: line-clamp-2 for description */}
                <div className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                  {preset.description[language]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Task / Prompt (unchanged structure) + Pack button (C-6, C-7) */}
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

        {/* C-6 & C-7: Pack button — full width, disabled + spinner when processing */}
        <button
          type="button"
          onClick={onPack}
          disabled={isProcessing || !task.trim() || files.length === 0}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition',
            'bg-cyan-600 text-white hover:bg-cyan-500 active:bg-cyan-700',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600',
            'focus:outline-none focus:ring-2 focus:ring-cyan-500/60',
          )}
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>{language === 'vi' ? 'Đang đóng gói...' : 'Packing...'}</span>
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              <span>{language === 'vi' ? 'Đóng gói' : 'Pack Context'}</span>
            </>
          )}
        </button>
      </div>

      {/* ── 3. Budget & Encoding ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
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
          <Slider value={budget} min={200} max={4000} step={50} onChange={onBudgetChange} />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>200 tokens</span>
            <span>2,000</span>
            <span>4,000 tokens</span>
          </div>
        </div>

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

      {/* ── 4. File Manager (C-3, C-4, C-5) ─────────────────────────────── */}
      <div className="space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.filesLabel}</span>
          </label>
          <span className="text-xs text-slate-500 font-mono">{files.length} files</span>
        </div>

        {/* C-5: Action bar — Add / Rename / Delete */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setShowAddDialog(true); setRenamingIndex(null); }}
            title="Add new file"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-slate-400 border border-slate-800 bg-slate-900/50 hover:text-cyan-300 hover:border-cyan-500/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={() => { setRenamingIndex(activeFileIndex); setShowAddDialog(false); }}
            disabled={files.length === 0}
            title="Rename active file"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-slate-400 border border-slate-800 bg-slate-900/50 hover:text-indigo-300 hover:border-indigo-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Rename</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteActive}
            disabled={files.length <= 1}
            title={files.length <= 1 ? 'Cannot delete the last file' : 'Delete active file'}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-slate-400 border border-slate-800 bg-slate-900/50 hover:text-rose-400 hover:border-rose-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Add file inline dialog */}
        {showAddDialog && (
          <AddFileDialog
            onConfirm={handleAddConfirm}
            onCancel={() => setShowAddDialog(false)}
          />
        )}

        {/* C-3: File tabs — scrollbar-thin replaces scrollbar-none, with right fade */}
        {files.length > 0 && (
          <div className="relative">
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            >
              {files.map((file, idx) => {
                const isActive = idx === activeFileIndex;
                const isRenaming = renamingIndex === idx;
                return (
                  <button
                    key={`${file.name}-${idx}`}
                    type="button"
                    onClick={() => { onActiveFileChange(idx); setRenamingIndex(null); }}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap border transition shrink-0',
                      isActive
                        ? 'bg-slate-800/90 text-cyan-300 border-cyan-500/50 shadow-sm font-semibold'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40',
                    )}
                  >
                    {isRenaming ? (
                      <RenameInput
                        currentName={file.name}
                        onConfirm={handleRenameConfirm}
                        onCancel={() => setRenamingIndex(null)}
                      />
                    ) : (
                      <>
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-950 px-1 rounded shrink-0">
                          {file.tokens ?? 0}t
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Right-edge fade hint that content overflows */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-slate-900/80 to-transparent rounded-r" />
          </div>
        )}

        {/* C-4: Active file editor with line numbers */}
        {activeFile && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/70 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span className="truncate max-w-[60%]">{activeFile.name}</span>
              <span className="text-[11px] text-cyan-400 shrink-0">
                {(activeFile.tokens ?? 0).toLocaleString()} tokens
              </span>
            </div>

            {/* Twin-scroll editor with line numbers */}
            <LineNumberedEditor
              value={activeFile.content}
              onChange={(val) => onFileContentChange(activeFileIndex, val)}
              rows={12}
            />
          </div>
        )}

        {/* Empty state when custom preset and no files yet */}
        {files.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 rounded-xl border border-dashed border-slate-800 text-center">
            <Plus className="w-6 h-6 text-slate-600" />
            <p className="text-xs text-slate-500">
              {language === 'vi'
                ? 'Nhấn "Add" để thêm file đầu tiên'
                : 'Click "Add" to add your first file'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
