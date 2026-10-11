# API Reference & Specification

This document provides the complete technical specification for Context Pack, covering the TypeScript SDK programmatic interface, Command-Line Interface (CLI) arguments, and the Common Transport Envelope JSON schema.

---

## 1. Programmatic TypeScript SDK

The core library is distributed as an ESM package `ai-context-pack`.

### `pack(options: PackOptions): Promise<ContextPackEnvelope>`

Executes the four-stage context packaging pipeline.

```typescript
import { pack, type PackOptions, type ContextPackEnvelope } from 'ai-context-pack';

const result: ContextPackEnvelope = await pack({
  task: 'Fix authentication session bug and token expiry',
  files: ['src/**/*.ts', 'lib/**/*.js'],
  budget: 2000,
  encoding: 'cl100k_base',
  maxSliceLines: 100,
  minRelevance: 0.1,
  outputFile: './context.json', // optional
});
```

*(source: `src/packer.ts:13-107`, `src/index.ts:1-7`)*

### Input Parameters (`PackOptions`)

| Option | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `task` | `string` | **Yes** | — | Natural language task description or prompt brief. |
| `files` | `string[]` | **Yes** | — | Array of file paths or glob patterns (e.g. `['src/**/*.ts']`). |
| `budget` | `number` | No | `4000` | Strict token budget ceiling. Must be $\ge 100$. |
| `encoding` | `string` | No | `'cl100k_base'` | BPE tokenizer encoding (`cl100k_base`, `o200k_base`, `p50k_base`, `r50k_base`). |
| `maxSliceLines` | `number` | No | `100` | Maximum continuous lines extracted per candidate file. |
| `minRelevance` | `number` | No | `0` | Score threshold ($0.0 \dots 1.0$) below which files are excluded. |
| `outputFile` | `string` | No | `undefined` | Optional destination path to persist JSON envelope artifact. |

*(source: `src/types.ts:1-9`)*

---

## 2. Utility API Functions

Context Pack exports utility helpers directly from `ai-context-pack`:

```typescript
// Token counting
import { countTokens, isValidEncoding } from 'ai-context-pack';
const tokenCount = countTokens('export function test() {}', 'cl100k_base'); // returns number

// Task-Aware line slicing
import { sliceRelevantLines, sliceLines } from 'ai-context-pack';
const slice = sliceRelevantLines(fileContent, 'Fix token expiry', 100);
// returns { content: string, startLine: number, endLine: number }

// Keyword ranking
import { rankFiles, extractKeywords, scoreFileRelevance } from 'ai-context-pack';
const ranked = rankFiles([{ file: 'a.ts', content: '...' }], 'Fix token bug');

// Terminal formatting
import { formatResult, stripAnsi } from 'ai-context-pack';
const terminalText = formatResult(envelope);
```

*(source: `src/index.ts:1-7`, `src/tokenizer.ts`, `src/slicer.ts`, `src/ranker.ts`, `src/formatter.ts`)*

---

## 3. Command-Line Interface (CLI)

The CLI binary is registered under aliases `cx`, `cpack`, `context-pack`, and `ai-context-pack`.

### Syntax

```bash
cx [options]
cx pack [options]
```

### Options & Flags

| Flag | Shorthand | Type | Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `--task <text>` | `-t` | `string` | **Required** | Task instruction or prompt description. |
| `--files <globs...>` | `-f` | `string[]` | **Required** | File paths, globs, or comma-separated lists. |
| `--budget <number>` | `-b` | `number` | `4000` | Maximum token ceiling ($\ge 100$). |
| `--encoding <name>` | — | `string` | `cl100k_base` | Tiktoken BPE encoding name. |
| `--max-slice-lines <number>` | — | `number` | `100` | Maximum line window per slice. |
| `--min-relevance <number>` | — | `number` | `0` | Minimum score threshold ($0.0 \dots 1.0$). |
| `--output <file>` | `-o` | `string` | `undefined` | Output file path to write JSON envelope. |
| `--json` | — | `boolean` | `false` | Emit machine-readable JSON to stdout instead of terminal view. |
| `--version` | `-V` | — | — | Print version number and exit. |
| `--help` | `-h` | — | — | Display help flags and exit. |

*(source: `src/cli.ts:95-121`)*

---

## 4. Common Transport Envelope Schema

Context Pack outputs payload adhering to the standard integration envelope format:

```json
{
  "data": {
    "task": "Task description",
    "budget_tokens": 2000,
    "used_tokens": 1518,
    "file_count": 2,
    "slice_count": 2,
    "truncated": false,
    "slices": [
      {
        "file": "src/slicer.ts",
        "start_line": 4,
        "end_line": 103,
        "tokens": 802,
        "relevance_score": 0.62,
        "content": "// ... source code lines ..."
      }
    ]
  },
  "metadata": {
    "schema_version": "1.0",
    "source": "context-pack",
    "duration_ms": 255,
    "truncated": false,
    "next_cursor": null
  }
}
```

*(source: `src/types.ts:11-41`, `src/packer.ts:78-95`)*

---

## 5. Error Taxonomy & Exit Codes

On failure, Context Pack throws `ContextPackError` which emits structured error envelopes and POSIX exit codes:

| Error Code | Exit Code | Trigger Condition |
| :--- | :---: | :--- |
| `INVALID_INPUT` | `2` | Missing `--task`, missing `--files`, or invalid integer `--budget`. |
| `BUDGET_TOO_SMALL` | `2` | Provided budget is strictly below minimum requirement of $100$ tokens. |
| `NOT_FOUND` | `3` | Explicit file path specified does not exist on disk (`ENOENT`). |
| `NO_FILES_MATCHED` | `3` | Glob patterns evaluated to zero matching candidate files. |
| `PERMISSION_DENIED` | `4` | File system read permission error (`EACCES` or `EPERM`). |
| `ENCODING_UNSUPPORTED` | `1` | Tokenizer encoding is not in `cl100k_base`, `o200k_base`, `p50k_base`, `r50k_base`. |
| `INTERNAL_ERROR` | `1` | Unhandled runtime or I/O exception. |

*(source: `src/errors.ts:33-41`, `src/cli.ts:47-66`)*
