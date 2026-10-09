import { packVirtualFiles } from './clientPacker';
import { countTokens } from './clientTokenizer';
import type { ClientPackOptions, ClientContextPackEnvelope, VirtualFile } from '@/types/playground';

export interface WorkerRequest {
  id: string;
  type: 'PACK' | 'COUNT_TOKENS';
  payload: {
    packOptions?: ClientPackOptions;
    tokenCountRequest?: {
      text: string;
      encoding?: string;
    };
  };
}

export interface WorkerResponse {
  id: string;
  type: 'PACK_SUCCESS' | 'PACK_ERROR' | 'COUNT_SUCCESS' | 'COUNT_ERROR';
  payload?: {
    envelope?: ClientContextPackEnvelope;
    tokens?: number;
    error?: string;
  };
}

// When executing inside a Web Worker context
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
    const { id, type, payload } = event.data;

    try {
      if (type === 'PACK') {
        if (!payload.packOptions) {
          throw new Error('Missing packOptions in worker request');
        }
        const envelope = packVirtualFiles(payload.packOptions);
        const response: WorkerResponse = {
          id,
          type: 'PACK_SUCCESS',
          payload: { envelope },
        };
        self.postMessage(response);
      } else if (type === 'COUNT_TOKENS') {
        if (!payload.tokenCountRequest) {
          throw new Error('Missing tokenCountRequest in worker request');
        }
        const { text, encoding } = payload.tokenCountRequest;
        const tokens = countTokens(text, encoding);
        const response: WorkerResponse = {
          id,
          type: 'COUNT_SUCCESS',
          payload: { tokens },
        };
        self.postMessage(response);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const response: WorkerResponse = {
        id,
        type: type === 'PACK' ? 'PACK_ERROR' : 'COUNT_ERROR',
        payload: { error: errorMessage },
      };
      self.postMessage(response);
    }
  });
}
