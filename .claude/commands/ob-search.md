---
description: Search the Obsidian vault and show matching notes
argument-hint: <query>
allowed-tools: [Bash, Grep, Glob]
---

Search the vault for `$ARGUMENTS` and display results, then open Obsidian's search pane.

## Steps

1. Use Grep to find matches in vault markdown files (exclude node_modules and .obsidian):

```bash
grep -r "$ARGUMENTS" /Users/joe/Developer/github/agentos \
  --include="*.md" \
  -l \
  --exclude-dir=node_modules \
  --exclude-dir=.obsidian \
  --exclude-dir=installer
```

2. Display results as a ranked list (most recently modified first):
   - Show relative path from vault root
   - Show the first matching line for context

3. Open Obsidian search pane with the same query:

```bash
ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$ARGUMENTS")
open "obsidian://search?vault=agentos&query=$ENCODED"
```

4. Summarize: how many notes matched, top results.
