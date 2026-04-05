---
description: "Research a CFA topic for module creation. Gathers Learning Outcome Statements, topic weights, key concepts, formulas, common exam patterns, and authoritative explanations. Use when building CFA content or investigating a CFA curriculum topic."
disable-model-invocation: true
---

# CFA Topic Research

Structured research pipeline for CFA Level I, II, and III topics. Produces sourced findings that feed directly into `/cfa-module` and `/cfa-practice` commands.

## Process

### Phase 1 — Scope (Checkpoint: confirm with user)

1. Identify which **CFA Level** (I, II, or III) this topic belongs to
2. Identify the **topic area** (e.g., Fixed Income, Equity Investments, Ethics)
3. Restate the research question in one sentence
4. List 3-5 specific sub-questions to investigate
5. **Checkpoint**: Present scope to user. Do not proceed until confirmed.

### Phase 2 — Gather

Use tools in parallel where possible:

| Source | Tool | What to gather |
|--------|------|----------------|
| CFA Institute | Tavily search, WebFetch | Official Learning Outcome Statements (LOS), topic outlines, reading lists, sample questions |
| Study providers | Tavily search | Schweser, Wiley, 300Hours, AnalystPrep — study strategies, common misconceptions, tips |
| Academic sources | Tavily search, WebFetch | Foundational concepts, formula derivations, textbook explanations |
| Existing platform | Read, Grep, Glob | Cross-references to existing modules, shared concepts |

Guidelines:
- Always find the **official LOS** for this topic — these define what the exam tests
- Note the **topic weight** (percentage of exam) from CFA Institute's topic weightings
- Gather at least 2 independent sources per sub-question
- Flag information older than 1 year (CFA curriculum updates annually)
- Note the **curriculum year** for all sources (e.g., 2025 vs 2026 curriculum)

### Phase 3 — Synthesize (Checkpoint: share draft)

1. Cross-reference findings across sources
2. Identify consensus, contradictions, and gaps
3. Organize by Learning Outcome Statement
4. **Checkpoint**: Present draft findings. Ask if any area needs deeper investigation.

### Phase 4 — Output

```
## CFA Research: [Topic Name]

### Metadata
- **CFA Level:** I / II / III
- **Topic Area:** [e.g., Fixed Income]
- **Topic Weight:** [e.g., 11-14%]
- **Curriculum Year:** [e.g., 2025-2026]

### Learning Outcome Statements
1. [LOS a] — describe/explain/calculate...
2. [LOS b] — ...
3. ...

### Key Concepts
- [Concept 1]: [Explanation]
- [Concept 2]: [Explanation]
- ...

### Key Formulas
- [Formula name]: [Formula in LaTeX or plain text]
- ...

### Common Exam Pitfalls
- [Pitfall 1]: [What candidates get wrong and why]
- [Pitfall 2]: ...

### Study Strategy
- Prerequisite knowledge: [What learner should know first]
- Recommended study order: [Within this topic area]
- High-yield areas: [What gets tested most often]
- Common distractors: [Typical wrong-answer patterns]

### Recommended Module Sequence
1. [Module title] — covers LOS [a, b]
2. [Module title] — covers LOS [c, d]
3. ...
4. [Checkpoint] — tests across all LOS

### Sources
1. [Source with URL/reference]
2. ...
```

## Error Handling

| Issue | Resolution |
|-------|-----------|
| Can't find official LOS | Search for "[topic] CFA Level [N] learning outcomes [year]" |
| Curriculum year mismatch | Note which year, flag as potentially outdated |
| Topic too broad | Break into sub-topics, research each separately |
| Conflicting study advice | Present both perspectives, note source authority |
