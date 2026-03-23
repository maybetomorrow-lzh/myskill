# Repository Roadmap

## Current Direction

Build a personal workflow skill for an AI-focused primary-market investor who
needs fast, high-signal news triage across China and overseas.

## Design Principles

- Keep the core skill concise and investor-oriented.
- Rank news by market importance, not by article novelty alone.
- Separate reusable ranking logic and source rules into `references/`.
- Store repeatable digest formats in `assets/templates/`.

## Suggested Next Iterations

1. Tune the source whitelist to match your actual daily reading list.
2. Add examples of what you consider high-signal versus low-signal news.
3. Add sub-templates for daily digest, weekly memo, and company watchlist.
4. Add sector lenses such as model layer, applications, infrastructure, chips, and policy.
5. Add a named watchlist of companies and funds you care about most.
6. Integrate the installed `spreadsheet`, `jupyter-notebook`, and `notion-research-documentation` skills into a repeatable research loop.
