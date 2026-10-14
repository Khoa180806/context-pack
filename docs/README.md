# Context Pack Documentation

Welcome to the comprehensive technical documentation for **Context Pack** (`ai-context-pack` / `cx`), a deterministic token-budgeted context packaging engine and CLI/SDK for autonomous AI coding agents and developers.

---

## Documentation Index

### 01. Overview
- [Project Overview](01-overview/project-overview.md) — Problem statement, target users, core capabilities, technology stack, and empirical benchmark highlights.
- [Project Structure](01-overview/project-structure.md) — Directory layout and module responsibilities across the core engine, web playground, and test suites.
- [Getting Started](01-overview/getting-started.md) — System prerequisites, global/local installation, CLI usage walkthrough, SDK example, and dev test commands.
- [Development Workflow](01-overview/development-workflow.md) — Branching standards, Conventional Commits, test-driven development, and GitHub Actions CI matrix.

### 02. Technical Architecture
- [System Architecture](02-technical/architecture.md) — High-level architecture, 4-stage ingestion pipeline, dual Node/Browser runtime engines, and component diagrams.
- [Business Flow & Execution Sequences](02-technical/business-flow.md) — Step-by-step sequence diagrams for CLI execution, TypeScript SDK agent loops, and Web Playground processing.
- [API Reference & Specification](02-technical/api-reference.md) — TypeScript SDK programmatic interfaces, CLI flags reference, and Common Transport Envelope JSON schema.
- [Technical Decisions & ADRs](02-technical/tech-decisions.md) — Architectural decision records (ADR-001 to ADR-005) covering tokenizer selection, Task-Aware Slicing, and knapsack packing.

### 03. Product Lifecycle
- [Changelog](03-product/changelog.md) — Chronological release history from v0.1.0 to v1.0.0 sourced from git commits and semantic version tags.
- [Product Roadmap](03-product/roadmap.md) — Delivered milestones, current release focus, and planned roadmap items (native MCP server, multi-chunk slicing).

### 04. Operations & Configuration
- [Deployment & Release Operations](04-operations/deployment.md) — npm package publishing procedures, Vercel web hosting setup, and automated CI quality gates.
- [Configuration Reference](04-operations/configuration.md) — Environment variables, command-line flags, operational boundaries, and supported Tiktoken encodings.

### 05. Engineering Templates
- [Bug Report Template](05-templates/bug-report.md) — Standardized GitHub Issue template for reproducible defect reporting.
- [ADR Template](05-templates/adr-template.md) — Architecture Decision Record template with Context, Decision, Alternatives, and Consequences.

### 06. Design & Frontend UI
- [UI Design & Web Playground Architecture](06-design/ui-notes.md) — OLED dark theme design tokens, dual-pane component hierarchy, twin-scroll editor, and zero-leak privacy.

### 07. Technical Notes
- [Known Issues & Technical Limitations](07-notes/known-issues.md) — Algorithmic constraints, edge cases, technical trade-offs, and mitigation strategies.
