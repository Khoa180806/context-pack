export interface VirtualFile {
  name: string;
  content: string;
  language?: string;
  tokens?: number;
}

export interface ClientContextSlice {
  file: string;
  start_line: number;
  end_line: number;
  tokens: number;
  relevance_score: number;
  content: string;
}

export interface ClientContextPackData {
  task: string;
  budget_tokens: number;
  used_tokens: number;
  file_count: number;
  slice_count: number;
  truncated: boolean;
  slices: ClientContextSlice[];
}

export interface ClientEnvelopeMetadata {
  schema_version: '1.0';
  source: 'context-pack-web';
  duration_ms: number;
  truncated: boolean;
  next_cursor: null;
}

export interface ClientContextPackEnvelope {
  data: ClientContextPackData;
  metadata: ClientEnvelopeMetadata;
}

export interface ClientPackOptions {
  task: string;
  files: VirtualFile[];
  budget?: number;
  encoding?: string;
  maxSliceLines?: number;
  minRelevance?: number;
}

export interface PresetScenario {
  id: string;
  title: {
    en: string;
    vi: string;
  };
  description: {
    en: string;
    vi: string;
  };
  task: {
    en: string;
    vi: string;
  };
  recommendedBudget: number;
  files: VirtualFile[];
}
