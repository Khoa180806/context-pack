# Product Roadmap

This document outlines delivered milestones, current stabilization work, and verified future enhancements for Context Pack.

---

## 1. Completed Milestones

### v0.1.0 — Architecture Prototype (Completed)
- In-memory 4-stage pipeline: resolver, ranker, tokenizer, knapsack packer.
- Core error taxonomy with typed `ContextPackError` and exit codes.
- 46 automated Vitest tests.

### v0.1.1 — Public npm Launch & Cross-Platform Support (Completed)
- Published `ai-context-pack` globally on npm registry.
- Supported CLI aliases: `cx`, `cpack`, `context-pack`, `ai-context-pack`.
- Automated GitHub Actions CI across Windows and Linux (Node 18, 20, 22).

### v0.1.2 — Task-Aware Hotspot Slicing & Web Playground (Completed)
- Implemented `sliceRelevantLines()` to dynamically center context windows around code hotspots.
- Built interactive client-side Web Playground (Next.js 16 Turbopack) with dual-pane split view, line-numbered editor, and bilingual toggle.
- Validated on enterprise monorepo (`VibeGraph-com`, 994 files) achieving -88.8% average token reduction and 100% hotspot alignment.

---

## 2. Current Development Focus

- **Developer Documentation Refactoring:** Complete technical handbook for open-source contributors and technical recruiters.
- **Web Playground Vercel Hosting:** Continuous deployment of `web/` to Vercel production environment (`https://context-pack-tool.vercel.app/`).

---

## 3. Near-Term Roadmap (v0.2.0)

### Native Model Context Protocol (MCP) Server
- **Problem:** Currently, autonomous agents must invoke `cx` via child-process terminal execution.
- **Solution:** Expose a native `context-pack mcp` stdio transport server implementing standard MCP tool contracts:
  ```json
  {
    "name": "pack_context",
    "description": "Extract optimal source code slices for a task within token budget",
    "inputSchema": { "task": "string", "patterns": "string[]", "budget": "number" }
  }
  ```
- **Benefit:** Allows Cursor, Claude Desktop, and Antigravity to invoke Context Pack natively with structured JSON inputs.

### Multi-Chunk Slicing per File
- **Problem:** When a single large file has two distinct hotspot locations (e.g., an interface at the top and a handler method at line 800), a single contiguous 100-line slice misses one of them.
- **Solution:** Support clustering multiple top-scoring regions into separate discrete slices (`lines 10–60` and `lines 790–850`).

---

## 4. Future Considerations (v0.3.0+)

- **AST Boundary Snapping (Opt-in):** Align window start and end lines to enclosing function or class boundaries when language grammars are available.
- **Cross-Turn Slice Caching:** Cache hashed file slices in local memory across multi-turn agent conversations to achieve sub-5ms latency for recurring file candidates.
- **VS Code / JetBrains Extension:** Visual status-bar token budget meter with one-click "Pack Context to Prompt" clipboard action.
