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

---

## Knowledge Base Workflow (Karpathy Pattern)

This vault implements a two-layer LLM knowledge base, inspired by Andrej Karpathy's approach to personal research wikis.

### The two layers

| Layer | Path | Role |
|-------|------|------|
| **Raw ingest** | `05_RAW/` | Unprocessed source material — web clips, papers, repos, transcripts |
| **Compiled wiki** | `03_RESOURCES/` | Structured, interlinked wiki articles produced by agents from the raw layer |

**Key principle:** Humans drop raw sources into `05_RAW/`. Agents compile them into `03_RESOURCES/`. You rarely write wiki articles manually — that's the agent's job.

### When to write where

- **Drop into `05_RAW/_topics/<topic>/`** when: you've clipped a web article, downloaded a paper, saved a repo README, or have any unstructured source you want to eventually compile.
- **Write to `03_RESOURCES/Docs/`** when: you're compiling a raw source, writing a structured reference doc, or the agent has synthesised content from multiple sources.
- **Write to `00_INBOX/`** when: it's a quick capture with no clear home yet.

### Playbooks

Reusable agent workflows live in `03_RESOURCES/Playbooks/`. For the knowledge base workflow:

| Playbook | When to use |
|----------|------------|
| [[Raw Ingest to Wiki]] | Compile raw sources into wiki articles |
| [[Wiki Health Check]] | Lint the vault — find orphans, stubs, broken links, uncompiled sources |
| [[Q&A Against the Wiki]] | Query the compiled wiki for research answers |
| [[Marp Slides Output]] | Turn wiki content into Marp slide decks |

### Health check script

Run periodically to audit vault quality:

```bash
# Terminal report
node 01_PROJECTS/agentos_web/wiki-health-check.js

# Write full report to 00_INBOX/_health-report.md
node 01_PROJECTS/agentos_web/wiki-health-check.js --write-report
```

Checks: orphaned notes · stub notes · missing frontmatter · notes with no links · uncompiled raw sources older than 7 days.

### MOC index files

Each major section has a `_index.md` Map of Content that lists every note with a one-line description. Agents should:
- Read `_index.md` first when navigating a section — it's the fastest way to orient
- Update `_index.md` whenever a new note is added to that section
- Keep descriptions to one line — they're navigation aids, not summaries

Current MOC files:
- `03_RESOURCES/Docs/_index.md`
- `02_AREAS/agents/_index.md`
