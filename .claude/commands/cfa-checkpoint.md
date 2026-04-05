---
description: "Create a CFA checkpoint assessment that tests understanding across a topic area or full CFA level. Use after building modules for a topic to create a comprehensive review assessment."
disable-model-invocation: true
---

# CFA Checkpoint Creation

Creates a checkpoint module that tests across an entire CFA topic area or level without AI assistance, following the existing checkpoint pattern.

## Process

### Step 1 — Scope

1. Identify the target scope: **topic area** (e.g., all Fixed Income modules) or **full level** (all Level I modules)
2. Read all existing modules in the target scope:
   - `Glob` for `content/cfa/level-{N}/*.json`
   - Read each module to extract key concepts, formulas, and LOS covered
3. Build a concept inventory: list every key idea, formula, and decision framework from the modules

### Step 2 — Design the Checkpoint

A checkpoint tests **breadth** across all modules in scope. Design:

- **6-10 `explainBack` blocks** testing concept recall
  - Each should require the learner to explain a concept from memory
  - Cover different modules (don't cluster on one topic)
  - Example: "Without looking back, explain how modified duration differs from Macaulay duration and when you'd use each."

- **3-5 `tryItYourself` blocks** testing application
  - Require the learner to work through a problem or analysis
  - At least one should combine concepts from multiple modules
  - Example: "Given the following bond portfolio, calculate the portfolio duration and estimate the price change for a 50bp yield increase."

- **1 `calibrationCheck` block** for self-assessment
  - Present a confidence calibration table covering each sub-topic
  - Example: "Rate your confidence (1-5) on each: Bond pricing, Duration, Convexity, Yield curves, Credit analysis"

- **1 `practiceSet` block** with 5-8 exam-style problems
  - Mix of topics from across the scope
  - Higher difficulty than individual module practice sets
  - At least 2 problems that require combining concepts from multiple modules

### Step 3 — Write the JSON

```json
{
  "meta": {
    "title": "Fixed Income Checkpoint",
    "description": "Test your understanding across all Fixed Income topics before moving on.",
    "level": "level-1",
    "slug": "fi-checkpoint",
    "order": 99,
    "isCheckpoint": true,
    "isIndex": false
  },
  "blocks": [
    {
      "type": "markdown",
      "content": "## Fixed Income Checkpoint\n\nThis checkpoint tests your understanding across all Fixed Income modules. Try to answer from memory before checking your notes.\n\n**Goal:** If you can explain these concepts clearly and solve these problems correctly, you're ready to move on."
    },
    { "type": "explainBack", "prompt": "..." },
    { "type": "explainBack", "prompt": "..." },
    { "type": "tryItYourself", "title": "...", "solution": "..." },
    { "type": "practiceSet", "title": "...", "problems": [...] },
    { "type": "calibrationCheck", "question": "...", "answer": "..." },
    {
      "type": "keyTakeaway",
      "content": "If you scored well, proceed to the next topic. If any areas felt weak, revisit those specific modules before continuing."
    }
  ]
}
```

Save to: `content/cfa/level-{N}/{topic}-checkpoint.json`

### Step 4 — Verify

- [ ] Every module in scope is represented by at least one question
- [ ] At least one question combines concepts from multiple modules
- [ ] No answers can be found by reading the checkpoint itself (no leaking)
- [ ] Difficulty is higher than individual module practice
- [ ] JSON is valid
- [ ] Module is marked `isCheckpoint: true`
- [ ] Order number places it after all modules in the topic
