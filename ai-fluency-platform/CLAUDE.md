# Palestra

## Build & Dev

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run build:review # Extract review questions from content → public/review-questions.json
```

## Content Authoring

Lessons are JSON files at `content/{course}/{level}/{slug}.json`. When **creating or modifying** any lesson file, you **must** include a `reviewQuestions` array. These questions power the daily review quiz that reinforces learning.

### Review Questions Schema

```json
{
  "meta": { ... },
  "blocks": [ ... ],
  "reviewQuestions": [
    {
      "question": "Approximately how many seconds are in a day?",
      "options": ["~1,000 (10^3)", "~86,400 (10^5)", "~1,000,000 (10^6)"],
      "correctIndex": 1,
      "explanation": "There are 86,400 seconds in a day — a key number for QPS estimation.",
      "encourageCorrect": "Nailed it! That number will come in handy for estimation problems.",
      "encourageIncorrect": "Not quite — it's about 86,400. A useful trick: round to 10^5 for quick math."
    }
  ]
}
```

### Review Questions Rules

1. **2-3 questions per lesson** — enough to reinforce, not overwhelm
2. **Very easy** — basic recall from the lesson's key points, not trick questions
3. **3 options each** — keep it simple and fast
4. **Test specific knowledge** — "How many seconds in a day?" not "What is a key takeaway?"
5. **Warm, encouraging tone** — both `encourageCorrect` and `encourageIncorrect` should feel supportive
6. **Vary encouragement messages** — don't repeat the same phrases across questions
7. **No LaTeX or complex formatting** — questions appear in a simple modal
8. **For math/formula content** — test concepts, not computation (e.g., "What does 2^30 approximately equal?" not "Calculate 2^30")
9. **Skip index.json, checkpoint.json, and isPracticeOnly files** — these don't need review questions

After modifying content, run `npm run build:review` to regenerate `public/review-questions.json`.

## Project Structure

- `content/` — Course content as JSON (courses.json, curriculum.json, lesson files)
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components (learning/, content/, review/, ui/, layout/, progress/)
- `src/lib/` — Content loading, utilities, stores
- `src/types/` — TypeScript type definitions
- `scripts/` — Build and validation scripts
