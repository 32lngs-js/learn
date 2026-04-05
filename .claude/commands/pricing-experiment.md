---
description: "Design a pricing experiment to test monetization hypotheses. Covers experiment design, variants, metrics, success criteria, and implementation plan."
---

# Pricing Experiment Designer

Design a structured pricing experiment to validate monetization strategy.

## Inputs

- **What to test** (free vs paid feature gating, price points, tier structure, Spark economy tuning, enterprise pricing)
- **Current state** (what's free now, what costs what, current conversion rates if known)
- **Hypothesis** (what do you believe will happen?)
- **Constraints** (can't break existing users, only test with ben@grady.cloud first, etc.)

If the user doesn't provide these, ask what aspect of pricing they want to explore.

## Process

### Phase 1 — Hypothesis Definition

Structure the hypothesis:
> "If we [change], then [metric] will [direction] by [amount], because [reasoning]."

Examples:
- "If we gate AI interviews behind 100 Sparks, interview usage will decrease 30% but Spark purchase conversion will increase 5x."
- "If we reduce course unlock cost from 750 to 500 Sparks, enrollment rate will increase 40% with minimal revenue impact."

### Phase 2 — Experiment Design

Define:
- **Experiment name** (short, memorable)
- **Variant A (Control):** Current behavior
- **Variant B (Treatment):** The change
- **Variant C (Optional):** Alternative treatment
- **Audience:** Who sees what? (all users, new users only, ben@grady.cloud only, % split)
- **Duration:** How long to run (minimum for statistical significance)
- **Sample size estimate:** How many users needed for reliable results

### Phase 3 — Metrics Framework

Define metrics at three levels:
- **Primary KPI:** The one number that decides success/failure
- **Secondary KPIs:** Supporting metrics that add context (2-3)
- **Guardrail metrics:** Things that must NOT get worse (retention, NPS, support tickets)

For each metric, specify:
- Current baseline (if known)
- Target / success threshold
- How to measure (analytics event, DB query, manual count)

### Phase 4 — Implementation Plan

Specify what needs to change in code:
- Which files / config values to modify
- How to segment users (feature flag, A/B framework, manual)
- What analytics events to add
- How to roll back if needed

Reference existing infrastructure:
- `src/lib/sparks/feature-flags.ts` — user-level gating
- `src/lib/sparks/config.ts` — economy values (SPARK_CONFIG, BEN_CONFIG_OVERRIDES)
- `supabase/migrations/003_sparks_economy.sql` — A/B experiment tables exist

### Phase 5 — Analysis Plan

Before running, define:
- How to analyze results (simple comparison, cohort analysis, statistical test)
- What constitutes "enough data" to make a decision
- Decision framework: "If primary KPI improves by X% AND guardrails hold, ship to all users"
- Timeline for decision (e.g., "Evaluate after 2 weeks or 100 conversions, whichever comes first")

### Phase 6 — Risk Assessment

Identify:
- What could go wrong? (users confused, revenue drops, negative reviews)
- How do we detect problems early? (daily monitoring, alerts)
- What's the rollback plan? (change config, revert feature flag)
- Who needs to know this experiment is running?

Present the complete experiment as a one-page brief ready to execute.
