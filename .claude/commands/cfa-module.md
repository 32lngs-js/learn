---
description: "Create a complete CFA learning module. Generates a JSON module file with content blocks following the evidence-based Predict-Learn-Practice-Reflect-Connect cycle. Use after /cfa-research to build a module for a specific CFA topic."
disable-model-invocation: true
---

# CFA Module Creation

Creates a complete CFA learning module JSON file following the platform's content schema and the evidence-based learning cycle.

## Process

### Step 1 — Gather Context

1. Read the topic research (from `/cfa-research` output) if available
2. Identify the specific Learning Outcome Statements this module covers
3. Check existing modules in `content/cfa/` for continuity and cross-references:
   - `Glob` for `content/cfa/**/*.json`
   - Read adjacent modules in the same topic area
4. Identify prerequisite concepts the learner should already know
5. Determine module position in the topic sequence (check `content/cfa/curriculum.json`)

### Step 2 — Design the Learning Cycle

Map content to blocks following the Predict -> Learn -> Practice -> Reflect -> Connect cycle:

#### Predict (`predictPrompt` block)
- Ask a question that activates prior knowledge or tests intuition
- Should be answerable with reasoning even before reading the content
- Example: "If interest rates rise by 1%, which bond loses more value — a 2-year or a 10-year? Why?"

#### Learn (`markdown` blocks)
- Core conceptual content with formulas, tables, worked examples
- Break into sections of 200-300 words each
- Use LaTeX for formulas: `$P = \sum_{t=1}^{n} \frac{C}{(1+y)^t} + \frac{F}{(1+y)^n}$`
- Include worked examples for quantitative topics
- Use tables for comparison/classification topics
- Insert `calibrationCheck` blocks between sections to test understanding before moving on

#### Practice (`tryItYourself` + `practiceSet` blocks)
- 1-2 `tryItYourself` blocks for open-ended conceptual application
  - Example: "Calculate the duration of a 5-year, 6% annual coupon bond at 8% YTM. Show your work."
- 1 `practiceSet` block with 3-5 graded CFA-style problems:
  - Multiple choice (A, B, C) matching CFA exam format
  - Difficulty progression: basic -> intermediate -> advanced
  - All problems include full worked solutions
  - Each distractor reflects a common mistake, not a random wrong answer
  - Include `cfaTopic` and `learningOutcome` metadata per problem

#### Reflect (`explainBack` + `reflectPrompt` blocks)
- 1 `explainBack` requiring the learner to teach the concept back
  - Example: "Explain the relationship between duration and convexity to someone studying for Level I."
- 1 `reflectPrompt` with 2-3 metacognitive questions
  - Example: "Which concept was most unintuitive? Where would you need more practice?"

#### Connect (`keyTakeaway` + `connectPrompt` blocks)
- `keyTakeaway`: Essential formulas, decision rules, key relationships (concise bullet list)
- `connectPrompt`: Link to next module and cross-level connections
  - Example: "Duration will appear again in Level II Fixed Income when we cover interest rate risk management."

### Step 3 — Write the JSON

Follow the `ModuleContent` schema exactly:

```json
{
  "meta": {
    "title": "FI.1: Bond Prices and Yields",
    "description": "Understand the inverse relationship between bond prices and yields.",
    "level": "level-1",
    "slug": "fi-bond-prices-yields",
    "order": 1,
    "isCheckpoint": false,
    "isIndex": false
  },
  "blocks": [
    { "type": "predictPrompt", "prompt": "..." },
    { "type": "markdown", "content": "## Section Title\n\n..." },
    { "type": "calibrationCheck", "question": "...", "answer": "..." },
    { "type": "markdown", "content": "## Next Section\n\n..." },
    { "type": "tryItYourself", "title": "...", "solution": "..." },
    {
      "type": "practiceSet",
      "title": "Bond Pricing Practice",
      "problems": [
        {
          "id": "bp-1",
          "question": "A 5-year, 6% annual coupon bond has a YTM of 8%. What is its price per $100 par?",
          "options": ["A) $92.01", "B) $92.79", "C) $93.20"],
          "correctAnswer": "A",
          "explanation": "PV = 6/1.08 + 6/1.08^2 + ... + 106/1.08^5 = $92.01. Option B incorrectly uses semiannual compounding. Option C uses the coupon rate instead of YTM for discounting.",
          "difficulty": "basic",
          "cfaTopic": "Fixed Income",
          "learningOutcome": "Calculate bond price given YTM"
        }
      ]
    },
    { "type": "explainBack", "prompt": "..." },
    { "type": "reflectPrompt", "questions": ["...", "..."] },
    { "type": "keyTakeaway", "content": "..." },
    { "type": "connectPrompt", "prompt": "..." }
  ]
}
```

Save to: `content/cfa/level-{N}/{slug}.json`

### Step 4 — Verify

Before marking complete:
- [ ] JSON is valid (parseable without error)
- [ ] All LOS for this module are covered by at least one content block
- [ ] Practice problems have mathematically correct solutions
- [ ] Each distractor has a plausible reason (documented in explanation)
- [ ] Formulas use valid LaTeX syntax
- [ ] Module fits the topic sequence in curriculum.json
- [ ] Cross-references to other modules are accurate
- [ ] Read the final JSON file to confirm it saved correctly

## Module Naming Convention

Use topic-prefixed slugs for flat directory organization:
- `ethics-professional-standards`
- `quant-time-value-of-money`
- `fsa-income-statements`
- `fi-bond-prices-yields`
- `eq-market-organization`
- `deriv-forward-commitments`
- `alt-real-estate`
- `pm-portfolio-risk-return`
- `econ-demand-supply`
- `corp-capital-budgeting`
