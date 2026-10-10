import { useState, useEffect, useRef, useCallback } from 'react';
import { PRESET_SCENARIOS } from '@/lib/presets';
import { packVirtualFiles } from '@/lib/engine/clientPacker';
import { countTokens } from '@/lib/engine/clientTokenizer';
import type {
  VirtualFile,
  ClientContextPackEnvelope,
  PresetScenario,
} from '@/types/playground';
import type { WorkerRequest, WorkerResponse } from '@/lib/engine/worker';

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

  const workerRef = useRef<Worker | null>(null);
  const nextRequestIdRef = useRef<number>(1);
  const pendingRequestsRef = useRef<Map<string, (resp: WorkerResponse) => void>>(new Map());

  // Initialize Web Worker when available
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        const worker = new Worker(new URL('@/lib/engine/worker.ts', import.meta.url), {
          type: 'module',
        });

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const response = event.data;
          const resolver = pendingRequestsRef.current.get(response.id);
          if (resolver) {
            resolver(response);
            pendingRequestsRef.current.delete(response.id);
          }
        };

        workerRef.current = worker;

        return () => {
          worker.terminate();
          workerRef.current = null;
        };
      } catch (err) {
        console.warn('Web Worker fallback to main thread:', err);
      }
    }
  }, []);

  // Pack execution logic (Worker or main thread fallback)
  const executePack = useCallback(() => {
    if (!task.trim() || files.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const packOpts = {
      task,
      files,
      budget,
      encoding,
      maxSliceLines: 100,
    };

    if (workerRef.current) {
      const requestId = `req_${nextRequestIdRef.current++}`;
      const request: WorkerRequest = {
        id: requestId,
        type: 'PACK',
        payload: { packOptions: packOpts },
      };

      pendingRequestsRef.current.set(requestId, (response: WorkerResponse) => {
        setIsProcessing(false);
        if (response.type === 'PACK_SUCCESS' && response.payload?.envelope) {
          setEnvelope(response.payload.envelope);
        } else if (response.payload?.error) {
          setErrorMessage(response.payload.error);
        }
      });

      workerRef.current.postMessage(request);
    } else {
      // Synchronous fallback
      try {
        const result = packVirtualFiles(packOpts);
        setEnvelope(result);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
      } finally {
        setIsProcessing(false);
      }
    }
  }, [task, files, budget, encoding]);

  // Load Preset — E: also clears stale envelope so ResultPane shows idle state
  const loadPreset = useCallback(
    (presetId: string, currentLang: 'en' | 'vi' = 'en') => {
      const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
      if (!preset) return;

      setSelectedPresetId(preset.id);
      setTask(preset.task[currentLang]);
      setBudget(preset.recommendedBudget);
      setActiveFileIndex(0);
      setEnvelope(null);      // E: clear previous results on scenario switch
      setErrorMessage(null);

      const updatedFiles = preset.files.map((f) => ({
        ...f,
        tokens: countTokens(f.content, encoding),
      }));
      setFiles(updatedFiles);
    },
    [encoding],
  );

  // Update a single file content
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

  // A-2: Add a new blank (or pre-filled) file and jump to it
  const addFile = useCallback(
    (name: string, content = '') => {
      const newFile: VirtualFile = {
        name,
        language: name.endsWith('.py') ? 'python' : name.endsWith('.md') ? 'markdown' : 'typescript',
        content,
        tokens: countTokens(content, encoding),
      };
      setFiles((prev) => {
        const next = [...prev, newFile];
        setActiveFileIndex(next.length - 1); // jump to the newly added file
        return next;
      });
    },
    [encoding],
  );

  // A-3: Delete a file by index; reset activeFileIndex if needed
  const deleteFile = useCallback((index: number) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev; // always keep at least one file
      return prev.filter((_, i) => i !== index);
    });
    setActiveFileIndex((prev) => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
  }, []);

  // A-4: Rename a file by index
  const renameFile = useCallback((index: number, newName: string) => {
    if (!newName.trim()) return;
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, name: newName.trim() } : f)));
  }, []);

  return {
    selectedPresetId,
    task,
    budget,
    encoding,
    files,
    activeFileIndex,
    envelope,
    isProcessing,    // A-5: exposed for button disabled state
    errorMessage,
    setTask,
    setBudget,
    setEncoding,
    setActiveFileIndex,
    loadPreset,
    updateFileContent,
    addFile,         // A-2
    deleteFile,      // A-3
    renameFile,      // A-4
    executePack,
  };
}
