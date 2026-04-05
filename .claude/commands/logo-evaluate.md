---
description: "Evaluate a logo image using adversarial critique. Converts SVG to PNG, views it, and provides honest assessment of quality, readability, and brand alignment."
---

# Logo Evaluation (Adversarial)

Evaluate a logo by viewing the rendered image and providing brutally honest critique.

## Process

1. Read the SVG file at the provided path
2. Convert it to PNG using a headless browser or canvas tool
3. View the PNG image using the Read tool
4. Evaluate against these criteria:

### Evaluation Criteria (score each 1-10)

- **Readability:** Can you read the text? Does it work at small sizes?
- **Professionalism:** Does it look like a real company logo, or a hobby project?
- **Distinctiveness:** Would you remember this logo tomorrow?
- **Brand alignment:** Does it feel Clean & Smart (not playful, not corporate)?
- **Scalability:** Would it work as a favicon? On a billboard?
- **Simplicity:** Is it too complex? Too simple?
- **Color:** Does the palette feel sophisticated?

### Output Format

```
SCORE: X/70

VERDICT: [SHIP IT / ITERATE / START OVER]

STRENGTHS:
- ...

PROBLEMS:
- ...

SPECIFIC FIXES:
- ...
```

Be ruthless. A real designer would charge $5,000+ for a logo. Hold this to that standard.
