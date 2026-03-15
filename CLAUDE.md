# CLAUDE.md

Guidance for AI agents working inside this AgentOS vault.

## Vault Structure

This vault follows the PARA methodology. All notes are plain Markdown files.

```
00_INBOX/       capture inbox — unsorted notes, quick captures, clippings
01_PROJECTS/    active projects with specific goals and deadlines
02_AREAS/       ongoing areas of responsibility (agents, standards, etc.)
03_RESOURCES/   reference materials, docs, templates, excalidraw diagrams
04_ARCHIVE/     completed projects and retired work
```

### Key locations

| Path | Purpose |
|------|---------|
| `00_INBOX/` | Drop new notes here when the right home is unclear |
| `01_PROJECTS/` | One subfolder per active project |
| `02_AREAS/agents/` | Agent profiles (Claude Code, Codex, Cursor, Gemini CLI, etc.) |
| `03_RESOURCES/Docs/` | Guides and how-tos (e.g. How to use Obsidian.md) |
| `03_RESOURCES/Templates/` | Note templates |
| `03_RESOURCES/Playbooks/` | Reusable agent workflows |
| `03_RESOURCES/Excalidraw/` | Diagrams |

## Note Conventions

- Frontmatter at the top of every note: `id`, `type`, `status`, `created`, `tags`, `area`
- Link notes with wikilinks: `[[Note Name]]` or `[[Note Name#Heading]]`
- Tags use `#kebab-case`
- Timestamps in filenames: `YYYYMMDDHHMMSS-slug.md` (e.g. `20260314223653-top-10-claude-code-skills.md`)

## Working with Files

When creating a new note, choose the correct folder:
- Unsorted or quick capture → `00_INBOX/`
- Tied to an active deliverable → `01_PROJECTS/<project>/`
- Ongoing reference or standard → `02_AREAS/`
- Reference material, template, or resource → `03_RESOURCES/`
- Done/retired → `04_ARCHIVE/`

Use the Read, Grep, and Glob tools to navigate. The vault root is the working directory when Claude Code is run from here.

## Obsidian CLI

Obsidian (v1.12.4+) exposes a CLI and URI scheme for remote control. Obsidian must be running for URI actions to work.

### URI scheme

All URIs follow: `obsidian://action?param=value&param=value`

URI-encode all values (`%20` for spaces, `%2F` for `/`).

#### Open a vault or file

```bash
open "obsidian://open?vault=agentos"
open "obsidian://open?vault=agentos&file=01_PROJECTS/my-project"
open "obsidian://open?vault=agentos&file=02_AREAS/agents/Claude%20Code"
# Absolute path shorthand
open "obsidian:///Users/joe/Developer/github/agentos/00_INBOX/my-note.md"
```

#### Create a new note

```bash
open "obsidian://new?vault=agentos&name=my-note"
open "obsidian://new?vault=agentos&path=00_INBOX/my-note&content=Hello"
# Append to existing note
open "obsidian://new?vault=agentos&name=my-note&content=More%20text&append=true"
# Create silently (don't open in UI)
open "obsidian://new?vault=agentos&name=my-note&content=Hello&silent=true"
```

#### Search

```bash
open "obsidian://search?vault=agentos&query=agents"
```

#### Daily note

```bash
open "obsidian://daily"
# Append to today's daily note
open "obsidian://new?vault=agentos&daily=true&append=true&content=New%20entry"
```

### CLI commands (obsidian binary)

The `obsidian` binary (when available) is a direct remote control interface.

```bash
# Syntax
obsidian <command> [key=value] [flag]

# Examples
obsidian open file="01_PROJECTS/my-project/index.md"
obsidian search query="backlinks"
obsidian daily
obsidian eval "app.vault.getMarkdownFiles().length"
```

### Helper function

Add to your shell for quick vault navigation:

```bash
# Open a vault note by partial path
ob() {
  local file="${1:-}"
  if [[ -z "$file" ]]; then
    open "obsidian://open?vault=agentos"
  else
    open "obsidian://open?vault=agentos&file=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$file")"
  fi
}
```

Usage: `ob "02_AREAS/agents/Claude Code"`

## Agents in This Vault

Agent profiles live in `02_AREAS/agents/`. Each file has frontmatter with `type: agent`, `provider`, `status`, and links to docs. Supported agents:

- [[Claude Code]] — Anthropic CLI, primary agent for this vault
- [[Codex]] — OpenAI Codex CLI
- [[Cursor]] — AI code editor
- [[Gemini CLI]] — Google Gemini CLI
- [[OpenCode]] — Open-source terminal agent
- [[Custom MCP-backed agents]] — MCP-based custom agents

## Skills

Skills extend agent capabilities. They live in `~/.claude/skills/`.

```bash
npx openskills read <skill-name>
npx openskills read skill-one,skill-two
```

See `~/AGENTS.md` for the full skills catalog.

## Do Not Modify

- `.obsidian/` — Obsidian app config (plugins, hotkeys, themes). Changes affect all users.
- `installer/node_modules/` — Installer dependencies, ignore entirely.
