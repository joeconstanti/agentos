---
id: 20260406100200
type: note
status: active
created: 2026-04-06 10:02
tags:
  - playbook
  - ingest
  - wiki
  - workflow
area: docs
---
# Raw Ingest to Wiki

This playbook describes the full pipeline for turning a raw source in `05_RAW/` into a polished wiki article in `03_RESOURCES/`. Agents run this pipeline; humans provide the raw material.

---

## Overview

```
05_RAW/_topics/<topic>/YYYYMMDD-source-slug.md
        ↓  Step 1: Drop source
        ↓  Step 2: Run ingest prompt
03_RESOURCES/Wiki/<topic>/Article Title.md
        ↓  Step 3: Create/update MOC
        ↓  Step 4: Add backlinks
        ↓  Step 5: Update _index.md
```

---

## Step 1 — Drop source into 05_RAW

Place the source file in the appropriate topic folder:

```
05_RAW/_topics/<topic>/YYYYMMDD-source-slug.md
```

**Naming rules:**
- Date prefix: `YYYYMMDD` (e.g. `20260407`)
- Slug: short kebab-case description of the source (e.g. `karpathy-llm-kb-blog-post`)
- Extension: `.md` — even for clipped web pages, convert to Markdown first

**Frontmatter to include in raw sources:**

```yaml
---
id: YYYYMMDDHHMMSS
type: raw-source
status: pending
created: YYYY-MM-DD HH:MM
source_url: https://example.com/original-article
source_type: web-clip  # web-clip | pdf | repo | dataset | note
tags:
  - raw
  - <topic>
area: <topic>
---
```

---

## Step 2 — Run the ingest prompt

Use this exact prompt when asking an agent to compile a raw source or topic folder into a wiki article:

```
You are compiling raw research sources into a wiki article for the AgentOS knowledge base.

TASK: Read all files in `05_RAW/_topics/<TOPIC>/` and produce a single polished wiki article.

INSTRUCTIONS:
1. Read every .md file in the topic folder.
2. Identify the core concepts, key facts, and actionable insights across all sources.
3. Synthesise — do not just concatenate. Deduplicate overlapping content. Resolve contradictions by noting both perspectives.
4. Write the wiki article using the WIKI ARTICLE TEMPLATE below.
5. Save the article to `03_RESOURCES/Wiki/<TOPIC>/Article Title.md` (create the subfolder if needed).
6. For each compiled source, update its frontmatter: set `status: compiled` and add `compiled_into: [[Article Title]]`.
7. Report: list the sources read, the article path written, and any gaps or uncertainties you found.

WIKI ARTICLE TEMPLATE:
---
id: YYYYMMDDHHMMSS
type: note
status: active
created: YYYY-MM-DD HH:MM
tags:
  - wiki
  - <topic>
area: <topic>
sources:
  - [[YYYYMMDD-source-slug]]
---
# Article Title

One-paragraph summary of what this article covers and why it matters.

## Overview
...

## Key Concepts
...

## How It Works
...

## Practical Patterns
...

## Trade-offs & Limitations
...

## Related
- [[Related Note 1]]
- [[Related Note 2]]

## References
- [Source Title](URL)
```

---

## Step 3 — Create or update the topic MOC

After writing the wiki article, check whether a Map of Content index exists for the topic:

```
03_RESOURCES/Wiki/<topic>/_index.md
```

If it doesn't exist, create it. If it does, add the new article.

**MOC entry format:**

```markdown
- [[Article Title]] — One-line description of what this article covers
```

**MOC creation prompt:**

```
Check whether `03_RESOURCES/Wiki/<TOPIC>/_index.md` exists.
- If not: create it using the MOC TEMPLATE below, listing all articles currently in the folder.
- If yes: append the new article as a bullet in the appropriate section.

MOC TEMPLATE:
---
id: YYYYMMDDHHMMSS
type: index
status: active
created: YYYY-MM-DD HH:MM
tags:
  - index
  - moc
  - <topic>
area: <topic>
---
# <Topic> — Map of Content

## Articles
- [[Article Title]] — One-line description
```

---

## Step 4 — Add backlinks to related notes

After creating the wiki article, identify 2–5 existing notes in the vault that are conceptually related. Add a wikilink to the new article in each of those notes.

**Backlink prompt:**

```
Search the vault for notes related to "<TOPIC>" or "<ARTICLE TITLE>".
For each related note found, append a wikilink to [[Article Title]] in its "Related" or "See also" section.
If no such section exists, add one at the bottom:

## See also
- [[Article Title]] — brief reason for relevance
```

---

## Step 5 — Update the topic _index.md

If the topic has an `_index.md` in `03_RESOURCES/` (e.g. `03_RESOURCES/Docs/_index.md`), add the new article to its listing.

---

## Image handling

If raw sources contain images or reference diagrams:

1. Download the image locally to `03_RESOURCES/Attachments/<topic>/filename.png`
2. Reference it in the wiki article using the Obsidian embed syntax: `![[filename.png]]`
3. Never use external image URLs in compiled wiki articles — they rot

---

## Compiled article template (full)

```markdown
---
id: 20260406120000
type: note
status: active
created: 2026-04-06 12:00
tags:
  - wiki
  - <topic>
area: <topic>
sources:
  - [[20260405-source-one]]
  - [[20260406-source-two]]
---
# Article Title

Brief summary of this article: what it covers, why it matters, who should read it.

## Overview

High-level explanation of the concept or technology. What is it? What problem does it solve?

## Key Concepts

Explain the 3–5 most important ideas. Each concept gets its own subheading if complex.

### Concept A
...

### Concept B
...

## How It Works

Step-by-step or architectural explanation. Use diagrams (`![[diagram.png]]`) where helpful.

## Practical Patterns

Concrete, immediately-usable patterns, recipes, or examples. Code blocks where appropriate.

## Trade-offs & Limitations

Honest assessment of when this approach works well and when it doesn't.

## Related

- [[Related Concept]] — why it's related
- [[Another Note]] — how they connect

## References

- [Source Title](https://example.com)
- [Paper Title](https://arxiv.org/...)
```
