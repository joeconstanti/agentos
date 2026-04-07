---
id: 20260325090000
type: note
status: draft
created: 2026-03-25 09:00
updated: 2026-03-25 11:00
tags:
  - docs
  - guides
  - claude
  - obsidian
area: docs
---
# Claude Code with Obsidian

Claude Code is Anthropic's CLI agent. When you run it from your vault root, it can read, search, create, and modify notes directly — turning your vault into a live, AI-assisted workspace.

> [!TIP] This vault is already configured
> This vault has a `CLAUDE.md` at the root that loads into every Claude Code session, giving Claude full context about the PARA structure, note conventions, and available tools.

## Integration approaches

There are three ways to connect Claude Code to Obsidian, ranging from lightweight to heavy:

| Approach | Context cost | Best for |
|----------|-------------|----------|
| **Obsidian CLI + Skills** | Low | Day-to-day workflows, automation |
| **URI scheme** | None | Opening and creating notes from scripts |
| **MCP (REST API)** | High | Live app state, advanced plugin control |

**The recommended approach is the Obsidian CLI combined with Claude Skills.** MCP is powerful but injects a lot of tool definitions into the context window, which burns tokens and can crowd out your actual task. The CLI gives you direct control over the running Obsidian app at a fraction of the cost.

---

## 1) Start Claude Code in the vault

```bash
# From anywhere
claude --dir ~/Developer/github/agentos

# Or cd in first
cd ~/Developer/github/agentos && claude
```

When launched from the vault root, Claude reads `CLAUDE.md` automatically and knows the full PARA structure, note conventions, and how to use the CLI.

---

## 2) Use the Obsidian CLI (recommended)

The official Obsidian CLI (available since v1.12.4, February 2026) is a remote control interface for a running Obsidian app. Claude can call it directly to open notes, search the vault, append content, apply templates, and run JavaScript — without any MCP server.

```bash
# Syntax
obsidian <command> [key=value] [flags]

# Run obsidian help to see all commands (always up to date)
obsidian help
```

### Key commands

**Navigation**
```bash
obsidian open file="01_PROJECTS/my-project/index.md"
obsidian daily                          # open today's daily note
obsidian search query="meeting notes"
```

**Creating and editing notes**
```bash
obsidian create name="Trip to Paris" template=Travel
obsidian append file="My Note" content="New line"
obsidian daily:append content="- [ ] Review PR"
```

**Metadata and structure**
```bash
obsidian property:set name="status" value="done" file="My Note"
obsidian tags counts                    # list all tags with counts
obsidian backlinks file="My Note"
```

**Developer / power commands**
```bash
obsidian eval "app.vault.getMarkdownFiles().length"
obsidian plugin:reload id=my-plugin
obsidian tasks daily                    # list tasks from today's note
```

> [!NOTE] Obsidian must be running
> The CLI passes through Obsidian's internal API. If Obsidian isn't running, the CLI will launch it automatically.

---

## 3) Use Claude Skills for Obsidian

Skills are loaded into Claude's context on demand to give it vault-specific knowledge and procedures. They keep context lean — you only load what's needed for the current task.

The Obsidian skills available in this vault:

| Skill | What it does |
|-------|-------------|
| `obsidian` | General vault operations — PARA navigation, URI scheme, CLI usage |
| `ob-new` | Create a new note (defaults to `00_INBOX/`) |
| `ob-open` | Open a vault note in Obsidian by path or name |
| `ob-search` | Search the vault and show matching notes |
| `ob-daily` | Open today's daily note (creates it if it doesn't exist) |

**Load a skill** before asking Claude to do vault work:

```bash
npx openskills read obsidian
npx openskills read ob-new,ob-search   # load multiple at once
```

Or invoke as a slash command inside a Claude session:

```
/ob-daily
/ob-search
```

Skills can also live inside the vault itself at `.claude/skills/` — useful for vault-specific workflows that you want to version alongside your notes.

---

## 4) URI scheme (lightweight scripting)

For shell scripts and automations that don't need the full CLI, the Obsidian URI scheme is zero-overhead — no context cost at all.

```bash
# Open a note
open "obsidian://open?vault=agentos&file=01_PROJECTS/my-project"

# Create a new note with content
open "obsidian://new?vault=agentos&path=00_INBOX/my-note&content=Hello"

# Append to an existing note
open "obsidian://new?vault=agentos&name=my-note&content=More%20text&append=true"

# Create silently (don't focus the UI)
open "obsidian://new?vault=agentos&name=my-note&content=Hello&silent=true"

# Open vault search
open "obsidian://search?vault=agentos&query=agents"

# Open today's daily note
open "obsidian://daily"
```

URI-encode all values: `%20` for spaces, `%2F` for `/`.

---

## 5) MCP — when to use it

> [!WARNING] High context cost
> MCP injects all tool definitions into the context window at session start. For long sessions or large vaults, this can consume a significant chunk of the context budget before you've typed anything.

Use MCP only when you specifically need:
- **Live app state** (e.g. which note is currently open, active graph filters)
- **Plugin API access** (e.g. triggering Dataview queries, Templater commands)
- **Bidirectional sync** (reading and writing in response to UI events)

For everything else — reading files, creating notes, searching, batch updates — the CLI and URI scheme are faster, cheaper, and more reliable.

---

## 6) CLAUDE.md as persistent context

The `CLAUDE.md` at the vault root is loaded into every Claude Code session. Keep it accurate so Claude always knows:
- The PARA folder structure and where things live
- Frontmatter schema and tag conventions
- Timestamp filename format (`YYYYMMDDHHMMSS-slug.md`)
- Which skills are available and when to use them
- Any project-specific conventions

---

## 7) Practical workflows

### Daily note + task capture
```
/ob-daily
Add a new task: "Review the Q2 roadmap doc"
```

### Link enrichment
```
npx openskills read obsidian
Scan [[My Meeting Notes]] and add wikilinks to every person, project, and book mentioned.
Create stubs in 00_INBOX/ for anything that doesn't have a note yet.
```

### Weekly synthesis
```
Read my last 7 daily notes and write a summary of themes, open tasks,
and decisions into 01_PROJECTS/weekly-review/2026-W13.md
```

### Batch frontmatter update
```
Find all notes with status: draft created before 2026-01-01 and update
their status to archive. Show me the list before making changes.
```

### Research capture
```
Fetch [URL], extract the key ideas, and write a structured note into
03_RESOURCES/Clippings/ with correct frontmatter.
```

---

## Tips

- **Load skills first**: Run `npx openskills read obsidian` at the start of vault-heavy sessions so Claude knows the CLI syntax and PARA conventions.
- **Scope with folders**: Tell Claude to work only within a specific folder to avoid unintended edits across the full vault.
- **Review before bulk operations**: Ask Claude to list what it plans to do before executing any command that touches many notes.
- **Don't modify `.obsidian/`**: Plugin configs and hotkeys live there and affect all users. Claude should read but not write to that directory.
- **Prefer CLI over raw file edits**: When Obsidian is running, using `obsidian append` or `obsidian property:set` is safer than directly editing `.md` files — Obsidian's change detection handles syncing and history correctly.

---
