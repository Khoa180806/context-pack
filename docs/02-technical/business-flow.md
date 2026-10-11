# Business Flow & Execution Sequences

This document outlines the step-by-step sequence diagrams and data interactions for the three primary usage flows of Context Pack: CLI invocation, TypeScript SDK integration, and the Web Playground.

---

## 1. Flow 1: Terminal CLI Execution

When a developer or CLI wrapper executes `cx -t "<task>" -f "<files>" -b <budget>`, the command-line entrypoint processes arguments, delegates to the packaging pipeline, and formats the output.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Script
    participant CLI as CLI Parser (src/cli.ts)
    participant Core as Packer Orchestrator (src/packer.ts)
    participant Resolver as Input Resolver (src/slicer.ts)
    participant Ranker as Relevance Ranker (src/ranker.ts)
    participant Slicer as Window Slicer (src/slicer.ts)
    participant Tokenizer as Tokenizer (src/tokenizer.ts)
    participant Formatter as Terminal Formatter (src/formatter.ts)

    Dev->>CLI: cx -t "Fix bug" -f "src/**/*.ts" -b 2000
    CLI->>CLI: Parse flags & validate positive integer budget
    CLI->>Core: pack({ task, files, budget, encoding, maxSliceLines, minRelevance })
    Core->>Resolver: resolveFiles(patterns)
    Resolver-->>Core: Array of absolute file paths
    Core->>Resolver: readFileContent(path) for each file
    Resolver-->>Core: Raw file contents
    Core->>Ranker: rankFiles(fileContents, task, minRelevance)
    Ranker-->>Core: Ranked file list with relevance scores
    loop For each ranked candidate
        Core->>Slicer: sliceRelevantLines(content, task, maxSliceLines)
        Slicer-->>Core: Sliced window (start_line, end_line, content)
        Core->>Tokenizer: countTokens(content, encoding)
        Tokenizer-->>Core: Token count
        alt used_tokens + tokens <= budget
            Core->>Core: Add slice to envelope & accumulate used_tokens
        else Budget ceiling reached
            Core->>Core: Mark truncated = true
        end
    end
    Core-->>CLI: ContextPackEnvelope
    alt Flag --json is provided
        CLI->>Dev: Emit raw JSON to stdout (exit code 0)
    else Default compact terminal mode
        CLI->>Formatter: formatResult(envelope)
        Formatter-->>CLI: Colorized summary string
        CLI->>Dev: Print header, slice indicators, metrics (exit code 0)
    end
```

*(source: `src/cli.ts:10-72`, `src/packer.ts:13-96`, `src/formatter.ts:9-45`)*

---

## 2. Flow 2: Autonomous AI Agent / TypeScript SDK Integration

Autonomous coding agents (e.g. Claude Code, Cursor, custom agent loops) invoke Context Pack programmatically to retrieve bounded context before making LLM prompt calls.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Autonomous Agent Loop
    participant SDK as SDK Entrypoint (src/index.ts)
    participant Packer as pack() Engine (src/packer.ts)
    participant LLM as Target LLM API (GPT-4 / Claude / o1)

    Agent->>SDK: import { pack } from 'ai-context-pack'
    Agent->>SDK: pack({ task, files: ['src/**'], budget: 2000 })
    SDK->>Packer: Execute in-memory knapsack pipeline
    Packer-->>SDK: ContextPackEnvelope
    SDK-->>Agent: { data: { used_tokens, slices, ... }, metadata: { ... } }
    Agent->>Agent: Inject envelope.data.slices into system/user prompt
    Agent->>LLM: Send optimized prompt (75% smaller input context)
    LLM-->>Agent: High-precision code patch or completion
```

*(source: `src/index.ts:1-7`, `src/types.ts:1-41`)*

---

## 3. Flow 3: Client-Side Interactive Web Playground

The Web Playground executes 100% inside the browser on the main thread with zero network calls, preventing proprietary code leaks.

```mermaid
sequenceDiagram
    autonumber
    actor User as Browser User
    participant UI as InputPane (web/.../InputPane.tsx)
    participant Hook as useContextPacker (web/.../useContextPacker.ts)
    participant ClientPacker as clientPacker (web/.../clientPacker.ts)
    participant ResultUI as ResultPane (web/.../ResultPane.tsx)

    User->>UI: Select preset scenario or enter custom task & files
    User->>UI: Click "Pack Context" button
    UI->>Hook: executePack()
    Hook->>Hook: Set isProcessing = true
    Hook->>ClientPacker: packContextClient({ task, files, budget, encoding, maxSliceLines: 100 })
    ClientPacker->>ClientPacker: Rank in-memory VirtualFile[] via BM25
    ClientPacker->>ClientPacker: Slice hotspot window via sliceRelevantContentLines()
    ClientPacker->>ClientPacker: Count BPE tokens via in-browser js-tiktoken
    ClientPacker->>ClientPacker: Pack slices into ClientContextPackEnvelope
    ClientPacker-->>Hook: Envelope result
    Hook->>Hook: Set envelope = result, isProcessing = false
    Hook-->>ResultUI: Render TokenMeter progress, visual code slices, and JSON tab
    ResultUI-->>User: Display line numbers, keyword highlight tags, and copy buttons
```

*(source: `web/src/hooks/useContextPacker.ts:60-120`, `web/src/lib/engine/clientPacker.ts:75-180`, `web/src/components/playground/PlaygroundSection.tsx:30-80`)*

---

## 4. Error Handling and POSIX Exit Codes

When unexpected conditions occur, Context Pack handles errors through a typed `ContextPackError` hierarchy and maps errors to standardized POSIX exit codes:

```mermaid
flowchart TD
    ErrorRaised["Error Occurs in Pipeline"] --> CheckType{"Is ContextPackError?"}
    CheckType -->|Yes| MapCode["Lookup ERROR_EXIT_CODES[code]"]
    CheckType -->|No| Generic["Wrap as INTERNAL_ERROR (Code 1)"]
    MapCode --> CheckFlag{"Is --json flag set?"}
    Generic --> CheckFlag
    CheckFlag -->|Yes| OutJson["Output error JSON envelope to stderr/stdout"]
    CheckFlag -->|No| OutText["Output picocolors red error message to stderr"]
    OutJson --> Exit["process.exit(code)"]
    OutText --> Exit

    subgraph ExitCodes["Exit Code Mapping (src/errors.ts)"]
        E0["0: Success"]
        E1["1: INTERNAL_ERROR / ENCODING_UNSUPPORTED"]
        E2["2: INVALID_INPUT / BUDGET_TOO_SMALL"]
        E3["3: NOT_FOUND / NO_FILES_MATCHED"]
        E4["4: PERMISSION_DENIED"]
    end
```

*(source: `src/errors.ts:33-41`, `src/cli.ts:47-66`)*
