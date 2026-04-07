---
id: 20260406100300
type: note
status: active
created: 2026-04-06 10:03
tags:
  - playbook
  - wiki
  - health-check
  - maintenance
area: docs
---
# Wiki Health Check

This playbook describes the LLM linting procedures for maintaining the quality of the AgentOS knowledge base. Run these checks periodically (weekly recommended) or before any major wiki synthesis session.

For automated detection, also see the `wiki-health-check.js` script in `01_PROJECTS/agentos_web/`.

---

## When to run

- Weekly, as part of vault maintenance
- Before compiling a new batch of raw sources
- After a major burst of content creation
- When the vault starts feeling cluttered or inconsistent

---

## Check 1 — Orphaned notes

**What:** Notes that no other note links to. They exist in the vault but are invisible from everywhere else.

**Why it matters:** Orphaned notes are effectively lost — they'll never be discovered through normal navigation.

**Agent prompt:**
```
Scan every .md file in the vault (excluding 00_INBOX/ and 05_RAW/).
For each file, check whether any other .md file contains a wikilink [[Note Name]] pointing to it.
List all files that have zero inbound wikilinks.
Format: orphaned note path | note title | suggested parent note to link from
```

**Fix:** Add a wikilink to the orphan from at least one related note, or from the relevant `_index.md` MOC file.

---

## Check 2 — Stub notes

**What:** Notes with fewer than 100 words of content (excluding frontmatter).

**Why it matters:** Stubs dilute the knowledge base. They signal incomplete compilation or a placeholder that was never filled out.

**Agent prompt:**
```
Scan every .md file in 02_AREAS/, 03_RESOURCES/, and 01_PROJECTS/.
For each file, count the words in the body (exclude YAML frontmatter).
List all files with fewer than 100 words.
Format: file path | word count | note title
Sort by word count ascending.
```

**Fix:** Either expand the note with real content, merge it into a related article, or mark it `status: stub` in frontmatter so it's easy to filter.

---

## Check 3 — Missing frontmatter fields

**What:** Notes that are missing one or more required frontmatter fields: `id`, `type`, `status`, `created`, `tags`, `area`.

**Why it matters:** Missing frontmatter breaks automated processing, search filters, and the health-check script.

**Agent prompt:**
```
Scan every .md file in the vault (except .obsidian/ and installer/).
For each file, parse the YAML frontmatter block (between --- delimiters).
Check for the presence of: id, type, status, created, tags, area.
List all files missing one or more of these fields.
Format: file path | missing fields (comma-separated)
```

**Fix:** Add the missing fields. Use the Templates in `03_RESOURCES/Templates/` as a reference.

---

## Check 4 — Notes with no outbound links

**What:** Notes that contain no wikilinks (`[[...]]`) pointing to other notes.

**Why it matters:** Unlinked notes don't contribute to the graph. They're dead ends that fragment the knowledge network.

**Agent prompt:**
```
Scan every .md file in 02_AREAS/ and 03_RESOURCES/.
For each file, check whether the body contains at least one wikilink in [[...]] format.
List all files with zero outbound wikilinks.
Format: file path | note title | suggested notes to link to (based on content keywords)
```

**Fix:** Add at least 2–3 relevant wikilinks to each isolated note. Add a "Related" section if one doesn't exist.

---

## Check 5 — Duplicate concepts

**What:** Notes with very similar titles or heavily overlapping content, suggesting the same concept has been written twice.

**Why it matters:** Duplicates split search results and create maintenance burden — updating one copy doesn't update the other.

**Agent prompt:**
```
Scan all note titles in 03_RESOURCES/ and 02_AREAS/.
Identify pairs of notes that:
  a) Have titles with >60% lexical similarity (e.g. "Getting Started with MCP" and "MCP Getting Started Guide"), OR
  b) Share 3+ identical headings (## sections), OR
  c) Contain largely the same factual content when summarised.
List suspected duplicate pairs.
Format: note A path | note B path | similarity reason
```

**Fix:** Merge the weaker note into the stronger one. Add a redirect wikilink in the merged note's location: `Merged into [[Target Note]].`

---

## Check 6 — Inconsistent tag usage

**What:** Tags that appear only once, tags that overlap in meaning, or tags that don't follow `kebab-case`.

**Why it matters:** Messy tags make filtering unreliable and the tag cloud meaningless.

**Agent prompt:**
```
Collect every tag from every .md file's frontmatter `tags:` list.
Produce three lists:
  1. Tags appearing only once (singleton tags) — potential one-offs to remove or consolidate
  2. Tags that appear to be near-duplicates (e.g. "ai-agent" and "ai-agents", "mcp" and "model-context-protocol")
  3. Tags that do not follow kebab-case (e.g. "AIAgent", "MCP_server")
For each issue, suggest the canonical tag to use.
```

**Fix:** Do a find-and-replace in the affected files to standardise tags. Update the canonical tag list in `CLAUDE.md` if needed.

---

## Check 7 — Uncompiled raw sources

**What:** Files in `05_RAW/` that are older than 7 days and still have `status: pending`.

**Why it matters:** Raw sources sitting uncompiled represent captured knowledge that isn't yet accessible in the wiki.

**Agent prompt:**
```
Scan all .md files in 05_RAW/.
For each file, check:
  a) The date in the filename (YYYYMMDD prefix) OR the `created` frontmatter field
  b) The `status` frontmatter field
List all files where the date is more than 7 days ago AND status is "pending" (not "compiled").
Format: file path | date | topic folder | source_type
Sort by date ascending (oldest first).
```

**Fix:** Run the [[Raw Ingest to Wiki]] playbook on the overdue topic folders.

---

## Health report template

After running all checks, produce a report in this format and save it to `00_INBOX/_health-report-YYYYMMDD.md`:

```markdown
---
id: YYYYMMDDHHMMSS
type: note
status: active
created: YYYY-MM-DD HH:MM
tags:
  - health-check
  - maintenance
area: system
---
# Wiki Health Report — YYYY-MM-DD

## Summary

| Check | Status | Issues Found |
|-------|--------|-------------|
| Orphaned notes | ✓ / ⚠️ / ✗ | N |
| Stub notes | ✓ / ⚠️ / ✗ | N |
| Missing frontmatter | ✓ / ⚠️ / ✗ | N |
| No outbound links | ✓ / ⚠️ / ✗ | N |
| Duplicate concepts | ✓ / ⚠️ / ✗ | N |
| Inconsistent tags | ✓ / ⚠️ / ✗ | N |
| Uncompiled raw sources | ✓ / ⚠️ / ✗ | N |

**Overall health:** 🟢 Good / 🟡 Needs attention / 🔴 Critical

## Orphaned Notes
(list)

## Stub Notes
(list)

## Missing Frontmatter
(list)

## No Outbound Links
(list)

## Duplicate Concepts
(list)

## Tag Issues
(list)

## Uncompiled Raw Sources
(list)

## Recommended Actions
1. ...
2. ...
```

**Status key:**
- ✓ = 0 issues
- ⚠️ = 1–5 issues (low priority)
- ✗ = 6+ issues (fix soon)

You can also run the automated script for checks 1, 2, 3, 4, and 7:
```bash
cd /path/to/agentos
node 01_PROJECTS/agentos_web/wiki-health-check.js --write-report
```
