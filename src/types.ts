export interface PackOptions {
  task: string;
  files: string[];
  budget?: number;
  encoding?: string;
  maxSliceLines?: number;
  minRelevance?: number;
  outputFile?: string;
}

export interface ContextSlice {
  file: string;
  start_line: number;
  end_line: number;
  tokens: number;
  relevance_score: number;
  content: string;
}

export interface ContextPackData {
  task: string;
  budget_tokens: number;
  used_tokens: number;
  file_count: number;
  slice_count: number;
  truncated: boolean;
  slices: ContextSlice[];
}

export interface EnvelopeMetadata {
  schema_version: '1.0';
  source: 'context-pack';
  duration_ms: number;
  truncated: boolean;
  next_cursor: null;
}

export interface ContextPackEnvelope {
  data: ContextPackData;
  metadata: EnvelopeMetadata;
}

export type ContextPackErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'BUDGET_TOO_SMALL'
  | 'NO_FILES_MATCHED'
  | 'ENCODING_UNSUPPORTED'
  | 'INTERNAL_ERROR';
