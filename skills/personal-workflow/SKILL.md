---
name: personal-workflow
description: Help a China-based primary-market investor track, rank, and summarize important AI news from China and overseas. Use when Codex needs to scan recent AI developments, sort them by investment importance, explain market implications, and turn broad news flow into a concise investor digest.
---

# AI Investment News Workflow

Use this skill to turn broad AI news flow into an investor-friendly summary that
highlights what matters most and why.

## Workflow

1. Gather recent AI news from both China and overseas when the user asks for a digest.
2. Check primary sources before relying on media summaries.
3. Group items by theme such as models, applications, infrastructure, capital, and policy.
4. Rank each item by investment importance instead of recency alone.
5. Explain the likely implications for startups, incumbents, capital flows, and timing.
6. Go deeper on important technical iterations and explain the likely industry impact.
7. Highlight AI companies with unusually strong execution or category leadership.
8. Present a short digest that surfaces the highest-signal developments first.

## Sourcing Rules

- Prefer official company, lab, regulator, exchange, and project sources first.
- Use media sources to add context, not to replace primary facts.
- Mark clearly when a point is verified versus inferred.
- If a story appears in only one weak source, treat it as watchlist material.
- Separate China and overseas sourcing paths before comparing significance.

Read `references/source-universe.md` for the source whitelist and sourcing order.

## Output Rules

- Lead with the most important items first.
- Distinguish clearly between facts, interpretation, and investment inference.
- Prefer concise summaries over long article recaps.
- Explain why an item matters for the primary market.
- For important technical developments, include a technical change summary and industry impact.
- When a company stands out in a category, add a focused company summary instead of burying it in a generic digest.
- Call out whether a signal looks structural, tactical, or mostly noise.

## Common Modes

### Daily News Digest

Create a ranked digest with:

- headline
- source
- what happened
- why it matters
- importance level
- investment takeaway

Use the digest template in `assets/templates/daily-review.md` when a consistent
structure would help.

### Theme-Based Sorting

Group news into:

- China
- overseas
- model layer
- applications
- infra and chips
- policy and regulation
- capital markets and company moves

Read `references/workflow-patterns.md` for ranking signals and interpretation
guidelines.

### Importance Ranking

Rank items using factors such as:

- impact on AI adoption
- effect on competitive landscape
- implications for startup formation or funding
- relevance for China market versus global market
- persistence of the signal

When several items are similar, rank the one with stronger market consequences
higher.

Use `references/importance-scoring.md` to apply a repeatable importance test.
Use `references/investor-lens.md` to tune the digest toward the user's personal
investment style and recurring interests.

## Boundaries

- Do not confuse media buzz with investment importance.
- Do not overweigh fundraising headlines without strategic context.
- Do not summarize too many low-signal items.
- Favor items that affect market structure, capability shifts, regulation, or capital allocation.
