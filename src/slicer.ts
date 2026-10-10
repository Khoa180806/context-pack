import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { ContextPackError } from './errors.js';

export interface SlicedResult {
  content: string;
  startLine: number;
  endLine: number;
}

export function sliceLines(content: string, startLine: number, endLine: number): SlicedResult {
  if (!content) {
    return { content: '', startLine: 1, endLine: 1 };
  }

  const lines = content.split('\n');
  const total = lines.length;

  const validStart = Math.max(1, Math.min(startLine, total));
  const validEnd = Math.max(validStart, Math.min(endLine, total));

  const sliceContent = lines.slice(validStart - 1, validEnd).join('\n');
  return {
    content: sliceContent,
    startLine: validStart,
    endLine: validEnd,
  };
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'for', 'in', 'a', 'an', 'to', 'and', 'or',
  'of', 'with', 'by', 'from', 'as', 'into', 'not', 'that', 'this', 'it', 'be',
  'are', 'was', 'were', 'been', 'will', 'would', 'should', 'can', 'could', 'has',
  'have', 'had', 'does', 'did', 'do', 'but', 'if', 'when', 'than', 'then',
]);

/**
 * Task-Aware Window Slicing:
 * Locates the most relevant lines in the file matching task keywords,
 * then returns a window of maxSliceLines centered around that hotspot.
 */
export function sliceRelevantLines(
  content: string,
  task: string,
  maxSliceLines: number = 100,
): SlicedResult {
  if (!content) {
    return { content: '', startLine: 1, endLine: 1 };
  }

  const lines = content.split('\n');
  const total = lines.length;

  // If the file is smaller than or equal to maxSliceLines, keep the entire file
  if (total <= maxSliceLines) {
    return {
      content,
      startLine: 1,
      endLine: total,
    };
  }

  // Extract distinct informative terms from task description
  const rawTerms = task
    .toLowerCase()
    .match(/[a-z0-9_]{3,}/g) ?? [];

  const terms = Array.from(new Set(rawTerms)).filter((term) => !STOP_WORDS.has(term));

  if (terms.length === 0) {
    return sliceLines(content, 1, maxSliceLines);
  }

  // Score each line
  let bestLine = 1;
  let bestScore = 0;

  for (let i = 0; i < total; i++) {
    const lineLower = lines[i].toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (lineLower.includes(term)) {
        // Longer matching terms (e.g. identifier names) carry higher weights
        score += term.length >= 6 ? 3 : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestLine = i + 1; // 1-indexed
    }
  }

  // If no match found, fallback to the first maxSliceLines
  if (bestScore === 0) {
    return sliceLines(content, 1, maxSliceLines);
  }

  // Provide ~35% context lines before the hotspot and ~65% after
  const leadLines = Math.floor(maxSliceLines * 0.35);
  let startLine = Math.max(1, bestLine - leadLines);
  let endLine = Math.min(total, startLine + maxSliceLines - 1);

  // If window hits the end, push startLine backwards to capture full maxSliceLines
  if (endLine === total) {
    startLine = Math.max(1, endLine - maxSliceLines + 1);
  }

  return sliceLines(content, startLine, endLine);
}


export async function readFileContent(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new ContextPackError('NOT_FOUND', `File not found: ${filePath}`, { path: filePath });
    }
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      throw new ContextPackError('PERMISSION_DENIED', `Permission denied: ${filePath}`, { path: filePath });
    }
    throw new ContextPackError('INTERNAL_ERROR', `Failed to read file: ${filePath}`, { originalError: err.message });
  }
}

export async function resolveFiles(patterns: string[], cwd = process.cwd()): Promise<string[]> {
  const resolved = new Set<string>();

  for (const rawPattern of patterns) {
    // Normalize path separators for fast-glob cross-platform compatibility
    const normalized = rawPattern.replace(/\\/g, '/');
    const matches = await fg(normalized, {
      cwd,
      absolute: true,
      onlyFiles: true,
      unique: true,
      dot: false,
    });

    for (const match of matches) {
      resolved.add(path.normalize(match));
    }
  }

  if (resolved.size === 0) {
    throw new ContextPackError('NO_FILES_MATCHED', `No files matched the provided patterns: ${patterns.join(', ')}`, {
      patterns,
    });
  }

  return Array.from(resolved);
}
