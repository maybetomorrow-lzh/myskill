# myskill

This repository stores a personal investment workflow skill focused on AI news
triage for a China-based primary-market investor.

## Purpose

Use this repo to help Codex gather, rank, and summarize important AI news from
China and overseas with an investor's lens.

## Structure

- `skills/personal-workflow/`: the actual skill package
- `docs/`: repo-level notes and future direction
- `tests/manual/`: lightweight prompts for manual validation
- `scripts/`: publishing and data-capture scripts
- `CHANGELOG.md`: behavior-oriented change history

## Current Focus

The skill should be especially good at:

1. scanning domestic and international AI news
2. ranking items by investment relevance and urgency
3. extracting the implications for funds, startups, and market structure
4. producing a concise, decision-friendly digest
5. supplementing weekly financing coverage with IT桔子 incremental capture

## Extended Workflow

After restarting Codex, combine the installed skills like this:

1. `personal-workflow`: discover, rank, and summarize AI news
2. `spreadsheet`: turn news flow into a comparable tracking table
3. `jupyter-notebook`: analyze trends, counts, and recurring signals
4. `notion-research-documentation`: turn findings into a reusable research memo

## IT桔子 Capture

The repo now includes a minimal IT桔子 capture flow based on:

- Edge dedicated profile
- login-state reuse
- incremental fetch
- local raw and parsed cache

See [docs/itjuzi-capture.md](E:/code/myskill/docs/itjuzi-capture.md) for usage.
