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
