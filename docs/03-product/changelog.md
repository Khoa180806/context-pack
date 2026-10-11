# Changelog

All notable changes to Context Pack (`ai-context-pack` / `cx`) are documented in this file, structured by release version and sourced directly from Git history.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.2] — 2026-10-10

### Added
- **Task-Aware Window Slicing (`sliceRelevantLines`):** Evaluates line-by-line keyword match weights, finds the highest-scoring hotspot line, and extracts an asymmetric window (~35% lead context, ~65% trailing implementation) centered around the target code coordinate.
- **Interactive Web Playground:** Standalone Next.js 16 (Turbopack) web interface with client-side in-memory packing engine, real-time TokenMeter, line-numbered editor, and dynamic JSON envelope tab.
- **Hotspot Highlighting in SlicesViewer:** Visual highlighting of task keywords (`<mark>` pills) and matching lines (`border-l-2 border-cyan-400`).
- **Real-World Monorepo Verification:** Integrated empirical benchmarks from `VibeGraph-com` (994 files, Java Spring Boot + Neo4j + Vue 3), demonstrating -88.8% average token reduction.
- **Bilingual i18n Support:** Client-side zero-flicker English and Vietnamese toggle across the entire landing page and playground.

### Fixed
- **CLI Comma-Separated File Arguments:** Fixed CLI `-f` option parser to support comma-delimited strings (e.g. `-f "src/a.ts,src/b.ts"`), matching the Web Playground copy command format.
- **Browser Threading & Worker Loading:** Replaced fragile browser Web Worker resolution with clean asynchronous main-thread dispatch, preventing bundler module loading errors.
- **Terminal Demo Formatting:** Re-rendered `cli-demo.gif` and SVG/PNG snapshots to strictly match picocolors ANSI colors and exact CLI terminal output.

---

## [0.1.1] — 2026-10-09

### Added
- **Initial Public npm Release:** Published `ai-context-pack` (`cx`) to npm registry under MIT license.
- **Four-Stage Core Pipeline:** Input Resolver (`fast-glob`), Relevance Ranker (BM25 + TF-IDF), Pure JS Tokenizer (`js-tiktoken`), and Greedy Knapsack Packer.
- **Super-Short CLI Syntax:** Allowed executing `cx -t "..." -f "..."` directly without requiring explicit `pack` subcommand keyword.
- **Common Transport Envelope:** Standardized JSON output conforming to `{ data, metadata }` schema specification.
- **Cross-Platform CI Matrix:** Configured GitHub Actions CI testing on Ubuntu and Windows across Node.js 18.x, 20.x, and 22.x.
- **Comprehensive Documentation:** Initial `SPEC.md`, `BENCHMARK_RESULTS.md`, and bilingual README files.

---

## [0.1.0] — 2026-10-02

### Added
- Initial project prototype and core algorithm design.
- Basic line slicing (`sliceLines`) and token estimation.
- 46 unit test suites covering CLI parsing, ranker, slicer, tokenizer, and formatter.
