import { describe, it, expect } from 'vitest';
import { sliceContentLines, packVirtualFiles } from './clientPacker';
import type { VirtualFile } from '@/types/playground';

describe('clientPacker', () => {
  it('slices content by line numbers correctly', () => {
    const code = `line 1\nline 2\nline 3\nline 4\nline 5`;
    const slice = sliceContentLines(code, 2, 4);
    expect(slice.startLine).toBe(2);
    expect(slice.endLine).toBe(4);
    expect(slice.content).toBe(`line 2\nline 3\nline 4`);
  });

  it('packs files within given token budget and prioritizes high-relevance files', () => {
    const files: VirtualFile[] = [
      {
        name: 'src/auth/session.ts',
        content: `// Authentication session manager\nexport function validateToken(token: string) {\n  return token.length > 10;\n}`,
      },
      {
        name: 'src/utils/math.ts',
        content: `// Math utilities\nexport function sum(a: number, b: number) {\n  return a + b;\n}`,
      },
      {
        name: 'src/db/user.ts',
        content: `// User DB model\nexport interface User {\n  id: string;\n  name: string;\n}`,
      },
    ];

    const envelope = packVirtualFiles({
      task: 'Fix auth token validation logic',
      files,
      budget: 1000,
      encoding: 'cl100k_base',
      maxSliceLines: 50,
    });

    expect(envelope.data.task).toBe('Fix auth token validation logic');
    expect(envelope.data.budget_tokens).toBe(1000);
    expect(envelope.data.used_tokens).toBeGreaterThan(0);
    expect(envelope.data.used_tokens).toBeLessThanOrEqual(1000);
    expect(envelope.data.slices.length).toBeGreaterThanOrEqual(1);
    expect(envelope.data.slices[0].file).toBe('src/auth/session.ts');
    expect(envelope.metadata.source).toBe('context-pack-web');
  });

  it('marks truncated when budget is exceeded by additional candidates', () => {
    const files: VirtualFile[] = [
      {
        name: 'file1.ts',
        content: 'const a = ' + JSON.stringify(Array(80).fill('alpha')) + ';',
      },
      {
        name: 'file2.ts',
        content: 'const b = ' + JSON.stringify(Array(80).fill('beta')) + ';',
      },
    ];

    const envelope = packVirtualFiles({
      task: 'alpha beta check',
      files,
      budget: 120, // Small budget that can only fit one slice
      encoding: 'cl100k_base',
    });

    expect(envelope.data.used_tokens).toBeLessThanOrEqual(120);
    expect(envelope.data.truncated).toBe(true);
    expect(envelope.metadata.truncated).toBe(true);
  });

  it('throws error when budget is below 100 tokens', () => {
    expect(() =>
      packVirtualFiles({
        task: 'test',
        files: [{ name: 'test.ts', content: 'test' }],
        budget: 50,
      }),
    ).toThrow(/minimum/i);
  });
});
