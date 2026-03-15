---
description: Create a new note in the Obsidian vault (defaults to 00_INBOX)
argument-hint: [title] [--project|--area|--resource|--archive]
allowed-tools: [Bash, Write]
---

Create a new note in the vault. Defaults to `00_INBOX/` unless a folder flag is given.

## Argument parsing

Parse `$ARGUMENTS`:
- First word(s) before any `--` flag = note title
- `--inbox` or no flag → `00_INBOX/`
- `--project` → `01_PROJECTS/`
- `--area` → `02_AREAS/`
- `--resource` → `03_RESOURCES/`
- `--archive` → `04_ARCHIVE/`

## Steps

1. Generate a timestamp: `TS=$(date +"%Y%m%d%H%M%S")`
2. Slugify the title (lowercase, spaces → hyphens, strip non-alnum)
3. For `00_INBOX/`, filename = `${TS}-${slug}.md`; for other folders, filename = `${slug}.md`
4. Build frontmatter using the timestamp for `id` and `created`
5. Write the file with the Write tool to the correct path
6. Open it in Obsidian:

```bash
ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$PATH")
open "obsidian://open?vault=agentos&file=$ENCODED"
```

## Frontmatter template

```yaml
---
id: <YYYYMMDDHHMMSS>
type: note
status: draft
created: <YYYY-MM-DD HH:MM>
tags: []
area: inbox
---
```

Confirm the note path and that it was opened in Obsidian.
