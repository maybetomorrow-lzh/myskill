# Skill Composition Workflow

Use the installed skills as a staged AI investment research pipeline.

## Stage 1: News Triage

Use `personal-workflow` to:

- collect China and overseas AI news
- rank items into `Important`, `Watch`, and `Noise`
- explain technical change and industry impact
- highlight notable company execution

For China startup coverage, add a dedicated discovery layer:

- startup databases such as ITjuzi
- venture media such as Pedaily
- company verification sources such as the National Enterprise Credit Information Publicity System
- technical traction sources such as GitHub and Hugging Face
- commercialization signals such as pricing pages, changelogs, and hiring pages

## Stage 2: Structured Tracking

Use `spreadsheet` to turn the ranked digest into a table with columns such as:

- date
- headline
- source
- geography
- segment
- importance
- technical change
- industry impact
- investment takeaway
- company to watch

Use this stage when comparing multiple items across time matters more than prose.

## Stage 3: Trend Analysis

Use `jupyter-notebook` when the question becomes analytical rather than editorial.

Good use cases:

- Which segments generated the most high-importance news this month?
- Which companies appeared most often in `Important` items?
- Are model-layer signals becoming less investable than application-layer signals?
- Which China versus overseas themes are accelerating?

## Stage 4: Research Output

Use `notion-research-documentation` to turn the structured output into:

- daily brief
- weekly AI market memo
- company watch update
- sector deep dive

## Recommended Default Flow

1. Run `personal-workflow` for the ranked digest.
2. Add startup-source notes for each company from databases, company records, and developer signals.
3. Save key items into a `spreadsheet` table.
4. Use `jupyter-notebook` for deeper trend questions when needed.
5. Publish the final narrative with `notion-research-documentation`.

## Prompt Patterns

- `Summarize the most important AI news in the last 48 hours, then prepare a spreadsheet-ready table.`
- `Take this week's AI news digest, analyze recurring themes in a notebook, and identify the most investable trends.`
- `Turn today's AI news ranking into a Notion-ready research memo with company spotlights and technical implications.`
