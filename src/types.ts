/**
 * T02 — Context Pack
 * Core TypeScript types and interfaces.
 *
 * Schema version: 1.0
 * Follows common transport envelope: docs/05_INTEGRATION_SPEC.md
 */

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

/** Options passed to the pack() function or CLI. */
export interface PackOptions {
  /** Task description — used to rank file relevance. */
  task: string;

  /** List of file paths or glob patterns. */
  files: string[];

  /**
   * Maximum token budget.
   * @default 4000
   * @minimum 100
   */
  budget?: number;

  /**
   * Tiktoken encoding name.
   * @default "cl100k_base"
   */
  encoding?: string;

  /**
   * Maximum lines per slice.
   * @default 100
   */
  maxSliceLines?: number;

  /**
   * Minimum relevance threshold (0–1). Files below this score are skipped.
   * @default 0
   */
  minRelevance?: number;

  /** If set, write the ContextPackEnvelope to this JSON file. */
  outputFile?: string;
}

// ---------------------------------------------------------------------------
// Output — Data layer
// ---------------------------------------------------------------------------

/** A context slice extracted from a source file. */
export interface ContextSlice {
  /** Relative path to the file. */
  file: string;

  /** Start line (1-indexed, inclusive). */
  start_line: number;

  /** End line (1-indexed, inclusive). */
  end_line: number;

  /** Token count for this slice. */
  tokens: number;

  /** Relevance score (0.0–1.0). */
  relevance_score: number;

  /** Actual code content of the slice. */
  content: string;
}

/** Main data payload of the ContextPackEnvelope. */
export interface ContextPackData {
  task: string;
  budget_tokens: number;
  used_tokens: number;
  file_count: number;
  slice_count: number;
  /** True if some files/slices were dropped due to budget overflow. */
  truncated: boolean;
  /** List of slices, sorted by relevance_score descending. */
  slices: ContextSlice[];
}

// ---------------------------------------------------------------------------
// Output — Transport envelope (docs/05_INTEGRATION_SPEC.md)
// ---------------------------------------------------------------------------

/** Standard metadata for the common transport envelope. */
export interface EnvelopeMetadata {
  schema_version: '1.0';
  source: 'context-pack';
  duration_ms: number;
  truncated: boolean;
  /** Reserved for pagination — always null in MVP. */
  next_cursor: null;
}

/** Common transport envelope — standard output of Context Pack. */
export interface ContextPackEnvelope {
  data: ContextPackData;
  metadata: EnvelopeMetadata;
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/** All error codes for Context Pack. */
export type ContextPackErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'BUDGET_TOO_SMALL'
  | 'NO_FILES_MATCHED'
  | 'ENCODING_UNSUPPORTED'
  | 'INTERNAL_ERROR';
