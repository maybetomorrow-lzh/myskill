# Weekly Report Format

Use this reference when generating a weekly AI investment report.

## Output Goal

Produce a report that reads like an investor-facing weekly memo, not a workflow note.

## Required Sections

1. Title with date range
2. One short conclusion summary
3. A section named `本周关键新闻`
4. Under that section, use one subheading per key news item, with the subheading written as a concise summary of the news itself
5. For each key news item, write separate paragraphs for:
   - the news and background
   - investable targets
   - investment judgment
6. A dedicated section named `技术分析与趋势`
7. A focused target tracking section
8. A next-week watchlist
9. Sources

## Rules

- Do not include methodology sections in the report body.
- Do not include source taxonomy, scoring logic, or workflow notes in the report body.
- Keep process guidance inside the skill, not the report.
- Every target entry should include: why it matters, current judgment, and what to verify next.
- Separate `可投标的` and `投资判断` into two distinct paragraphs.
- Do not list publicly traded companies as investable targets.
- Before finalizing each weekly report, explicitly scrub `可投标的` and `重点标的跟踪` sections to ensure no listed company remains as an investment target.
- Before any company enters `可投标的` or `重点标的跟踪`, run a mandatory listing-status check.
- Listing-status check order:
  1. Check whether the company has a stock code or an exchange listing page.
  2. Check recent primary sources or major business media for the exact listing date.
  3. If the company has listed, remove it from investable targets and keep it only as a market signal if still relevant.
  4. If listing status is unclear, mark the company as `待核验` and do not include it in the target pool.
- For any well-known China AI company with frequent financing or IPO coverage, do not rely on memory for listing status.
- If a listed company is relevant as a market signal, keep it in the news analysis only and map it to private target categories instead.
- Distinguish facts from inference.
- Prefer short analytical paragraphs over long bullet dumps.
- Before drafting, scan the full date window for major China AI financing events, major product releases, and major policy or platform moves.
- Before drafting, run a dedicated `ITjuzi 融资补扫` for the selected date window.
- The `ITjuzi 融资补扫` must look for AI company names, round, amount, investors, and whether the event introduces a new target clue.
- If the weekly report has not completed the `ITjuzi 融资补扫`, it should not be treated as finalized.
- Do not omit representative high-signal financing events in the selected window; if one is excluded from the main body, explain why.
- For China coverage, ensure the source mix includes technical media, financing/company media, and business-analysis media whenever relevant material exists in the selected window.
- Treat the Feishu document as the primary delivery artifact for weekly reports.
- When a weekly report already exists in Feishu, update that existing Feishu document in place instead of creating a new one.
- In `技术分析与趋势`, explain what technically changed this week, whether the change is incremental or structural, and what it implies for startup opportunity and industry direction.

## Style

- Write for an investor, not for an operator manual.
- Prioritize context, competitive position, and market implication.
- Keep the prose tight and decision-oriented.
