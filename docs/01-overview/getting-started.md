# Getting Started

This guide walks you through system prerequisites, global and local installation, basic command usage, and local development testing.

---

## 1. Prerequisites

- **Node.js:** Version `18.0.0` or higher (`node -v`).
- **Package Manager:** `npm` (v9+) or `pnpm` / `yarn`.
- **Operating System:** Cross-platform (Windows PowerShell / CMD, macOS Terminal, Linux Bash).

*(source: `package.json:61-63`)*

---

## 2. Installation

### Global CLI Installation (Recommended for Terminal Users)

Install the executable binary globally to access the `cx` command anywhere:

```bash
npm install -g ai-context-pack@latest
```

Verify installation:
```bash
cx --version
# Output: 0.1.2
```

### Local Project Dependency (For TypeScript / Node.js Projects)

Add Context Pack to your project's dependencies:

```bash
npm install ai-context-pack
# or
pnpm add ai-context-pack
```

### Instant Execution without Installation (`npx`)

Run one-off context packing commands directly:

```bash
npx ai-context-pack -t "Fix memory leak" -f "src/**/*.ts" -b 2000
```

---

## 3. Basic CLI Usage

### Super-Short Syntax

Context Pack allows omitting the `pack` subcommand keyword:

```bash
# Basic file packing with 2000 token budget
cx -t "Fix authentication token expiry" -f "src/**/*.ts" -b 2000

# Multiple glob patterns and comma-separated lists
cx -t "Optimize database query" -f "src/db.ts,src/models/*.ts" -b 1500

# Output machine-readable JSON to stdout
cx -t "Explain parser logic" -f "src/parser.ts" -b 1000 --json
```

### Piping Context to Clipboard for LLM Prompts

On Windows PowerShell:
```powershell
cx -t "Fix bug" -f "src/**/*.ts" -b 2000 --json | Set-Clipboard
```

On macOS:
```bash
cx -t "Fix bug" -f "src/**/*.ts" -b 2000 --json | pbcopy
```

---

## 4. Programmatic SDK Usage

```typescript
import { pack } from 'ai-context-pack';

async function main() {
  const envelope = await pack({
    task: 'Refactor user session cache',
    files: ['src/**/*.ts'],
    budget: 2500,
    encoding: 'cl100k_base',
  });

  console.log(`Used ${envelope.data.used_tokens} / ${envelope.data.budget_tokens} tokens`);
  for (const slice of envelope.data.slices) {
    console.log(`- ${slice.file} (lines ${slice.start_line}-${slice.end_line})`);
  }
}

main();
```

*(source: `src/index.ts`)*

---

## 5. Local Development & Testing

### Running Core Engine Tests

```bash
git clone https://github.com/Khoa180806/context-pack.git
cd context-pack
npm install
npm test
```
*Expected: 46 unit & integration tests passing across 6 test files.*

### Running Web Playground Locally

```bash
cd web
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:3000` in your browser.

### Running Web Engine Tests

```bash
cd web
npm test
```
*Expected: 14 unit tests passing across in-browser ranker, packer, and tokenizer.*
