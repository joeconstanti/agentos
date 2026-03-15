---
description: Open a vault note in Obsidian by path or name
argument-hint: <path-or-note-name>
allowed-tools: [Bash, Glob, Grep]
---

Open the specified note in Obsidian using the URI scheme.

## Steps

1. If an argument was provided, search for a matching note in the vault:
   - Try exact path match first: `$ARGUMENTS`
   - If not found, use Glob to find `**/*$ARGUMENTS*.md` (excluding node_modules)
   - If multiple matches, show the list and ask which one to open
   - If no match, tell the user and offer to create it

2. Open the matched note:

```bash
FILE="<matched relative path>"
ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$FILE")
open "obsidian://open?vault=agentos&file=$ENCODED"
```

3. If no argument was provided, open the vault root:

```bash
open "obsidian://open?vault=agentos"
```

Confirm what was opened.
