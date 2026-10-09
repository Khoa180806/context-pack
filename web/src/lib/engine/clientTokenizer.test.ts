import { describe, it, expect } from 'vitest';
import { countTokens, isValidEncoding, getAvailableEncodings } from './clientTokenizer';

describe('clientTokenizer', () => {
  it('validates supported encodings correctly', () => {
    expect(isValidEncoding('cl100k_base')).toBe(true);
    expect(isValidEncoding('o200k_base')).toBe(true);
    expect(isValidEncoding('p50k_base')).toBe(true);
    expect(isValidEncoding('invalid_encoding')).toBe(false);
    expect(getAvailableEncodings()).toContain('cl100k_base');
  });

  it('counts 0 tokens for empty string', () => {
    expect(countTokens('', 'cl100k_base')).toBe(0);
  });

  it('counts tokens accurately for standard text across encodings', () => {
    const text = 'Hello world! This is a test for Context Pack token counting.';
    const cl100kCount = countTokens(text, 'cl100k_base');
    expect(cl100kCount).toBeGreaterThan(5);
    expect(cl100kCount).toBeLessThan(20);

    const o200kCount = countTokens(text, 'o200k_base');
    expect(o200kCount).toBeGreaterThan(5);
  });

  it('handles Vietnamese text with Unicode properly', () => {
    const viText = 'Hệ thống đóng gói mã nguồn và tối ưu hóa context cho AI agents';
    const count = countTokens(viText, 'cl100k_base');
    expect(count).toBeGreaterThan(10);
  });

  it('throws error on unsupported encoding', () => {
    expect(() => countTokens('test', 'unknown_encoding')).toThrow();
  });
});
