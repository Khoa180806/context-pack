# T02 — Context Pack: Technical Specification

**Canonical ID:** T02  
**Canonical Name:** Context Pack  
**npm Package:** `ai-context-pack`  
**CLI Binaries:** `context-pack`, `ai-context-pack`, `cp-tool`  
**Level:** 1★  
**Status:** Stable  
**Time-Box:** 1–2 weeks (~10–20 builder hours)  
**Applicable Decisions:** D-001, D-003, D-008, D-009, D-011, D-019, D-021, D-023 (see [Decision Log](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/11_DECISION_LOG.md))

---

## 1. Objective

### Problem Statement

When an AI coding agent undertakes a development task (e.g., "Fix authentication session invalidation in UserService"), the agent typically:
1. Manually searches and navigates through numerous files across multiple tool calls, consuming high round-trip latency and token overhead.
2. Ingests entire raw files into the LLM context window, diluting attention and exhausting token budgets on unrelated logic.
3. Repeats this discovery and context-loading cycle for each fresh agent session without reusability.

### Proposed Solution

Context Pack generates a bounded, token-budgeted, reusable **ContextPack artifact** containing only the most relevant slices of source code for a specific agent task under an explicit token ceiling.

### Target ICP (Ideal Customer Profile)

Developers and software engineers using autonomous AI coding agents (e.g., Cursor, Continue, Claude Code, Copilot) on TypeScript/JavaScript codebases or polyglot repositories.

### Success Criteria

- Reduces total prompt context token consumption by ≥20% compared to full-file ingestion baselines while maintaining task completion within a 2 percentage point margin (D-011 in [Decision Log](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/11_DECISION_LOG.md)).
- Produces a machine-readable transport envelope conforming strictly to [Integration Spec](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/05_INTEGRATION_SPEC.md).
- Operates 100% locally with zero external network transmission of proprietary source code (D-009).

---

## 2. 1★ MVP Scope

### In Scope

| Capability | Description |
|---|---|
| File-Based Context Selection | Accepts target file paths and glob patterns, resolving matching source files |
| Token Budget Enforcement | Guarantees cumulative token count ≤ budget by truncating lower-ranked items |
| Relevance Ranking | Ranks candidates using deterministic TF-IDF term frequency against the task brief |
| Line-Range Slicing | Extracts high-density code windows instead of entire files |
| ContextPack JSON Artifact | Emits standard envelopes consumed programmatically by agents and pipelines |
| CLI Interface | `context-pack pack`, supporting `--task`, `--files`, `--budget`, `--json`, `--output` |
| SDK / Library API | Exports typed programmatic entry points `pack(options): Promise<ContextPackEnvelope>` |
| Ecosystem Composition | Composes with `token-diff` (`ai-token-diff`) for deterministic before/after verification |

### Out of Scope (1★ MVP)

- Dense semantic vector embeddings (deferred to 2★+ evolution)
- Full AST dependency graph parsing (deferred to 3★ foundation)
- Dedicated MCP daemon server (scheduled for 2★ once CLI stabilizes)
- Remote cloud storage or telemetry (prohibited by D-009 without formal security specifications)
- Multi-repository workspace federation (deferred to 2★+)
- Response caching layer (delegated to T04 Semantic Cache)

---

## 3. Data Structures & Contracts

### Input: `PackOptions`

```typescript
export interface PackOptions {
  task: string;
  files: string[];
  budget?: number;        // default: 4000
  encoding?: string;      // default: "cl100k_base"
  maxSliceLines?: number; // default: 100
  minRelevance?: number;  // default: 0
  outputFile?: string;
}
```

### Output: `ContextPackEnvelope`

Conforms to the standardized envelope specification in [Integration Spec](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/05_INTEGRATION_SPEC.md).

```typescript
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
```

---

## 4. Relevance & Slicing Strategy (MVP)

The 1★ implementation employs a deterministic, zero-dependency **TF-IDF Keyword Relevance Model**:

1. **Task Tokenization**: Normalizes task prompt into lowercase keyword tokens, pruning common English stop words and punctuation.
2. **Frequency Scoring**: Evaluates term frequency and occurrence density across candidate source files.
3. **Relevance Ranking**: Computes a normalized relevance score ($0.0 \le \text{score} \le 1.0$) per file, sorting candidates in descending order.
4. **Window Slicing**: Identifies the code segment with the highest keyword match density (bounded by `maxSliceLines`).
5. **Greedy Budget Packing**: Sequentially appends ranked slices until appending another slice would exceed `budget_tokens`. Slices exceeding the budget are omitted, marking `truncated: true`.

---

## 5. CLI Interface

### Command Usage

```bash
# Ultra-short invocation (cx alias + direct flags)
cx -t "Fix the authentication bug in UserService" -f "src/auth/**/*.ts" "src/services/UserService.ts" -b 4000 --json

# Standard binary invocation
context-pack pack --task "Fix auth bug" --files src/ --output context.pack.json

# Short aliases available: `cx`, `cpack`, `context-pack`, `ai-context-pack`
```

### Command Flags

| Flag | Short | Default | Description |
|---|---|---|---|
| `--task <text>` | `-t` | required | Task instruction / prompt description |
| `--files <globs...>` | `-f` | required | Target file paths or glob patterns |
| `--budget <n>` | `-b` | `4000` | Maximum token ceiling |
| `--encoding <name>` | | `cl100k_base` | Tiktoken tokenizer encoding |
| `--min-relevance <n>` | | `0` | Minimum score threshold (0.0–1.0) |
| `--output <file>` | `-o` | | Write envelope payload to designated JSON path |
| `--json` | | `false` | Emit machine-readable JSON to stdout |
| `--version` | `-V` | | Output binary version |
| `--help` | `-h` | | Display command usage and documentation |

### Exit Codes

Conforms to [Integration Spec](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/05_INTEGRATION_SPEC.md):

| Exit Code | Identifier | Description |
|---|---|---|
| `0` | Success | Operation completed successfully |
| `1` | General Failure | Internal runtime or unexpected error |
| `2` | Invalid Input | Malformed arguments or budget below threshold |
| `3` | Not Found | Target file or glob pattern matched zero files |
| `4` | Permission Denied | Filesystem access restricted |
| `5` | Dependency Unavailable | Required tokenizer or module failed to initialize |

### Terminal Output Preview (Human-Readable)

```text
Context Pack — T02
Task: Fix the authentication bug in UserService
Budget: 4000 tokens

  ✓ src/auth/handler.ts (lines 10–45)      320 tokens  score: 0.91
  ✓ src/services/UserService.ts (1–80)      640 tokens  score: 0.88
  ✓ src/auth/middleware.ts (15–60)          380 tokens  score: 0.72
  ─ src/utils/logger.ts                     skipped     score: 0.05

Total: 1340 / 4000 tokens  |  3 slices from 3 files  |  43ms
```

---

## 6. Programmatic SDK Usage

```typescript
import { pack, type PackOptions, type ContextPackEnvelope } from 'ai-context-pack';

const result: ContextPackEnvelope = await pack({
  task: 'Fix authentication session invalidation',
  files: ['src/auth/**/*.ts', 'src/services/UserService.ts'],
  budget: 4000,
});

console.log(`Used tokens: ${result.data.used_tokens}`);
console.log(`Slices extracted: ${result.data.slices.length}`);
```

---

## 7. Project Architecture & Directory Layout

```text
context_pack/
├── src/
│   ├── index.ts         # Public SDK export entry point
│   ├── cli.ts           # Commander CLI registration & execution
│   ├── packer.ts        # Orchestrator: resolve -> rank -> slice -> budget
│   ├── ranker.ts        # TF-IDF keyword relevance evaluation
│   ├── slicer.ts        # Filesystem resolver & line-window slicing
│   ├── tokenizer.ts     # Token counting engine via js-tiktoken
│   ├── formatter.ts     # Terminal ANSI tabular output formatter
│   ├── types.ts         # TypeScript interfaces & domain models
│   └── errors.ts        # Error codes & ContextPackError hierarchy
├── test/
│   ├── packer.test.ts
│   ├── ranker.test.ts
│   ├── slicer.test.ts
│   ├── tokenizer.test.ts
│   └── cli.test.ts
├── docs/
│   └── SPEC.md          # Technical specification
├── .gitignore
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
└── README.vi.md
```

---

## 8. Deterministic Error Model

```typescript
export type ContextPackErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'BUDGET_TOO_SMALL'
  | 'NO_FILES_MATCHED'
  | 'ENCODING_UNSUPPORTED'
  | 'INTERNAL_ERROR';

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
    Object.setPrototypeOf(this, ContextPackError.prototype);
  }

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
```

---

## 9. Security & Privacy Policy

- **Local-First Processing (D-009)**: All scanning, tokenization, and slicing occur in-process in memory. Zero external network calls.
- **Path Traversal Protection**: Rejects unauthorized relative path escapes (`../`) outside the intended workspace boundaries.
- **Secret Sanitization**: Scans and excludes common secret files (`.env`, `id_rsa`, certificates) from context packing.

---

## 10. Benchmark & Validation Plan

Aligned with [Benchmark Plan](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/10_BENCHMARK_PLAN.md).

### Baselines

| Baseline | Strategy |
|---|---|
| B0 (Unassisted) | Full-file ingestion without ranking or windowing |
| B1 (Raw Glob) | File-level ingestion matching globs without token budget enforcement |
| B2 (Ecosystem Prototype) | `ai-context-pack` with budget constraint (4,000 tokens) |

### Test Workload (5 Benchmark Tasks)

1. "Fix the CLI argument parsing for --encoding flag"
2. "Add error handling for missing input files"
3. "Refactor the tokenizer module to support multiple encodings"
4. "Write tests for the formatter module"
5. "Explain how token counting works in this codebase"

### Evaluation Metrics

- `input_tokens`: Cumulative prompt tokens dispatched to the agent.
- `task_success`: Verified task resolution without regression.
- `wall_clock_ms`: Execution latency of context generation.

### Pass Thresholds (D-011)

- **Condition A**: $\ge 20\%$ prompt token reduction vs. B0 with task completion degradation $\le 2\text{pp}$, OR
- **Condition B**: $\ge 10\text{pp}$ task success improvement with token expansion $\le 20\%$.

---

## 11. Post-MVP Roadmap

| Phase | Milestone | Focus |
|---|---|---|
| v0.2 | MCP Adapter | Expose tool endpoint for agent orchestration |
| v0.3 | Local Embeddings | Semantic embedding similarity fallback |
| v0.4 | Pipeline Composition | Native composition with T03 Tool Result Compressor |
| v1.0 | 1★ Stable Promotion | Full verification against [Tool Lifecycle](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/04_TOOL_LIFECYCLE.md) |

---

## 12. 1★ Stable Promotion Checklist

- [x] Standalone CLI and SDK interfaces functional
- [x] Canonical naming and ID verified against [Tool Catalog](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/03_TOOL_CATALOG.md)
- [x] Envelope payload verified against [Integration Spec](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/05_INTEGRATION_SPEC.md)
- [x] 100% unit and integration test pass rate (42/42 tests passed)
- [x] Benchmark results documented with measurable token savings (-75.2% average reduction)
- [x] Documented error states and failure modes
- [x] Security boundaries audited (local-first in-memory execution)
- [x] Update [Tool Catalog](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/03_TOOL_CATALOG.md) status to `Stable`
- [x] Update [Roadmap](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/06_ROADMAP.md)
- [x] Record promotion in [Changelog](https://github.com/Khoa180806/AI_Developer_Tool_Ecosystem/tree/master/docs/CHANGELOG.md)
