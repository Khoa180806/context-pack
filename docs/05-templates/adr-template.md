# Architecture Decision Record (ADR) Template

Use this template to propose and record significant technical, architectural, or algorithmic decisions in Context Pack.

---

```markdown
# ADR-XXX: <Short Title in Imperative Mood>

- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYY
- **Date:** YYYY-MM-DD
- **Author(s):** <Name or GitHub handle>
- **PR / Issue Reference:** <Link or #number>

---

## 1. Context
What technical problem, performance bottleneck, or product requirement are we facing?
- What are the constraints (e.g. zero-WASM, in-memory execution, sub-second latency)?
- What assumptions are we making about the environment or user workflow?

---

## 2. Decision
What is the proposed change or architectural choice?
- Clearly state the approach chosen.
- Explain the key components, algorithms, or interfaces introduced.

---

## 3. Alternatives Considered

### Alternative A: <Approach Name>
- **Pros:** <Strengths of this option>
- **Cons:** <Weaknesses of this option>
- **Reason for Rejection:** <Why this was not chosen>

### Alternative B: <Approach Name>
- **Pros:** <Strengths of this option>
- **Cons:** <Weaknesses of this option>
- **Reason for Rejection:** <Why this was not chosen>

---

## 4. Consequences

### Positive Impacts
- <What becomes easier, faster, or safer?>

### Negative Impacts & Trade-offs
- <What technical debt or complexity is accepted?>

### Mitigation Strategies
- <How do we monitor or mitigate the negative trade-offs?>
```
