---
description: "Generate CFA practice problems for a specific topic. Creates exam-style multiple choice questions with worked solutions and distractor analysis. Use to add practice sets to existing modules or create standalone drill sessions."
disable-model-invocation: true
---

# CFA Practice Problem Generation

Generates sets of CFA-style practice problems for a specific topic, independent of module creation.

## Process

### Step 1 — Scope

1. Identify the **CFA Level** and **topic area**
2. Identify specific **Learning Outcome Statements** to test
3. Determine difficulty distribution (default: 40% basic, 40% intermediate, 20% advanced)
4. Determine count (default: 10 problems)
5. Check if a vignette/case study format is needed (Level II style)

### Step 2 — Problem Design Principles

**Format:**
- CFA Level I & II: Multiple choice with 3 options (A, B, C)
- CFA Level III: Constructed response (use `tryItYourself` block format instead)

**Quality rules:**
- Each problem tests **one specific concept** (no compound questions)
- Distractors must reflect **common mistakes**, not random wrong answers
- Every distractor needs a documented reason (e.g., "uses wrong compounding frequency", "confuses real vs nominal rate")
- Quantitative problems must have **fully worked solutions** showing every calculation step
- Qualitative problems must explain **why each distractor is wrong**
- No ambiguous questions — exactly one correct answer
- Problems should be self-contained (all needed data in the question)

**Difficulty definitions:**
- **Basic**: Direct application of a single formula or definition
- **Intermediate**: Requires combining 2 concepts or multi-step calculation
- **Advanced**: Requires judgment, interpretation, or combining 3+ concepts

### Step 3 — Generate Problems

For each problem, produce:

```json
{
  "id": "unique-id",
  "question": "Question text with any tables or formulas in markdown",
  "options": ["A) First option", "B) Second option", "C) Third option"],
  "correctAnswer": "B",
  "explanation": "Full worked solution. Why B is correct: [reasoning]. Why A is wrong: [specific error it represents]. Why C is wrong: [specific error it represents].",
  "difficulty": "basic | intermediate | advanced",
  "cfaTopic": "Topic Area Name",
  "learningOutcome": "Specific LOS being tested"
}
```

### Step 4 — Format Output

**For insertion into an existing module:**
```json
{
  "type": "practiceSet",
  "title": "[Topic] Practice Problems",
  "problems": [...]
}
```

**For vignette-based sets (Level II):**
```json
{
  "type": "practiceSet",
  "title": "[Case Study Title]",
  "vignette": "Marcus Chen is a portfolio manager at...",
  "problems": [...]
}
```

### Step 5 — Quality Check

Before finalizing:
- [ ] All solutions are mathematically correct (re-verify calculations)
- [ ] No ambiguous questions (exactly one defensible correct answer)
- [ ] Difficulty is appropriately tagged
- [ ] LOS coverage is complete (every target LOS has at least 1 problem)
- [ ] Distractors are plausible and each has a documented reason
- [ ] No two problems test the exact same concept in the same way
- [ ] Problems are self-contained (no external references needed)
- [ ] LaTeX formulas render correctly

## Example Output

```json
{
  "type": "practiceSet",
  "title": "Time Value of Money Practice",
  "problems": [
    {
      "id": "tvm-1",
      "question": "An investor deposits $10,000 into an account earning 6% compounded annually. What is the account value after 3 years?",
      "options": ["A) $11,800.00", "B) $11,910.16", "C) $11,576.25"],
      "correctAnswer": "B",
      "explanation": "FV = PV × (1 + r)^n = 10,000 × (1.06)^3 = 10,000 × 1.191016 = $11,910.16. Option A incorrectly uses simple interest (10,000 + 3 × 600). Option C incorrectly compounds monthly at 6%/12 for 3 periods instead of 36.",
      "difficulty": "basic",
      "cfaTopic": "Quantitative Methods",
      "learningOutcome": "Calculate future value of a single sum"
    }
  ]
}
```
