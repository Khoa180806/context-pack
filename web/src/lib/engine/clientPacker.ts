import { countTokens } from './clientTokenizer';
import { rankFiles } from './clientRanker';
import type {
  ClientPackOptions,
  ClientContextSlice,
  ClientContextPackEnvelope,
} from '@/types/playground';

export interface SlicedBlock {
  startLine: number;
  endLine: number;
  content: string;
}

export function sliceContentLines(
  content: string,
  startLine: number = 1,
  endLine: number = 100,
): SlicedBlock {
  if (!content) {
    return { content: '', startLine: 1, endLine: 1 };
  }

  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;

  const actualStart = Math.max(1, Math.min(startLine, totalLines));
  const actualEnd = Math.max(actualStart, Math.min(endLine, totalLines));

  const slicedLines = lines.slice(actualStart - 1, actualEnd);

  return {
    startLine: actualStart,
    endLine: actualEnd,
    content: slicedLines.join('\n'),
  };
}

export function packVirtualFiles(options: ClientPackOptions): ClientContextPackEnvelope {
  const startTime = Date.now();

  if (!options.task || !options.task.trim()) {
    throw new Error('Task description is required.');
  }

  if (!options.files || !Array.isArray(options.files) || options.files.length === 0) {
    throw new Error('At least one file is required.');
  }

  const budget = options.budget ?? 4000;
  if (budget < 100) {
    throw new Error(`Budget of ${budget} tokens is below the minimum threshold of 100 tokens.`);
  }

  const encoding = options.encoding ?? 'cl100k_base';
  const maxSliceLines = options.maxSliceLines ?? 100;
  const minRelevance = options.minRelevance ?? 0;

  // Rank candidate files
  const ranked = rankFiles(options.files, options.task, minRelevance);

  const slices: ClientContextSlice[] = [];
  let usedTokens = 0;
  let truncated = false;
  const selectedFiles = new Set<string>();

  // Greedy knapsack packing
  for (const item of ranked) {
    const sliced = sliceContentLines(item.content, 1, maxSliceLines);
    const tokens = countTokens(sliced.content, encoding);

    if (usedTokens + tokens <= budget) {
      usedTokens += tokens;
      selectedFiles.add(item.name);
      slices.push({
        file: item.name,
        start_line: sliced.startLine,
        end_line: sliced.endLine,
        tokens,
        relevance_score: item.score,
        content: sliced.content,
      });
    } else {
      truncated = true;
    }
  }

  return {
    data: {
      task: options.task,
      budget_tokens: budget,
      used_tokens: usedTokens,
      file_count: selectedFiles.size,
      slice_count: slices.length,
      truncated,
      slices,
    },
    metadata: {
      schema_version: '1.0',
      source: 'context-pack-web',
      duration_ms: Math.max(1, Date.now() - startTime),
      truncated,
      next_cursor: null,
    },
  };
}
