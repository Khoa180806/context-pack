import { useState, useEffect, useRef, useCallback } from 'react';
import { PRESET_SCENARIOS } from '@/lib/presets';
import { packVirtualFiles } from '@/lib/engine/clientPacker';
import { countTokens } from '@/lib/engine/clientTokenizer';
import type {
  VirtualFile,
  ClientContextPackEnvelope,
  PresetScenario,
} from '@/types/playground';

export interface UseContextPackerOptions {
  initialPresetId?: string;
}

export function useContextPacker({ initialPresetId = 'auth-bug' }: UseContextPackerOptions = {}) {
  const initialPreset =
    PRESET_SCENARIOS.find((p) => p.id === initialPresetId) || PRESET_SCENARIOS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [task, setTask] = useState<string>(initialPreset.task.en);
  const [budget, setBudget] = useState<number>(initialPreset.recommendedBudget);
  const [encoding, setEncoding] = useState<string>('cl100k_base');
  const [files, setFiles] = useState<VirtualFile[]>(() =>
    initialPreset.files.map((f) => ({
      ...f,
      tokens: countTokens(f.content, 'cl100k_base'),
    })),
  );
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [envelope, setEnvelope] = useState<ClientContextPackEnvelope | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer ref for cleanup on unmount
  const packTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (packTimerRef.current !== null) clearTimeout(packTimerRef.current);
    };
  }, []);

  // ── Pack execution ──────────────────────────────────────────────────────────
  // Runs on main thread via setTimeout(0) so the isProcessing state renders
  // (skeleton visible) before js-tiktoken does its work.
  //
  // Web Worker was removed: the @/ path alias doesn't resolve in browser
  // Worker context, causing silent failure with no feedback to the user.
  const executePack = useCallback(() => {
    if (!task.trim() || files.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    packTimerRef.current = setTimeout(() => {
      try {
        const result = packVirtualFiles({
          task,
          files,
          budget,
          encoding,
          maxSliceLines: 100,
        });


        setEnvelope(result);
        setErrorMessage(null);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setEnvelope(null);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  }, [task, files, budget, encoding]);

  // ── Load preset ─────────────────────────────────────────────────────────────
  // Resets envelope so ResultPane shows idle state after switching scenarios.
  const loadPreset = useCallback(
    (presetId: string, currentLang: 'en' | 'vi' = 'en') => {
      const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
      if (!preset) return;

      setSelectedPresetId(preset.id);
      setTask(preset.task[currentLang]);
      setBudget(preset.recommendedBudget);
      setActiveFileIndex(0);
      setEnvelope(null);
      setErrorMessage(null);

      const updatedFiles = preset.files.map((f) => ({
        ...f,
        tokens: countTokens(f.content, encoding),
      }));
      setFiles(updatedFiles);
    },
    [encoding],
  );

  // ── File content update ──────────────────────────────────────────────────────
  const updateFileContent = useCallback(
    (index: number, newContent: string) => {
      setFiles((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = {
            ...next[index],
            content: newContent,
            tokens: countTokens(newContent, encoding),
          };
        }
        return next;
      });
    },
    [encoding],
  );

  // ── Add file ─────────────────────────────────────────────────────────────────
  const addFile = useCallback(
    (name: string, content = '') => {
      const newFile: VirtualFile = {
        name,
        language:
          name.endsWith('.py') ? 'python' :
          name.endsWith('.md') ? 'markdown' :
          'typescript',
        content,
        tokens: countTokens(content, encoding),
      };
      setFiles((prev) => {
        const next = [...prev, newFile];
        setActiveFileIndex(next.length - 1);
        return next;
      });
    },
    [encoding],
  );

  // ── Delete file ───────────────────────────────────────────────────────────────
  const deleteFile = useCallback((index: number) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setActiveFileIndex((prev) => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
  }, []);

  // ── Rename file ───────────────────────────────────────────────────────────────
  const renameFile = useCallback((index: number, newName: string) => {
    if (!newName.trim()) return;
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, name: newName.trim() } : f)),
    );
  }, []);

  return {
    selectedPresetId,
    task,
    budget,
    encoding,
    files,
    activeFileIndex,
    envelope,
    isProcessing,
    errorMessage,
    setTask,
    setBudget,
    setEncoding,
    setActiveFileIndex,
    loadPreset,
    updateFileContent,
    addFile,
    deleteFile,
    renameFile,
    executePack,
  };
}
