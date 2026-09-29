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
  /** Mô tả nhiệm vụ — dùng để rank relevance của từng file. */
  task: string;

  /** Danh sách file paths hoặc glob patterns. */
  files: string[];

  /**
   * Token budget tối đa.
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
   * Số dòng tối đa mỗi slice.
   * @default 100
   */
  maxSliceLines?: number;

  /**
   * Ngưỡng relevance tối thiểu (0–1). File có score thấp hơn bị bỏ qua.
   * @default 0
   */
  minRelevance?: number;

  /** Nếu có, ghi ContextPackEnvelope ra file JSON này. */
  outputFile?: string;
}

// ---------------------------------------------------------------------------
// Output — Data layer
// ---------------------------------------------------------------------------

/** Một đoạn (slice) ngữ cảnh trích xuất từ file. */
export interface ContextSlice {
  /** Path tương đối tới file. */
  file: string;

  /** Dòng bắt đầu (1-indexed, inclusive). */
  start_line: number;

  /** Dòng kết thúc (1-indexed, inclusive). */
  end_line: number;

  /** Số token trong slice này. */
  tokens: number;

  /** Điểm liên quan (0.0–1.0). */
  relevance_score: number;

  /** Nội dung đoạn code. */
  content: string;
}

/** Phần data chính của ContextPackEnvelope. */
export interface ContextPackData {
  task: string;
  budget_tokens: number;
  used_tokens: number;
  file_count: number;
  slice_count: number;
  /** True nếu một số file/slices bị bỏ do vượt budget. */
  truncated: boolean;
  /** Danh sách slices, sort theo relevance_score giảm dần. */
  slices: ContextSlice[];
}

// ---------------------------------------------------------------------------
// Output — Transport envelope (docs/05_INTEGRATION_SPEC.md)
// ---------------------------------------------------------------------------

/** Metadata chuẩn của common transport envelope. */
export interface EnvelopeMetadata {
  schema_version: '1.0';
  source: 'context-pack';
  duration_ms: number;
  truncated: boolean;
  /** Reserved cho pagination — luôn null ở MVP. */
  next_cursor: null;
}

/** Common transport envelope — đầu ra chuẩn của Context Pack. */
export interface ContextPackEnvelope {
  data: ContextPackData;
  metadata: EnvelopeMetadata;
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/** Tất cả error codes của Context Pack. */
export type ContextPackErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'BUDGET_TOO_SMALL'
  | 'NO_FILES_MATCHED'
  | 'ENCODING_UNSUPPORTED'
  | 'INTERNAL_ERROR';
