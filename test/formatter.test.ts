import { describe, it, expect } from 'vitest';
import { formatResult, stripAnsi } from '../src/formatter.js';
import type { ContextPackEnvelope } from '../src/types.js';

describe('formatResult', () => {
  const sampleEnvelope: ContextPackEnvelope = {
    data: {
      task: 'Fix authentication bug in UserService',
      budget_tokens: 4000,
      used_tokens: 1340,
      file_count: 3,
      slice_count: 3,
      truncated: false,
      slices: [
        {
          file: 'src/auth/handler.ts',
          start_line: 10,
          end_line: 45,
          tokens: 320,
          relevance_score: 0.91,
          content: 'export const authHandler = () => {};',
        },
        {
          file: 'src/services/UserService.ts',
          start_line: 1,
          end_line: 80,
          tokens: 640,
          relevance_score: 0.88,
          content: 'export class UserService {}',
        },
        {
          file: 'src/auth/middleware.ts',
          start_line: 15,
          end_line: 60,
          tokens: 380,
          relevance_score: 0.72,
          content: 'export const authMiddleware = () => {};',
        },
      ],
    },
    metadata: {
      schema_version: '1.0',
      source: 'context-pack',
      duration_ms: 43,
      truncated: false,
      next_cursor: null,
    },
  };

  it('renders header with task, tool title, and token budget', () => {
    const rawOutput = formatResult(sampleEnvelope);
    const output = stripAnsi(rawOutput);

    expect(output).toContain('Context Pack');
    expect(output).toContain('Task: Fix authentication bug in UserService');
    expect(output).toContain('Budget: 4000 tokens');
  });

  it('renders slice entries with line ranges, tokens, and relevance scores', () => {
    const rawOutput = formatResult(sampleEnvelope);
    const output = stripAnsi(rawOutput);

    expect(output).toContain('src/auth/handler.ts');
    expect(output).toContain('10–45');
    expect(output).toContain('320 tokens');
    expect(output).toContain('score: 0.91');

    expect(output).toContain('src/services/UserService.ts');
    expect(output).toContain('1–80');
    expect(output).toContain('640 tokens');
    expect(output).toContain('score: 0.88');
  });

  it('renders total summary metrics, file counts, and duration', () => {
    const rawOutput = formatResult(sampleEnvelope);
    const output = stripAnsi(rawOutput);

    expect(output).toContain('1340 / 4000 tokens');
    expect(output).toContain('3 slices from 3 files');
    expect(output).toContain('43ms');
  });

  it('indicates truncation warning in summary if truncated is true', () => {
    const truncatedEnvelope: ContextPackEnvelope = {
      ...sampleEnvelope,
      data: {
        ...sampleEnvelope.data,
        truncated: true,
      },
      metadata: {
        ...sampleEnvelope.metadata,
        truncated: true,
      },
    };

    const rawOutput = formatResult(truncatedEnvelope);
    const output = stripAnsi(rawOutput);
    expect(output).toContain('[TRUNCATED]');
  });

  it('renders clean fallback when slices array is empty', () => {
    const emptyEnvelope: ContextPackEnvelope = {
      data: {
        task: 'Empty task',
        budget_tokens: 1000,
        used_tokens: 0,
        file_count: 0,
        slice_count: 0,
        truncated: false,
        slices: [],
      },
      metadata: {
        schema_version: '1.0',
        source: 'context-pack',
        duration_ms: 10,
        truncated: false,
        next_cursor: null,
      },
    };

    const rawOutput = formatResult(emptyEnvelope);
    const output = stripAnsi(rawOutput);
    expect(output).toContain('No matching context slices extracted');
    expect(output).toContain('0 / 1000 tokens');
  });
});
