---
name: obsidian
description: Use this skill when working inside an Obsidian vault — opening notes, creating notes, searching the vault, navigating PARA folders, or using the Obsidian URI scheme or CLI. Triggers on phrases like "open in Obsidian", "create a note in Obsidian", "search the vault", "add to inbox", "open today's daily note", or any task involving vault navigation or the obsidian:// URI scheme.
version: 1.0.0
---

# Obsidian Skill

Guidance for navigating and interacting with an Obsidian vault from the CLI.

## Vault Layout (PARA)

```
00_INBOX/       unsorted captures, quick notes, clippings
01_PROJECTS/    active projects (one subfolder per project)
02_AREAS/       ongoing responsibilities (agents, standards)
03_RESOURCES/   reference docs, templates, excalidraw, playbooks
04_ARCHIVE/     completed projects, retired notes
```

When writing or placing a note, pick the folder based on:
- No clear home yet → `00_INBOX/`
- Active deliverable → `01_PROJECTS/<project>/`
- Ongoing reference/standard → `02_AREAS/`
- Reference material or resource → `03_RESOURCES/`
- Done/retired → `04_ARCHIVE/`

## Note Frontmatter

Every note should have:
```yaml
---
id: YYYYMMDDHHMMSS
type: note          # or: project, area, resource, agent, template
status: draft       # or: active, done, archived
created: YYYY-MM-DD HH:MM
tags:
  - kebab-case-tags
area: <area-name>
---
```

Filename convention for inbox captures: `YYYYMMDDHHMMSS-slug.md`

## Obsidian URI Scheme

Obsidian must be running for URI actions to work. All values must be URI-encoded (`%20` for spaces, `%2F` for `/`).

### Open a vault or note

```bash
# Open vault root
open "obsidian://open?vault=agentos"

# Open a specific note (path from vault root, .md optional)
open "obsidian://open?vault=agentos&file=02_AREAS/agents/Claude%20Code"

# Open by absolute path
open "obsidian:///Users/joe/Developer/github/agentos/00_INBOX/my-note.md"

# Shorthand: obsidian://vault/<vault>/<file>
open "obsidian://vault/agentos/01_PROJECTS/my-project"
```

### Create a new note

```bash
# Create note at path
open "obsidian://new?vault=agentos&path=00_INBOX/my-note&content=Hello"

# Create silently (don't switch focus to Obsidian)
open "obsidian://new?vault=agentos&path=00_INBOX/my-note&content=Hello&silent=true"

# Append to existing note
open "obsidian://new?vault=agentos&name=my-note&content=More%20content&append=true"

# Prepend to existing note
open "obsidian://new?vault=agentos&name=my-note&content=New%20top&prepend=true"

# Pull content from clipboard
open "obsidian://new?vault=agentos&name=my-note&clipboard=true"
```

### Search the vault

```bash
open "obsidian://search?vault=agentos&query=agents"
open "obsidian://search?vault=agentos&query=status%3Adraft"
```

### Daily note

```bash
# Open / create today's daily note
open "obsidian://daily"

# Append to today's daily note
open "obsidian://new?vault=agentos&daily=true&append=true&content=New%20entry"
```

### URI encoding helper

When building URIs in bash, use Python to encode values:

```bash
encode() {
  python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$1"
}

# Example: open a note with a space in the path
open "obsidian://open?vault=agentos&file=$(encode "02_AREAS/agents/Claude Code")"
```

## Obsidian CLI (v1.12.4+)

The `obsidian` binary acts as a remote control for the running Obsidian app.

```bash
# Command syntax
obsidian <command> [key=value] [flag]

# Open a file
obsidian open file="01_PROJECTS/my-project/index.md"

# Search
obsidian search query="backlinks"

# Open / create daily note
obsidian daily

# Evaluate Obsidian plugin API directly
obsidian eval "app.vault.getMarkdownFiles().length"

# Target a specific vault
obsidian open file="my-note.md" vault="agentos"
```

## Shell Helpers

### Quick vault navigation

```bash
# Add to ~/.zshrc
ob() {
  local file="${1:-}"
  if [[ -z "$file" ]]; then
    open "obsidian://open?vault=agentos"
  else
    local encoded
    encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$file")
    open "obsidian://open?vault=agentos&file=$encoded"
  fi
}
```

Usage:
```bash
ob                                        # open vault root
ob "02_AREAS/agents/Claude Code"         # open a note
ob "00_INBOX"                            # open inbox folder
```

### Add to inbox

```bash
inbox() {
  local title="$1"
  local content="${2:-}"
  local ts; ts=$(date +"%Y%m%d%H%M%S")
  local slug; slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | tr -cd '[:alnum:]-')
  local path="00_INBOX/${ts}-${slug}.md"
  local encoded_path; encoded_path=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$path")
  local encoded_content; encoded_content=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$content")
  open "obsidian://new?vault=agentos&path=${encoded_path}&content=${encoded_content}&silent=true"
}
```

Usage: `inbox "Research topic" "Initial notes here"`

## Common Patterns

### Finding notes from the CLI

```bash
# Find notes by keyword in content
grep -r "keyword" ~/Developer/github/agentos --include="*.md" -l

# Find notes by tag in frontmatter
grep -r "tags:.*#project" ~/Developer/github/agentos --include="*.md" -l

# List all notes modified today
find ~/Developer/github/agentos -name "*.md" -newer ~/Developer/github/agentos/.git/index -not -path "*/node_modules/*"
```

### Reading a note

Use the Read tool with the absolute path:
```
Read: /Users/joe/Developer/github/agentos/02_AREAS/agents/Claude Code.md
```

### Writing a new note from Claude Code

1. Choose the right folder (PARA rules above)
2. Use the Write tool to create the file with proper frontmatter
3. Optionally open it in Obsidian: `open "obsidian://open?vault=agentos&file=<path>"`

## Wikilinks

Obsidian uses `[[Note Name]]` wikilinks. When writing note content:
- Link to other notes: `[[Claude Code]]`
- Link to a heading: `[[Claude Code#Key Features]]`
- Display text: `[[Claude Code|Claude's CLI]]`
- Agent profiles: `[[Claude Code]]`, `[[Codex]]`, `[[Cursor]]`, `[[Gemini CLI]]`

## Do Not Modify

- `.obsidian/` — Obsidian app config (plugins, hotkeys, themes). Changes are global.
- `installer/node_modules/` — installer deps, ignore entirely.
