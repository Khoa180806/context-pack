# Known Issues & Technical Limitations

This document tracks known constraints, algorithmic edge cases, and technical trade-offs present in the Context Pack codebase.

---

## 1. Algorithmic Constraints

### Single Contiguous Slice Window per File
- **Location:** `src/slicer.ts:43-112`, `web/src/lib/engine/clientPacker.ts:51-114`
- **Issue:** When a target file is larger than `maxSliceLines` (e.g. 500 lines) and contains two distinct hotspots (e.g. a type definition at line 20 and a bug coordinate at line 450), the slicer centers a single continuous window around the highest-scoring hotspot.
- **Impact:** The secondary hotspot in that file is omitted from the slice.
- **Mitigation:** Increase `--max-slice-lines` (e.g. `--max-slice-lines 200`) or break large files into smaller modular units. (Planned for v0.2.0 multi-chunk slicing).

### Greedy Knapsack Backfill Skip
- **Location:** `src/packer.ts:58-76`
- **Issue:** When the packer encounters a high-ranking candidate slice whose token count exceeds the remaining token headroom, it marks `truncated = true` and stops packing.
- **Impact:** Smaller candidate slices further down the ranking list that could fit into the remaining gap (e.g. 50 unused tokens) are not backfilled.
- **Design Rationale:** Prevents stuffing low-relevance fragments into prompt context simply because they are small, preserving LLM signal-to-noise ratio.

### Compound Identifier Tokenization in Keyword Matcher
- **Location:** `src/ranker.ts:44-55`, `src/slicer.ts:65-69`
- **Issue:** Regex extraction parses alphanumeric terms using `/[a-z0-9_]{3,}/g`. In camelCase identifiers (e.g. `isTokenBlacklisted`), the matcher searches for the full lowercase string `istokenblacklisted` rather than splitting sub-words `token` and `blacklisted`.
- **Impact:** Sub-word matching relies on substring inclusion rather than linguistic lemmatization.

---

## 2. Performance & Memory Limitations

### Pure JS Tokenizer Cold Start
- **Location:** `src/tokenizer.ts:23-28`
- **Issue:** `js-tiktoken` loads BPE rank tables in pure JavaScript. The very first token count operation (`countTokens`) incurs a one-time ~200–300ms table instantiation overhead.
- **Mitigation:** Encoder instances are cached in `encoderCache` map; all subsequent calls execute in sub-millisecond time.

### In-Browser Main-Thread Processing on Huge Files
- **Location:** `web/src/hooks/useContextPacker.ts:60-95`
- **Issue:** In the Web Playground, packing runs directly on the browser's main thread. Uploading or pasting massive files (>5MB / 50,000 lines) may cause a momentary (~150ms) UI stutter.
- **Mitigation:** The UI displays an animated skeleton loader (`isProcessing`) and disables the "Pack Context" button during execution.

---

## 3. Platform & File System Notes

### Windows Path Normalization
- **Location:** `src/slicer.ts:134`, `src/packer.ts:66`
- **Behavior:** Windows backslashes (`\`) are normalized to standard POSIX forward slashes (`/`) for fast-glob matching and envelope serialization.
- **Status:** Verified and covered by test suite (`test/cli.test.ts`).
