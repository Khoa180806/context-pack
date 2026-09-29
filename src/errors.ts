import type { ContextPackErrorCode } from './types.js';

/**
 * T02 — Context Pack
 * Custom error class + exit code mapping.
 */
export class ContextPackError extends Error {
  readonly code: ContextPackErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ContextPackErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ContextPackError';
    this.code = code;
    this.details = details;
    // Ensure correct prototype chain when extending Error in TypeScript
    Object.setPrototypeOf(this, ContextPackError.prototype);
  }

  /** Convert error to JSON envelope (docs/05_INTEGRATION_SPEC.md). */
  toEnvelope(): object {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
      metadata: {
        schema_version: '1.0',
      },
    };
  }
}

/** ContextPackErrorCode → CLI exit code (docs/05_INTEGRATION_SPEC.md). */
export const ERROR_EXIT_CODES: Record<ContextPackErrorCode, number> = {
  INVALID_INPUT: 2,
  NOT_FOUND: 3,
  PERMISSION_DENIED: 4,
  BUDGET_TOO_SMALL: 2,
  NO_FILES_MATCHED: 3,
  ENCODING_UNSUPPORTED: 1,
  INTERNAL_ERROR: 1,
};
