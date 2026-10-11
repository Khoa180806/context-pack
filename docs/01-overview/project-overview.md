# Project Overview

Context Pack (`ai-context-pack` / `cx`) is a deterministic, token-budgeted context packaging engine and CLI/SDK designed to optimize source code ingestion for autonomous AI coding agents and human developers.

---

## 1. Problem Statement

Modern Large Language Models (LLMs) feature expanded context windows (128k–1M+ tokens), but naive full-codebase ingestion introduces three critical failure modes:
1. **Prompt Attention Dilution:** LLM reasoning quality degrades exponentially ("Lost in the Middle" phenomenon) when fed thousands of lines of irrelevant boilerplates, imports, and auxiliary files.
2. **Exorbitant Inference Costs:** Ingesting 50k–100k tokens per prompt turn costs developers and agent teams hundreds of dollars monthly in redundant input tokens.
3. **Context Overflow & Rejections:** Complex multi-file prompts frequently exceed agent token limits or API rate-limit ceilings.

Context Pack solves this by evaluating task relevance line-by-line and packing the highest-value code slices within a hard token ceiling before invoking the LLM.

---

## 2. Target Users

- **Autonomous AI Coding Agents:** Claude Code, Cursor, Antigravity, Aider, and custom agent loops requiring deterministic, bounded context extraction prior to prompt generation.
- **Vibecoders & CLI Power Users:** Developers who want to extract precise bug coordinates and piping contexts directly to clipboard or LLM prompts using a single terminal command.
- **Developer Tool Integrators:** Teams building agentic IDE extensions, MCP servers, or automated code review bots.

---

## 3. Key Capabilities

- **Strict Token Budget Ceiling:** Guarantees that extracted context never exceeds the specified token limit (`budget_tokens`), preventing prompt overflow.
- **Task-Aware Window Slicing:** Locates the exact semantic hotspot inside a target file (functions, bug sites, handlers) and slices a focused ~100-line window around it, avoiding naive head-of-file truncation.
- **Pure JavaScript BPE Tokenizer:** Accurate token counting via `js-tiktoken` with zero native C++ compilation or WASM dependencies.
- **Zero-Network Privacy:** Runs 100% locally in-memory. No code, tokens, or telemetry leave the local environment.
- **Dual Execution Engine:** Distributed simultaneously as a Node.js CLI/SDK and an in-browser Web Playground.

---

## 4. Technology Stack

| Layer | Technologies & Dependencies | Purpose |
| :--- | :--- | :--- |
| **Core Runtime** | Node.js ≥ 18 (ESM), TypeScript 5.6 | Fast, cross-platform execution |
| **CLI Framework** | `commander` (v12), `picocolors` (v1) | Argument parsing, subcommands, high-contrast terminal styling |
| **File Resolution** | `fast-glob` (v3) | Fast cross-platform pattern and glob expansion |
| **Tokenizer** | `js-tiktoken` (v1.0.15) | Pure JS byte-pair encoding (BPE) token counting |
| **Test Suite** | `vitest` (v2.1.0), `tsx` | Unit and CLI integration test automation |
| **Web Playground** | Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Lucide | Interactive in-browser zero-leak demonstration UI |

*(source: `package.json:48-63`, `web/package.json:12-32`)*

---

## 5. Empirical Verification Highlights

Validated across both micro-repositories and enterprise-scale codebases:
- **`token_diff` (Micro-Repo):** **-75.2%** average token reduction ($4,630 \to 1,148$ tokens) at **21.4ms** latency.
- **`VibeGraph-com` (Enterprise Monorepo, 994 files):** **-88.8%** average token reduction (up to **-99.3%** on Vue frontend components) with **100% hotspot alignment accuracy**.

*(source: `docs/BENCHMARK_RESULTS.md`)*
