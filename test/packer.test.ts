import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pack } from '../src/packer.js';
import { ContextPackError } from '../src/errors.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('pack orchestrator', () => {
  let tempDir: string;
  let fileA: string;
  let fileB: string;
  let fileC: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-packer-test-'));

    fileA = path.join(tempDir, 'UserService.ts');
    fileB = path.join(tempDir, 'AuthController.ts');
    fileC = path.join(tempDir, 'Logger.ts');

    fs.writeFileSync(
      fileA,
      `export class UserService {\n  findUser(id: string) {\n    return { id, name: 'Alice' };\n  }\n  login(credentials: any) {\n    return true;\n  }\n}`,
      'utf-8',
    );

    fs.writeFileSync(
      fileB,
      `export class AuthController {\n  handleLogin() {\n    // authentication endpoint\n    return 'ok';\n  }\n}`,
      'utf-8',
    );

    fs.writeFileSync(
      fileC,
      `export const logger = (msg: string) => console.log(msg);\n`.repeat(20),
      'utf-8',
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('validates budget threshold and throws BUDGET_TOO_SMALL when < 100', async () => {
    await expect(
      pack({
        task: 'Login logic',
        files: [fileA],
        budget: 50,
      }),
    ).rejects.toThrow(ContextPackError);

    try {
      await pack({ task: 'Login', files: [fileA], budget: 50 });
    } catch (err: any) {
      expect(err.code).toBe('BUDGET_TOO_SMALL');
    }
  });

  it('throws INVALID_INPUT when task or files are missing', async () => {
    await expect(pack({ task: '', files: [fileA] })).rejects.toThrow(ContextPackError);
    await expect(pack({ task: 'Task', files: [] })).rejects.toThrow(ContextPackError);
  });

  it('produces valid ContextPackEnvelope conforming to integration spec', async () => {
    const res = await pack({
      task: 'Fix login and authentication in UserService',
      files: [fileA, fileB, fileC],
      budget: 1000,
    });

    // Check transport envelope metadata
    expect(res.metadata.schema_version).toBe('1.0');
    expect(res.metadata.source).toBe('context-pack');
    expect(typeof res.metadata.duration_ms).toBe('number');
    expect(res.metadata.next_cursor).toBeNull();

    // Check data payload
    expect(res.data.task).toBe('Fix login and authentication in UserService');
    expect(res.data.budget_tokens).toBe(1000);
    expect(res.data.used_tokens).toBeGreaterThan(0);
    expect(res.data.used_tokens).toBeLessThanOrEqual(1000);
    expect(res.data.slices.length).toBeGreaterThan(0);

    // Verify ordering by relevance score
    for (let i = 1; i < res.data.slices.length; i++) {
      expect(res.data.slices[i - 1].relevance_score).toBeGreaterThanOrEqual(
        res.data.slices[i].relevance_score,
      );
    }
  });

  it('enforces token budget and sets truncated to true when budget is tight', async () => {
    const res = await pack({
      task: 'Logger logic',
      files: [fileA, fileB, fileC],
      budget: 150, // Low budget to force truncation
    });

    expect(res.data.used_tokens).toBeLessThanOrEqual(150);
    expect(res.data.truncated).toBe(true);
    expect(res.metadata.truncated).toBe(true);
  });

  it('writes output artifact to JSON file when outputFile option is provided', async () => {
    const outFile = path.join(tempDir, 'output.pack.json');
    await pack({
      task: 'Login',
      files: [fileA],
      budget: 500,
      outputFile: outFile,
    });

    expect(fs.existsSync(outFile)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
    expect(parsed.data.task).toBe('Login');
    expect(parsed.metadata.schema_version).toBe('1.0');
  });
});
