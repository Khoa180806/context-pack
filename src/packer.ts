import fs from 'node:fs/promises';
import path from 'node:path';
import { ContextPackError } from './errors.js';
import { countTokens } from './tokenizer.js';
import { resolveFiles, readFileContent, sliceLines, sliceRelevantLines } from './slicer.js';
import { rankFiles, type FileToRank } from './ranker.js';
import type {
  PackOptions,
  ContextSlice,
  ContextPackEnvelope,
} from './types.js';

export async function pack(options: PackOptions): Promise<ContextPackEnvelope> {
  const startTime = Date.now();

  // Validate inputs
  if (!options.task || typeof options.task !== 'string' || !options.task.trim()) {
    throw new ContextPackError('INVALID_INPUT', 'Task description is required.');
  }

  if (!options.files || !Array.isArray(options.files) || options.files.length === 0) {
    throw new ContextPackError('INVALID_INPUT', 'At least one file pattern is required.');
  }

  const budget = options.budget ?? 4000;
  if (budget < 100) {
    throw new ContextPackError(
      'BUDGET_TOO_SMALL',
      `Budget of ${budget} tokens is below the minimum threshold of 100 tokens.`,
      { budget, minimum: 100 },
    );
  }

  const encoding = options.encoding ?? 'cl100k_base';
  const maxSliceLines = options.maxSliceLines ?? 100;
  const minRelevance = options.minRelevance ?? 0;

  // Resolve matching files
  const filePaths = await resolveFiles(options.files);

  // Read content for all resolved files
  const fileContents: FileToRank[] = await Promise.all(
    filePaths.map(async (filePath) => {
      const content = await readFileContent(filePath);
      return { file: filePath, content };
    }),
  );

  // Rank candidate files by relevance
  const ranked = rankFiles(fileContents, options.task, minRelevance);

  const slices: ContextSlice[] = [];
  let usedTokens = 0;
  let truncated = false;
  const selectedFiles = new Set<string>();

  // Sequentially pack slices within token budget
  for (const item of ranked) {
    const sliced = sliceRelevantLines(item.content, options.task, maxSliceLines);
    const tokens = countTokens(sliced.content, encoding);

    if (usedTokens + tokens <= budget) {
      usedTokens += tokens;
      selectedFiles.add(item.file);
      slices.push({
        file: path.relative(process.cwd(), item.file).replace(/\\/g, '/'),
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

  const envelope: ContextPackEnvelope = {
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
      source: 'context-pack',
      duration_ms: Math.max(1, Date.now() - startTime),
      truncated,
      next_cursor: null,
    },
  };

  // Optionally write envelope artifact to output JSON file
  if (options.outputFile) {
    await fs.writeFile(
      options.outputFile,
      JSON.stringify(envelope, null, 2),
      'utf-8',
    );
  }

  return envelope;
}
