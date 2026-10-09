import { getEncoding } from 'js-tiktoken';

export type SupportedEncoding = 'cl100k_base' | 'p50k_base' | 'r50k_base' | 'o200k_base';

const VALID_ENCODINGS = new Set<string>([
  'cl100k_base',
  'p50k_base',
  'r50k_base',
  'o200k_base',
]);

// Browser cache for encoder instances
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const encoderCache = new Map<string, any>();

export function getAvailableEncodings(): SupportedEncoding[] {
  return ['cl100k_base', 'o200k_base', 'p50k_base', 'r50k_base'];
}

export function isValidEncoding(encoding: string): encoding is SupportedEncoding {
  return VALID_ENCODINGS.has(encoding);
}

export function countTokens(text: string, encoding: string = 'cl100k_base'): number {
  if (!isValidEncoding(encoding)) {
    throw new Error(
      `Encoding '${encoding}' is not supported. Supported encodings: ${Array.from(VALID_ENCODINGS).join(', ')}`,
    );
  }

  if (!text || text.length === 0) {
    return 0;
  }

  let encoder = encoderCache.get(encoding);
  if (!encoder) {
    encoder = getEncoding(encoding);
    encoderCache.set(encoding, encoder);
  }

  return encoder.encode(text).length;
}
