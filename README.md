<p align="center">
  <img src="docs/assets/screenshots/context-pack-logo.png" alt="Context Pack brand mark" width="128" height="128" />
  <br />
  <sub>Context Pack - Deterministic Token-Budgeted Context Packaging for Autonomous AI Coding Agents</sub>
</p>

<h1 align="center">Context Pack</h1>

<p align="center">
  <strong>Deterministic Token-Budgeted Context Slicing &amp; Packaging Infrastructure</strong>
</p>

<p align="center">
  <a href="README.md">English</a> • <a href="README.vi.md">Tiếng Việt</a>
  <br />
  <a href="https://context-pack.vercel.app">🌐 Live Web Playground</a> •
  <a href="docs/SPEC.md">Technical Specification</a> •
  <a href="docs/BENCHMARK_RESULTS.md">Benchmark Report</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.1-blue.svg?style=for-the-badge" alt="Version 0.1.1" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-339933.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="Node >= 18.0.0" />
  <img src="https://img.shields.io/badge/typescript-5.6-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pure--js-no--wasm-orange.svg?style=for-the-badge" alt="Pure JS" />
  <img src="https://img.shields.io/badge/tests-60%20passed-brightgreen.svg?style=for-the-badge" alt="Vitest Tests" />
  <img src="https://img.shields.io/badge/license-MIT-purple.svg?style=for-the-badge" alt="License MIT" />
</p>

<p align="center">
  <img src="docs/assets/screenshots/cli-demo.gif" alt="Animated demonstration of Context Pack real-time token budgeting and context extraction" width="100%" />
  <br />
  <sub>Figure 1: Real-time deterministic token budgeting and relevance slicing in the terminal.</sub>
</p>

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Why Context Pack?](#why-context-pack)
3. [System Architecture](#system-architecture)
4. [Installation & Setup](#installation--setup)
5. [CLI Command Reference](#cli-command-reference)
   - [Basic Invocation](#1-basic-invocation-cx-or-context-pack)
   - [Flag Arguments](#2-flag-arguments)
   - [Machine-Readable JSON Mode](#3-machine-readable-json-mode)
6. [Programmatic SDK / TypeScript Usage](#programmatic-sdk--typescript-usage)
7. [Standardized Transport Envelope Contract](#standardized-transport-envelope-contract)
8. [Deterministic Error Model & Exit Codes](#deterministic-error-model--exit-codes)
9. [Supported Encodings](#supported-encodings)
10. [Performance Benchmarks](#performance-benchmarks)
11. [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)
12. [Development & Contributing](#development--contributing)
13. [License & Acknowledgments](#license--acknowledgments)

---

## Executive Summary

`context-pack` is an ultra-fast, local-first CLI tool and TypeScript SDK designed to solve prompt dilution and token budget exhaustion in autonomous AI coding agent workflows (e.g., Cursor, Continue, Claude Code, GitHub Copilot).

Instead of dumping entire multi-thousand-line source code files into an LLM's context window, `context-pack` inspects candidate files, scores candidate code slices against the developer's task brief using deterministic BM25 / TF-IDF relevance scoring, and packs the highest-value code windows using a greedy knapsack algorithm strictly under a defined token ceiling.

---

## Why Context Pack?

- **Dramatic Token Reduction (-75.2%)**: Prevents attention dilution and cuts inference costs by extracting dense, targeted code slices rather than unbudgeted full-file dumps.
- **Task-Aware Window Slicing**: Dynamically centers slice windows around relevance hotspots (matching methods, classes, and bug locations) rather than naive head-of-file truncation.
- **100% Local-First & Zero Source Leaks**: Executes completely in memory on the local machine. Zero external API calls, zero telemetry, and zero network transmission of proprietary source code.
- **Pure JavaScript BPE Tokenizer**: Built on top of `js-tiktoken` without requiring native Node-GYP C++ toolchains or WebAssembly (WASM) binaries, ensuring universal reliability across Windows, macOS, and Linux.
- **Deterministic Knapsack Optimization**: Implements deterministic tie-breaking logic. Identical input files, task briefs, and token budgets always yield identical packed slices.
- **Agent-Ready Transport Envelope**: Generates structured, versioned JSON envelopes (`--json`) designed for consumption by autonomous agent orchestration loops.
- **Ultra-Short CLI Alias (`cx`)**: Designed for developer ergonomics with direct flags (`cx -t "..." -f "..." -b 1000`) and legacy subcommand compatibility.


---

## System Architecture

<p align="center">
  <img src="docs/assets/diagrams/system-architecture.png" alt="Context Pack layered execution architecture diagram" width="100%" />
  <br />
  <sub>Figure 2: Four-stage in-memory execution pipeline and deterministic packing architecture.</sub>
</p>

### Four-Stage Execution Pipeline

1. **Input Resolver**: Resolves file paths and fast glob patterns (e.g., `src/**/*.ts`), reading candidate source files into in-memory AST and slice candidates.
2. **Relevance Ranker**: Evaluates term frequency and inverse document frequency (BM25 + TF-IDF) between the task description and each candidate slice window.
3. **Tokenizer Engine**: Measures exact token counts using pure JavaScript BPE encoding (`cl100k_base`, `o200k_base`, `p50k_base`, `r50k_base`).
4. **Budget Packer**: Uses greedy knapsack packing to select the highest-scoring slices while guaranteeing that the cumulative token total never exceeds the configured ceiling.

---

## Installation & Setup

### Immediate Execution via `npx` (No installation needed)

```bash
# Using the canonical package name
npx ai-context-pack -t "Fix token count logic" -f "src/**/*.ts" -b 1000
```

### Global Installation (Recommended for daily workflow)

Install globally once to unlock the ultra-short **`cx`** binary across your system:

```bash
npm install -g ai-context-pack

# Test the installation
cx --help
```

### Local Project Dependency

```bash
npm install -D ai-context-pack
```

---

## CLI Command Reference

You can use the concise command alias **`cx`**, or the aliases **`cpack`**, **`context-pack`**, and **`ai-context-pack`**.

### 1. Basic Invocation (`cx` or `context-pack`)

```bash
# Direct flag invocation
cx -t "Fix user session invalidation" -f "src/auth/**/*.ts" "src/user.ts" -b 2000

# Using explicit pack subcommand
cx pack --task "Refactor tokenizer" --files "src/tokenizer.ts" --budget 1500
```

### 2. Flag Arguments

| Flag | Short | Default | Description |
|---|---|---|---|
| `--task <text>` | `-t` | *(Required)* | Task instruction or prompt description |
| `--files <globs...>` | `-f` | *(Required)* | File paths or glob patterns |
| `--budget <number>` | `-b` | `4000` | Maximum token ceiling |
| `--encoding <name>` | | `cl100k_base` | Tiktoken BPE tokenizer encoding |
| `--max-slice-lines <n>` | | `100` | Maximum lines per slice window |
| `--min-relevance <n>` | | `0` | Minimum score threshold (0.0 to 1.0) |
| `--output <file>` | `-o` | | Write envelope payload to designated JSON path |
| `--json` | | `false` | Emit machine-readable JSON to stdout |
| `--help` | `-h` | | Display help and usage information |
| `--version` | `-V` | | Output binary version |

### 3. Machine-Readable JSON Mode

Append `--json` to pipe the structured transport envelope directly into another tool or autonomous agent:

```bash
cx -t "Fix token count logic" -f "src/tokenizer.ts" -b 1000 --json
```

---

## Programmatic SDK / TypeScript Usage

`ai-context-pack` is fully typed and exports clean programmatic methods for Node.js / TypeScript applications:

```typescript
import { pack } from 'ai-context-pack';

const result = await pack({
  task: 'Fix token count logic and encoding validation',
  files: ['src/tokenizer.ts', 'src/packer.ts'],
  budget: 1000,
  encoding: 'cl100k_base',
  maxSliceLines: 100,
  minRelevance: 0.1,
});

console.log(`Used ${result.data.used_tokens} of ${result.data.budget_tokens} tokens`);
for (const slice of result.data.slices) {
  console.log(`- ${slice.file} (lines ${slice.start_line}-${slice.end_line}) | ${slice.tokens} tokens`);
}
```

---

## Standardized Transport Envelope Contract

When executing with `--json` or calling `pack()`, Context Pack returns a standardized machine-readable envelope:

```json
{
  "data": {
    "task": "Fix token count logic",
    "budget_tokens": 1000,
    "used_tokens": 953,
    "slice_count": 2,
    "file_count": 2,
    "truncated": true,
    "next_cursor": null,
    "slices": [
      {
        "file": "src/packer.ts",
        "start_line": 1,
        "end_line": 100,
        "tokens": 709,
        "relevance_score": 0.65,
        "content": "// Code slice content..."
      },
      {
        "file": "src/tokenizer.ts",
        "start_line": 1,
        "end_line": 32,
        "tokens": 244,
        "relevance_score": 0.52,
        "content": "// Code slice content..."
      }
    ]
  },
  "metadata": {
    "tool": "context-pack",
    "schema_version": "1.0",
    "duration_ms": 233
  }
}
```

---

## Deterministic Error Model & Exit Codes

Context Pack conforms to deterministic process exit codes for automated shell pipelines and CI scripts:

| Exit Code | Identifier | Description |
|---|---|---|
| `0` | Success | Operation completed successfully |
| `1` | General Failure | Internal runtime or unexpected error |
| `2` | Invalid Input | Malformed arguments or non-numeric budget |
| `3` | Not Found | Target file or glob pattern matched zero files |
| `4` | Permission Denied | Filesystem access restricted |
| `5` | Dependency Unavailable | Tokenizer or required dependency failed to initialize |

When `--json` is enabled, error outputs are serialized into a structured error envelope on stdout before exiting:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Budget must be a valid integer."
  },
  "metadata": {
    "schema_version": "1.0"
  }
}
```

---

## Supported Encodings

Context Pack supports major OpenAI BPE tokenizer encodings:

| Encoding | Primary Model Families |
|---|---|
| `cl100k_base` *(Default)* | GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, text-embedding-ada-002 |
| `o200k_base` | GPT-4o, GPT-4o mini, o1-preview, o1-mini |
| `p50k_base` | Codex models, text-davinci-002, text-davinci-003 |
| `r50k_base` | Text-davinci-001, davinci, curie, babbage, ada |

---

## Performance Benchmarks

Empirical validation was performed against an unassisted full-file baseline across 5 standard development tasks on the `ai-token-diff` codebase (4,630 baseline tokens, budget capped at 1,200 tokens):

| Task Description | Baseline (B0) | Context Pack (B2) | Token Savings | Latency | Slices |
|---|:---:|:---:|:---:|:---:|:---:|
| Fix CLI argument parsing for --encoding flag | 4,630 | 1,188 | **-74.3%** | 47ms | 3 |
| Add error handling for missing input files | 4,630 | 1,188 | **-74.3%** | 16ms | 3 |
| Refactor tokenizer module for multiple encodings | 4,630 | 969 | **-79.1%** | 15ms | 4 |
| Write unit tests for formatter module | 4,630 | 1,188 | **-74.3%** | 15ms | 3 |
| Explain token counting architecture | 4,630 | 1,188 | **-74.3%** | 15ms | 3 |

- **Average Token Reduction**: **-75.2%**
- **Average Packing Latency**: **21.4ms**
- **Local Overhead**: 100% in-memory, zero network round-trip.

> *See full experimental data in the [Benchmark Validation Report](docs/BENCHMARK_RESULTS.md).*

---

## Frequently Asked Questions (FAQ)

#### Does Context Pack require an internet connection or API keys?
No. Context Pack operates 100% locally on your machine. It requires zero cloud endpoints, zero LLM API keys, and zero telemetry.

#### Can I use wildcards and glob patterns?
Yes. You can pass glob patterns such as `src/**/*.ts` or `components/**/*.tsx`. Context Pack uses `fast-glob` to expand patterns efficiently.

#### How does the ranking algorithm work?
Context Pack combines BM25 term weighting and TF-IDF matching between terms in your task brief and tokens in each slice. It prioritizes function definitions, exported symbols, and files containing relevant terminology.

#### Does Context Pack rewrite or modify my source files?
No. Context Pack is strictly read-only. It inspects source code, extracts relevant line ranges, and emits the packed context to stdout or a designated JSON file.

---

## Development & Contributing

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Khoa180806/context-pack.git
cd context-pack

# Install dependencies
npm install

# Run the test suite
npm test

# Build TypeScript to dist/
npm run build
```

### Verification Checks

```bash
# Type check and build
npm run build

# Run unit and integration tests (Vitest)
npm test

# Run linter
npm run lint
```

---

## License & Acknowledgments

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
