import { getEncoding } from 'js-tiktoken';
import { ContextPackError } from './errors.js';

const VALID_ENCODINGS = new Set(['cl100k_base', 'p50k_base', 'r50k_base', 'o200k_base']);
// Cache encoder instances for performance
const encoderCache = new Map<string, ReturnType<typeof getEncoding>>();

export function isValidEncoding(encoding: string): boolean {
  return VALID_ENCODINGS.has(encoding);
}

export function countTokens(text: string, encoding = 'cl100k_base'): number {
  if (!isValidEncoding(encoding)) {
    throw new ContextPackError(
      'ENCODING_UNSUPPORTED',
      `Encoding '${encoding}' is not supported. Valid encodings: ${[...VALID_ENCODINGS].join(', ')}`,
      { encoding, valid: [...VALID_ENCODINGS] },
    );
  }

  if (text.length === 0) return 0;

  let encoder = encoderCache.get(encoding);
  if (!encoder) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encoder = getEncoding(encoding as any);
    encoderCache.set(encoding, encoder);
  }

  return encoder.encode(text).length;
}
