# Configuration Reference

This document provides a consolidated reference for all environment variables, command-line arguments, operational defaults, and architectural boundaries in Context Pack.

---

## 1. Environment Variables

Context Pack requires zero external configuration files or environment variables for standard operation. The following optional variables adjust runtime and terminal rendering behavior:

| Variable | Type | Default | Description | Example |
| :--- | :---: | :---: | :--- | :--- |
| `FORCE_COLOR` | `string` | `undefined` | Forces picocolors ANSI color output even in non-TTY terminals or piped shell streams. | `FORCE_COLOR=1` |
| `NODE_ENV` | `string` | `'development'` | Standard Node.js execution environment (`production`, `development`, `test`). | `NODE_ENV=production` |
| `CI` | `string` | `undefined` | Detected by test runners and terminal libraries to disable interactive pagers. | `CI=true` |

*(source: `src/formatter.ts`, `src/cli.ts`)*

---

## 2. CLI Options & Runtime Flags

| Option Flag | Shorthand | Type | Default | Validation Rule | Description |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `--task <text>` | `-t` | `string` | — | Non-empty string | Natural language task description or prompt brief. |
| `--files <globs...>` | `-f` | `string[]` | — | At least 1 valid glob | Target file paths or glob patterns (comma-separated supported). |
| `--budget <number>` | `-b` | `number` | `4000` | Integer $\ge 100$ | Strict token ceiling. Throws `BUDGET_TOO_SMALL` if $<100$. |
| `--encoding <name>` | — | `string` | `'cl100k_base'` | Valid tiktoken encoding | BPE encoding (`cl100k_base`, `o200k_base`, `p50k_base`, `r50k_base`). |
| `--max-slice-lines <number>` | — | `number` | `100` | Positive integer | Maximum lines per continuous slice window. |
| `--min-relevance <number>` | — | `number` | `0` | Float $0.0 \dots 1.0$ | Minimum relevance score to include candidate file. |
| `--output <file>` | `-o` | `string` | `undefined` | Valid writable path | Writes standardized JSON envelope artifact to disk. |
| `--json` | — | `boolean` | `false` | Boolean | Emits machine-readable JSON to stdout instead of terminal view. |

*(source: `src/cli.ts:109-119`, `src/packer.ts:16-37`)*

---

## 3. Operational Constraints & Boundaries

Context Pack enforces explicit boundaries to ensure predictable performance across varied repository sizes:

| Boundary Parameter | Minimum | Maximum | Default | Enforcement Mechanism |
| :--- | :---: | :---: | :---: | :--- |
| **Token Budget (`budget`)** | $100$ | Unbounded | $4,000$ | Validated in `src/packer.ts:26`. Throws `BUDGET_TOO_SMALL`. |
| **Slice Window Size (`maxSliceLines`)** | $1$ | File length | $100$ | Enforced in `src/slicer.ts:46`. |
| **Relevance Threshold (`minRelevance`)** | $0.0$ | $1.0$ | $0.0$ | Filtered in `src/ranker.ts:119`. |
| **Lead Context Ratio** | — | — | $\approx 35\%$ | Pre-hotspot lines allocated in `src/slicer.ts:102`. |
| **Trailing Context Ratio** | — | — | $\approx 65\%$ | Post-hotspot lines allocated in `src/slicer.ts:103`. |

---

## 4. Supported Tiktoken Encodings

| Encoding Name | Associated LLM Models | Tokenizer Standard |
| :--- | :--- | :--- |
| `cl100k_base` | GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, text-embedding-ada-002 | Default BPE tokenizer |
| `o200k_base` | GPT-4o, GPT-4o mini, OpenAI o1 | Next-gen multilingual BPE |
| `p50k_base` | Codex models (code-davinci-002), text-davinci-002 | Legacy code models |
| `r50k_base` | GPT-3 (davinci, curie) | Legacy base models |

*(source: `src/tokenizer.ts:4-31`)*
