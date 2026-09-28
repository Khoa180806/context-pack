# T02 — Context Pack: Specification v0.1 (Draft)

**Canonical ID:** T02  
**Canonical name:** Context Pack  
**npm package:** `ai-context-pack`  
**CLI binary:** `context-pack`, `ai-context-pack`, `cp-tool`  
**Level:** 1★  
**Status:** In Development  
**Time-box:** 1–2 tuần (~10–20 giờ solo builder)  
**Applicable decisions:** D-001, D-003, D-008, D-009, D-011, D-019, D-021, D-023

---

## 1. Objective

### Vấn đề cần giải quyết

Khi AI coding agent nhận một nhiệm vụ (e.g. "Sửa lỗi authentication"), agent thường phải:
1. Tự tìm các file liên quan bằng nhiều tool calls (tốn latency và tokens)
2. Nạp cả file to vào context window (lãng phí tokens vào code không liên quan)
3. Lặp lại việc này cho mỗi session mới (không reuse được)

### Giải pháp

Context Pack tạo ra một **ContextPack artifact** — gói ngữ cảnh có giới hạn, có thể tái sử dụng — chứa chính xác những file/đoạn code phù hợp nhất với nhiệm vụ, trong phạm vi token budget cho phép.

### Người dùng mục tiêu (ICP)

Developer đang dùng AI coding agent (Cursor, Continue, Claude Code, Copilot, etc.) trên các dự án TypeScript/JavaScript hoặc bất kỳ codebase nào.

### Định nghĩa thành công

- Giảm ≥20% token tiêu thụ so với nạp thủ công các file liên quan, với tỷ lệ hoàn thành tác vụ không giảm quá 2pp (D-011)
- Artifact đầu ra có thể đọc máy, tuân thủ common transport envelope (D-008)
- Chạy 100% local, không gửi source code ra ngoài (D-009)

---

## 2. Phạm vi MVP 1★ (Scope)

### IN SCOPE

| Feature | Mô tả |
|---------|-------|
| File-based context selection | Nhận list file/glob pattern, filter file phù hợp với task |
| Token budget enforcement | Đảm bảo tổng token ≤ budget, tự cắt/bỏ phần thừa |
| Relevance ranking | Xếp hạng file theo text similarity đơn giản với task description |
| Line-range slicing | Chỉ lấy đoạn code liên quan (không phải toàn bộ file) |
| ContextPack JSON artifact | Xuất ra artifact chuẩn có thể consume bởi agent/tool khác |
| CLI interface | `context-pack pack`, `--task`, `--files`, `--budget`, `--json`, `--output` |
| SDK/Library API | Export TypeScript function `pack(options): ContextPack` |
| T01 integration | Tương thích với `ai-token-diff` để đo trước/sau |

### OUT OF SCOPE (MVP)

- Semantic embedding / vector search (→ 2★+ evolution)
- AST-aware parsing (→ 3★)
- MCP server endpoint (→ 2★ sau khi CLI stable)
- Remote/cloud mode (→ bị cấm theo D-009 cho đến khi có security spec)
- Multi-repo context (→ 2★+)
- Caching (→ T04 Semantic Cache phụ trách)

---

## 3. Data Structures

### Input: `PackOptions`

```typescript
interface PackOptions {
  task: string;           // Mô tả nhiệm vụ (dùng để rank relevance)
  files: string[];        // List file path hoặc glob patterns
  budget?: number;        // Token budget (default: 4000)
  encoding?: string;      // Tiktoken encoding (default: "cl100k_base")
  maxSliceLines?: number; // Số dòng tối đa mỗi slice (default: 100)
  minRelevance?: number;  // Ngưỡng relevance tối thiểu 0–1 (default: 0)
  outputFile?: string;    // Nếu có, ghi artifact ra file .json này
}
```

### Output: `ContextPack` (Common Transport Envelope)

```typescript
// Root envelope (D-008, D-016, 05_INTEGRATION_SPEC.md)
interface ContextPackEnvelope {
  data: ContextPackData;
  metadata: EnvelopeMetadata;
}

interface EnvelopeMetadata {
  schema_version: "1.0";
  source: "context-pack";
  duration_ms: number;
  truncated: boolean;
  next_cursor: null;       // Reserved for pagination (không dùng ở MVP)
}

interface ContextPackData {
  task: string;
  budget_tokens: number;
  used_tokens: number;
  file_count: number;
  slice_count: number;
  truncated: boolean;
  slices: ContextSlice[];
}

interface ContextSlice {
  file: string;            // Relative path
  start_line: number;      // 1-indexed
  end_line: number;        // 1-indexed, inclusive
  tokens: number;          // Token count của slice này
  relevance_score: number; // 0.0–1.0
  content: string;         // Nội dung đoạn code
}
```

---

## 4. Relevance Strategy (MVP)

MVP dùng **TF-IDF text similarity** đơn giản giữa `task` description và nội dung file:

1. Tokenize task thành keywords (lowercase, split by whitespace/punctuation)
2. Với mỗi file: tính `term_frequency` của keywords trong file content
3. Score = tỷ lệ keywords xuất hiện trong file
4. Sort file theo score giảm dần
5. Slice từng file: lấy đoạn 100 dòng có density cao nhất

> **Lý do không dùng embedding:** MVP phải zero-dependency ngoài `js-tiktoken`. Embedding đòi hỏi model inference, không phù hợp local-first. Sẽ là evolution strategy ở 2★.

---

## 5. CLI Interface

### Commands

```bash
# Main command
context-pack pack \
  --task "Fix the authentication bug in UserService" \
  --files "src/auth/**/*.ts" "src/services/UserService.ts" \
  --budget 4000 \
  --json

# Short form aliases
cp-tool pack -t "Refactor login" -f src/ -b 8000

# Output to file
context-pack pack --task "..." --files src/ --output context.pack.json
```

### Flags

| Flag | Short | Default | Mô tả |
|------|-------|---------|-------|
| `--task <text>` | `-t` | required | Mô tả nhiệm vụ |
| `--files <globs...>` | `-f` | required | File paths hoặc glob patterns |
| `--budget <n>` | `-b` | `4000` | Token budget |
| `--encoding <name>` | | `cl100k_base` | Tiktoken encoding |
| `--min-relevance <n>` | | `0` | Ngưỡng relevance tối thiểu (0–1) |
| `--output <file>` | `-o` | | Ghi artifact ra file |
| `--json` | | false | Xuất JSON thay vì human-readable |
| `--version` | `-V` | | Xem phiên bản |
| `--help` | `-h` | | Xem hướng dẫn |

### Exit codes (theo 05_INTEGRATION_SPEC.md)

| Code | Ý nghĩa |
|------|---------|
| 0 | Thành công |
| 1 | Lỗi chung |
| 2 | Input không hợp lệ |
| 3 | Không tìm thấy file |
| 5 | Thiếu dependency |

### Human-readable output (mặc định)

```
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

## 6. SDK / Library API

```typescript
import { pack, type PackOptions, type ContextPackEnvelope } from 'ai-context-pack';

const result: ContextPackEnvelope = await pack({
  task: 'Fix the authentication bug',
  files: ['src/auth/**/*.ts', 'src/services/UserService.ts'],
  budget: 4000,
});

console.log(result.data.used_tokens); // 1340
console.log(result.data.slices);      // Array of ContextSlice
```

---

## 7. Source Code Structure

```
D:\Project\context_pack\
├── src/
│   ├── index.ts         # Package entry — exports pack(), types
│   ├── cli.ts           # CLI entry — commander setup
│   ├── packer.ts        # Core packing logic
│   ├── ranker.ts        # Relevance ranking (TF-IDF)
│   ├── slicer.ts        # File reading + line-range slicing
│   ├── tokenizer.ts     # Token counting via js-tiktoken
│   ├── formatter.ts     # Human-readable output formatter
│   ├── types.ts         # All TypeScript types/interfaces
│   └── errors.ts        # Error codes + ContextPackError class
├── test/
│   ├── packer.test.ts
│   ├── ranker.test.ts
│   ├── slicer.test.ts
│   ├── tokenizer.test.ts
│   └── cli.test.ts
├── docs/
│   └── SPEC.md          # This file
├── .gitignore
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
└── README.vi.md
```

---

## 8. Error Model

```typescript
type ContextPackErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'BUDGET_TOO_SMALL'    // Budget < minimum viable (< 100 tokens)
  | 'NO_FILES_MATCHED'    // Glob pattern không khớp file nào
  | 'ENCODING_UNSUPPORTED'
  | 'INTERNAL_ERROR';

class ContextPackError extends Error {
  constructor(
    public readonly code: ContextPackErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) { ... }
}
```

JSON error envelope:

```json
{
  "error": {
    "code": "BUDGET_TOO_SMALL",
    "message": "Budget of 50 tokens is below the minimum of 100",
    "details": { "provided": 50, "minimum": 100 }
  },
  "metadata": {
    "schema_version": "1.0"
  }
}
```

---

## 9. Security & Privacy

- **Local-first (D-009):** Mọi xử lý đều diễn ra trên máy local. Không có network call.
- **Path validation:** Không cho phép path traversal (`../` attacks). Chỉ đọc file trong working directory hoặc các path được chỉ định rõ ràng.
- **Không lộ credentials:** Tool result không được log API key, token, hoặc secrets từ `.env`.
- **No remote mode** ở MVP — nếu muốn thêm sau, phải có security spec đầy đủ trước.

---

## 10. Benchmark Plan (D-011)

### Baseline comparison

| Baseline | Mô tả |
|----------|-------|
| B0-manual | Developer/agent nạp thủ công toàn bộ file liên quan |
| B1-raw-glob | Dùng glob để lấy file nhưng không rank, không slice |
| B2-context-pack | Dùng `ai-context-pack` với budget=4000 |

### Task set (MVP benchmark)

5 coding tasks trên 1 TypeScript project (ví dụ: token_diff repo chính nó):

1. "Fix the CLI argument parsing for --encoding flag"
2. "Add error handling for missing input files"
3. "Refactor the tokenizer module to support multiple encodings"
4. "Write tests for the formatter module"
5. "Explain how token counting works in this codebase"

### Metrics

- `input_tokens` khi agent nhận context
- `task_success` (binary: agent hoàn thành đúng không)
- `wall_clock_ms` (thời gian pack)

### Pass threshold (D-011)

Đạt khi so với B0-manual:
- **A.** Giảm ≥20% `input_tokens` mà `task_success` không giảm quá 2pp, HOẶC
- **B.** `task_success` tăng ≥10pp với `input_tokens` tăng ≤20%

---

## 11. Roadmap sau MVP

| Milestone | Feature |
|-----------|---------|
| v0.2 | MCP server endpoint (agent-facing) |
| v0.3 | Embedding-based relevance (local model) |
| v0.4 | Compose với T03 Tool Result Compressor |
| v1.0 | 1★ Stable — all lifecycle criteria met |

---

## 12. Implementation Checklist (1★ Stable criteria)

- [ ] Standalone use (CLI + SDK)
- [ ] Canonical ID `T02` + name `Context Pack`
- [ ] Versioned input/output schema (`schema_version: "1.0"`)
- [ ] Tests (unit + integration)
- [ ] Benchmark results documented
- [ ] Documented failure modes
- [ ] Security/privacy notes
- [ ] Cập nhật `03_TOOL_CATALOG.md` status → `Stable`
- [ ] Cập nhật `06_ROADMAP.md`
- [ ] Ghi decision nếu có thay đổi kiến trúc vào `11_DECISION_LOG.md`
