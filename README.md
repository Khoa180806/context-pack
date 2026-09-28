# Context Pack (`ai-context-pack`)

**T02 — AI Developer Tool Ecosystem | 1★ Scheduled**

> Produce a bounded, reusable package of the most relevant context for an agent task.

---

## What it does

`context-pack` takes a task description and a set of source files, then produces a **ContextPack** — a bounded, token-budgeted, machine-readable context artifact containing only the most relevant slices of context needed for an AI coding agent to complete the task.

Unlike dumping entire files into the context window, Context Pack:
- Respects an explicit **token budget** (default: 4000 tokens)
- Selects and ranks the **most relevant** files/sections via configurable strategies
- Outputs a **stable, versionable artifact** that can be reused across agent calls
- Composes with **Token Diff (T01)** to measure context efficiency gains

---

## Status

`0.1.0` — In Development (1★)

---

## Installation

```bash
npm install -g ai-context-pack
```

## Usage

```bash
# Pack context from files for a task
context-pack pack --task "Fix the authentication bug" --files src/ --budget 4000

# Pack and emit JSON for agent consumption
context-pack pack --task "Refactor UserService" --files src/services/ --budget 8000 --json

# Show version
context-pack --version

# Show help
context-pack --help
```

---

## Output format

```json
{
  "data": {
    "task": "Fix the authentication bug",
    "budget_tokens": 4000,
    "used_tokens": 3820,
    "truncated": false,
    "slices": [
      {
        "file": "src/auth/handler.ts",
        "start_line": 10,
        "end_line": 45,
        "tokens": 320,
        "relevance_score": 0.91
      }
    ]
  },
  "metadata": {
    "schema_version": "1.0",
    "source": "context-pack",
    "duration_ms": 43,
    "truncated": false,
    "next_cursor": null
  }
}
```

---

## Related tools

- **T01 — Token Diff** (`ai-token-diff`): Measure token usage before/after context packing
- **T03 — Tool Result Compressor**: Compress verbose tool output to feed into a Context Pack

---

## License

MIT
