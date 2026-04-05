# Learning Platform

An AI-powered education platform that teaches through active practice, spaced repetition, and drill-based mastery — not passive video consumption.

## What It Does

- **Interactive lessons** with inline exercises (predict, explain-back, calibration checks)
- **Spaced repetition quizzes** that resurface material before you forget it
- **Drill-based mastery** with practice, test, mastery progression
- **AI-powered practice interviews** for real-world scenario preparation
- **Gamification** — Sparks currency, achievements, streaks, daily spin lottery
- **Creator platform** for community-contributed courses

## Courses

| Course | Type | Focus |
|--------|------|-------|
| AI Fluency | Lessons | Understanding AI/ML concepts for non-engineers |
| Texas Hold'em | Drills | Poker math — outs, odds, expected value |
| CFA Level 1-3 | Lessons | Chartered Financial Analyst exam prep |
| Claude Code Mastery | Lessons | Effective AI-assisted development |
| System Design | Lessons | Distributed systems, scalability patterns |
| Web Fundamentals | Lessons | HTML, CSS, browser internals |
| React Literacy | Lessons | React concepts for non-frontend engineers |

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + Shadcn UI
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Anthropic Claude API (feedback, interviews)
- **Payments:** Stripe (spark purchases, subscriptions)
- **PWA:** Service worker for offline support

## Getting Started

```bash
npm install
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run build:review # Regenerate review quiz questions
```

### Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Project Structure

```
content/                    # Course content as JSON
  {course}/
    courses.json            # Course catalog
    curriculum.json         # Levels, modules, ordering
    {level}/{slug}.json     # Individual lessons

src/
  app/                      # Next.js App Router
    api/                    # API routes (ai-feedback, sparks, user-data, webhooks)
    curriculum/             # Course browsing pages
    dashboard/              # User dashboard
    learn/[...slug]/        # Lesson rendering
    interview/              # AI practice interviews
    shop/                   # Spark shop

  components/
    learning/               # Interactive blocks (DrillSet, PredictPrompt, ExplainBack)
    content/                # ModuleRenderer, markdown rendering
    review/                 # Daily quiz modal, quiz questions
    sparks/                 # Economy UI (SparksBadge, CooldownGate, CourseUnlockGate)
    dashboard/              # Dashboard widgets (insights, lottery, achievements)
    progress/               # Progress bars, level cards, module completion
    layout/                 # Header, Sidebar, Footer
    ui/                     # Shadcn UI primitives

  lib/
    poker/                  # Poker math engine (outs, hand evaluation, generators)
    sparks/                 # Economy system (store, config, cooldown, achievements)
    store/                  # Progress tracking, quiz history
    supabase/               # Supabase client helpers

  types/                    # TypeScript definitions

supabase/
  migrations/               # Database schema migrations
```

## Content Authoring

Lessons are JSON files at `content/{course}/{level}/{slug}.json`. Each lesson contains:
- `meta` — title, slug, level, flags
- `blocks` — content blocks (markdown, interactive exercises, drills)
- `reviewQuestions` — 2-3 quiz questions for spaced repetition review

See `CLAUDE.md` for the full content authoring guide.

## Economy System (Sparks)

Users earn Sparks through lessons (10), exercises (3), drill tests (15), daily quizzes (5+ per correct), the daily spin lottery (1-50), and achievements (10-500). Sparks can be spent on course unlocks, cooldown skips, and streak freezes.

The economy is gated behind a feature flag for staged rollout.

## Testing

```bash
npx vitest run                              # Run all tests
npx vitest run src/lib/poker/__tests__/     # Poker math tests
```
