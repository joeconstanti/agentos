---
id: 20260406100000
type: note
status: active
created: 2026-04-06 10:00
tags:
  - raw
  - ingest
area: system
---
# 05_RAW — Source Ingest Layer

This directory holds unprocessed source material before it has been compiled into the wiki (`03_RESOURCES/`). Think of it as the loading dock: everything arrives here first. Agents (not humans) are responsible for compiling this raw material into polished wiki articles.

---

## What goes here

| Type | Examples |
|------|---------|
| Web clips | Pages saved via Obsidian Web Clipper, browser-to-markdown exports |
| PDFs & papers | Research papers, whitepapers, technical documentation |
| Repo snapshots | README files, architecture docs scraped from GitHub |
| Datasets | CSV exports, JSON dumps, structured reference data |
| Images & screenshots | Diagrams, UI screenshots referenced in research |
| Rough notes | Unpolished capture notes, voice-to-text transcripts |

If it's raw, unreviewed, or needs synthesis before it becomes a proper wiki article — it goes here.

---

## How 05_RAW relates to 03_RESOURCES

```
05_RAW/_topics/<topic>/           ← raw sources land here
        ↓  (agent compiles)
03_RESOURCES/Wiki/<topic>/        ← polished wiki articles live here
03_RESOURCES/Docs/                ← how-to guides compiled from raw sources
```

**The rule:** humans drop material into `05_RAW/`. Agents read it, synthesise it, and write compiled articles into `03_RESOURCES/`. A raw file should never appear directly in `03_RESOURCES/`.

See [[Raw Ingest to Wiki]] for the full pipeline playbook.

---

## Naming convention

Every raw file should be named:

```
YYYYMMDD-source-slug.md
```

Examples:
- `20260406-karpathy-llm-kb-workflow.md`
- `20260407-mcp-spec-overview.md`
- `20260408-n8n-ai-agent-nodes.md`

The date prefix makes it easy for the health-check script to find sources older than 7 days that haven't been compiled yet.

---

## Using Obsidian Web Clipper

Obsidian Web Clipper is the recommended way to ingest web content. Once installed in your browser:

1. Navigate to the article or page you want to capture.
2. Click the Clipper icon and choose the `05_RAW` vault + folder as the save target.
3. Set the filename to follow the `YYYYMMDD-source-slug` convention.
4. Save — the clip lands in `05_RAW/_topics/<relevant-topic>/`.
5. Trigger the [[Raw Ingest to Wiki]] playbook to have an agent compile it.

The clipper preserves the full page text, metadata, and source URL in frontmatter automatically.

---

## Agent compilation

Agents compile raw sources into wiki articles. Humans rarely need to edit `03_RESOURCES/` directly. The compilation process is:

1. Agent reads all files in a `_topics/<topic>/` folder.
2. Agent synthesises, deduplicates, and writes a wiki article.
3. Agent updates the relevant `_index.md` MOC file.
4. Agent adds backlinks to related notes.
5. Compiled sources are marked `status: compiled` in their frontmatter and optionally moved to `04_ARCHIVE/`.

See [[Raw Ingest to Wiki]] for exact prompts and templates.

---

## Subfolders

- `_topics/` — one subfolder per research topic (see `_topics/README.md`)
