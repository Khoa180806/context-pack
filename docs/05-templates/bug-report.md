# Bug Report Template

Use this issue template when reporting unexpected exceptions, token budget calculation mismatches, or CLI parsing errors in Context Pack.

---

```markdown
---
name: Bug Report
about: Create a report to help us improve Context Pack
title: "[BUG] <Brief summary of the issue>"
labels: bug
assignees: ''
---

## 1. Description
A clear and concise description of what the bug is.

## 2. Command or SDK Code Executed
Paste the exact CLI command or TypeScript code you executed:

\`\`\`bash
cx -t "Your task description" -f "path/to/files/**/*.ts" -b 2000
\`\`\`

## 3. Expected Behavior
A concise description of what you expected to happen (e.g. expected specific file to be included, expected token count to be below ceiling).

## 4. Actual Behavior / Output Received
Paste the terminal output or JSON error envelope:

\`\`\`text
<Paste output here>
\`\`\`

## 5. Environment Information
- **Context Pack Version:** \`cx --version\` (e.g. \`0.1.2\`)
- **Node.js Version:** \`node -v\` (e.g. \`v20.11.0\`)
- **Operating System:** (e.g. Windows 11, macOS Sequoia, Ubuntu 22.04)
- **Terminal Shell:** (e.g. PowerShell 7, zsh, bash)

## 6. Minimal Reproducible Repository (Optional)
If possible, link a minimal reproducible repo or attach sample source files that trigger the behavior.
```
