import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveFiles, readFileContent, sliceLines, sliceRelevantLines } from '../src/slicer.js';
import { ContextPackError } from '../src/errors.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('sliceLines', () => {
  const sampleCode = [
    'line 1',
    'line 2',
    'line 3',
    'line 4',
    'line 5',
  ].join('\n');

  it('slices lines with valid 1-indexed range', () => {
    const res = sliceLines(sampleCode, 2, 4);
    expect(res.content).toBe('line 2\nline 3\nline 4');
    expect(res.startLine).toBe(2);
    expect(res.endLine).toBe(4);
  });

  it('clamps startLine and endLine within document bounds', () => {
    const res = sliceLines(sampleCode, 0, 10);
    expect(res.content).toBe(sampleCode);
    expect(res.startLine).toBe(1);
    expect(res.endLine).toBe(5);
  });

  it('handles empty content gracefully', () => {
    const res = sliceLines('', 1, 5);
    expect(res.content).toBe('');
    expect(res.startLine).toBe(1);
    expect(res.endLine).toBe(1);
  });
});

describe('sliceRelevantLines', () => {
  const codeLines = Array.from({ length: 150 }, (_, i) => `// Line ${i + 1}`);
  codeLines[79] = 'export function validateSession(sessionId: string) {';
  codeLines[80] = '  return checkToken(sessionId);';
  codeLines[81] = '}';
  const longFile = codeLines.join('\n');

  it('returns full content if file length is <= maxSliceLines', () => {
    const shortCode = 'line 1\nline 2\nline 3';
    const res = sliceRelevantLines(shortCode, 'fix line 2', 10);
    expect(res.content).toBe(shortCode);
    expect(res.startLine).toBe(1);
    expect(res.endLine).toBe(3);
  });

  it('centers context window around matching hotspot keyword in large files', () => {
    const res = sliceRelevantLines(longFile, 'Fix bug in validateSession token check', 30);
    // Line 80 has validateSession. Window of 30 lines with ~35% lead (10 lines) should start around line 70
    expect(res.startLine).toBeLessThanOrEqual(80);
    expect(res.endLine).toBeGreaterThanOrEqual(82);
    expect(res.content).toContain('validateSession');
    expect(res.endLine - res.startLine + 1).toBe(30);
  });

  it('falls back to beginning of file if no keywords match', () => {
    const res = sliceRelevantLines(longFile, 'xyz unknown keyword nowhere found', 20);
    expect(res.startLine).toBe(1);
    expect(res.endLine).toBe(20);
  });
});


describe('readFileContent & resolveFiles', () => {
  let tempDir: string;
  let fileA: string;
  let fileB: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-slicer-test-'));
    fileA = path.join(tempDir, 'a.ts');
    fileB = path.join(tempDir, 'b.js');
    fs.writeFileSync(fileA, 'const a = 1;', 'utf-8');
    fs.writeFileSync(fileB, 'const b = 2;', 'utf-8');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('reads file content accurately', async () => {
    const content = await readFileContent(fileA);
    expect(content).toBe('const a = 1;');
  });

  it('throws NOT_FOUND when file does not exist', async () => {
    const nonExistent = path.join(tempDir, 'non_existent.ts');
    await expect(readFileContent(nonExistent)).rejects.toThrow(ContextPackError);
    try {
      await readFileContent(nonExistent);
    } catch (err) {
      expect((err as ContextPackError).code).toBe('NOT_FOUND');
    }
  });

  it('resolves explicit file paths and glob patterns', async () => {
    const files = await resolveFiles([path.join(tempDir, '*.ts')], tempDir);
    expect(files.length).toBe(1);
    expect(files[0].replace(/\\/g, '/')).toContain('a.ts');
  });

  it('deduplicates matching files', async () => {
    const files = await resolveFiles([fileA, path.join(tempDir, '*.ts')], tempDir);
    expect(files.length).toBe(1);
  });

  it('throws NO_FILES_MATCHED when no files match', async () => {
    await expect(resolveFiles([path.join(tempDir, '*.rs')], tempDir)).rejects.toThrow(ContextPackError);
  });
});
