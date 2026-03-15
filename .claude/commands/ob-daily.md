---
description: Open today's daily note in Obsidian (creates it if it doesn't exist)
allowed-tools: [Bash]
---

Open today's daily note in Obsidian.

## Steps

1. Open the daily note via URI:

```bash
open "obsidian://daily"
```

2. Confirm that the daily note was opened for today's date (`date +"%Y-%m-%d"`).

If the user passed `$ARGUMENTS`, append it to the daily note after opening:

```bash
ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$ARGUMENTS")
open "obsidian://new?vault=agentos&daily=true&append=true&content=$ENCODED"
```
