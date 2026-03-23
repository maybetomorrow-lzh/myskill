# Feishu Publishing

Use the PowerShell script in this repository to create or update a Feishu docx
 document from a local Markdown file.

## Files

- `scripts/publish-feishu-doc.ps1`
- `.feishu-publisher.example.json`

## Setup

1. Create a Feishu custom app.
2. Grant it document creation and editing permissions for docx/drive.
3. Copy `.feishu-publisher.example.json` to `.feishu-publisher.json`.
4. Fill in `app_id`, `app_secret`, and optionally `folder_token`.

## Delivery Rule

- Treat the Feishu document as the primary delivery artifact for weekly reports.
- When a weekly report already has a Feishu document, update that document in place.
- Do not default to creating a new weekly report document when an existing one should be refreshed.

## Usage

Create a new Feishu document:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-feishu-doc.ps1 `
  -MarkdownPath .\docs\weekly-ai-investment-report-2026-03-16-to-2026-03-22.md `
  -Title "AI投资周报（2026.03.16-2026.03.22）"
```

Update an existing Feishu document in place:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-feishu-doc.ps1 `
  -MarkdownPath .\docs\weekly-ai-investment-report-2026-03-16-to-2026-03-22.md `
  -Title "AI投资周报（2026.03.16-2026.03.22）" `
  -ExistingDocumentId "your_docx_id"
```

## Notes

- The script keeps Markdown support intentionally simple for reliability.
- Headings, paragraphs, bullet lists, ordered lists, and dividers are supported.
- Markdown tables are converted into readable text blocks for Feishu display.
- Use `-ExistingDocumentId` when refreshing an already published weekly report.
