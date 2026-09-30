import { describe, it, expect } from 'vitest';
import { countTokens, isValidEncoding } from '../src/tokenizer.js';
import { ContextPackError } from '../src/errors.js';

describe('countTokens', () => {
  it('returns 0 for empty string', () => {
    expect(countTokens('', 'cl100k_base')).toBe(0);
  });

  it('counts tokens correctly for a short phrase', () => {
    expect(countTokens('hello world', 'cl100k_base')).toBe(2);
  });

  it('defaults to cl100k_base when encoding is not specified', () => {
    expect(countTokens('hello world')).toBe(2);
  });

  it('counts code tokens accurately', () => {
    const code = 'function add(a: number, b: number): number { return a + b; }';
    expect(countTokens(code)).toBeGreaterThan(5);
  });

  it('throws ContextPackError with ENCODING_UNSUPPORTED on invalid encoding', () => {
    expect(() => countTokens('test', 'unknown_enc')).toThrow(ContextPackError);
    try {
      countTokens('test', 'unknown_enc');
    } catch (err) {
      expect(err).toBeInstanceOf(ContextPackError);
      expect((err as ContextPackError).code).toBe('ENCODING_UNSUPPORTED');
    }
  });
});

describe('isValidEncoding', () => {
  it('returns true for supported encodings', () => {
    expect(isValidEncoding('cl100k_base')).toBe(true);
    expect(isValidEncoding('o200k_base')).toBe(true);
    expect(isValidEncoding('p50k_base')).toBe(true);
    expect(isValidEncoding('r50k_base')).toBe(true);
  });

  it('returns false for unsupported or empty encodings', () => {
    expect(isValidEncoding('unknown_enc')).toBe(false);
    expect(isValidEncoding('')).toBe(false);
  });
});
