---
id: 20260406090900
type: note
status: draft
created: 2026-04-06 09:09
tags:
  - docs
  - guides
  - agentos
  - workflow
  - daily
  - obsidian
area: docs
---
# AgentOS Daily Workflow

AgentOS is most useful when it becomes a habit — a daily rhythm of capture, delegation, review, and synthesis. This guide describes a practical day-to-day workflow for using the vault and AI agents together, so that the system works for you rather than the other way around.

The goal is a low-friction loop: capture everything, delegate everything you can, review what matters, and let the agents handle the rest.

## Morning routine (~10 minutes)

### 1. Open the daily note

```bash
# From terminal
cd ~/Developer/github/agentos && claude

# Or via Obsidian CLI
obsidian daily
```

Your daily note is the hub. It anchors everything that happens that day — tasks, captures, meeting notes, agent dispatches.

### 2. Review inbox

Check `00_INBOX/` for anything that landed yesterday and wasn't processed:

```
/ob-search folder:00_INBOX
```

For each item, decide: process it now, delegate to an agent, or leave it for later. The rule: nothing should stay in the inbox more than 48 hours.

### 3. Scan open projects

Glance at `01_PROJECTS/` for tasks that need attention today. The [[How to use Obsidian]] note covers the Tasks query syntax for pulling open items across the vault.

### 4. Set your intention

Add 1–3 focus items to today's daily note. Keep it honest — don't plan a full day, plan three things you actually intend to do.

## Delegating to agents

The core habit: when a task has a clear, delegatable definition, hand it off immediately rather than queuing it for later.

### Types of tasks worth delegating

**Research and synthesis** — "Summarise the last 3 weeks of notes tagged #client-x and write a project status into `01_PROJECTS/client-x/status.md`."

**Note creation** — "Fetch `[URL]`, extract the key ideas, and create a structured note in `03_RESOURCES/Clippings/`."

**Batch processing** — "Find all notes in `00_INBOX/` with no frontmatter tags. For each one, infer the most appropriate tags and add them."

**Analysis** — "Compare my notes on RAG and fine-tuning and write a decision framework into `03_RESOURCES/Notes/rag-vs-finetuning.md`."

**Formatting and cleanup** — "Find all notes with status: draft created before 2025-01-01 and update their status to archive."

### How to dispatch

From a Claude Code session at the vault root:

```
npx openskills read obsidian
[paste your task description]
```

From Claude Code with MCP active, you can also trigger n8n workflows or use the filesystem MCP to automate multi-step batch tasks.

## During the day

### Capture fast, process later

The discipline: capture everything into `00_INBOX/`. Don't try to file, tag, or link it perfectly in the moment. Use quick note creation:

```bash
obsidian create name="Quick capture: [topic]"
```

Or via the Obsidian mobile app — it syncs into the vault and Claude Code picks it up in the next session.

### Use the daily note as a scratchpad

Append thoughts, links, task completions, and agent dispatches to today's daily note. It becomes a searchable record of everything that happened.

```bash
obsidian daily:append content="- Delegated status report to Claude"
```

### Keep agents focused

When delegating a task, be specific. The more precise the scope, the more reliable the output. The [[Prompt Engineering for Agents]] note has the patterns that work best.

## Evening review (~15 minutes)

### Process the inbox

Empty `00_INBOX/` or schedule items that need processing tomorrow.

### Update project notes

For any active project that moved today, add a brief update (2–3 lines, a bullet list) to the project index note.

### Write the daily note summary

Ask Claude to synthesise your daily note into a brief review:

```
Read today's daily note and write a 3–5 sentence summary of what happened,
what was completed, and what carries over to tomorrow.
Append it to the note under a ## Summary heading.
```

## Weekly review (~30 minutes)

Once a week, do a deeper synthesis:

```
Read all daily notes from this week (look in 00_INBOX/ or use the periodic notes
folder structure). Write a weekly review into 01_PROJECTS/weekly-review/[date].md
with sections: Wins, Open loops, Decisions made, Next week priorities.
```

The [[Top 10 Claude Code Skills]] note covers skills that automate parts of this ritual.

## Staying in sync across vaults

If you work across multiple machines or vaults, use a sync strategy that doesn't break Obsidian's internal links:

- **iCloud / Obsidian Sync** — easiest, preserves .obsidian/ settings per device
- **Git** — version control + conflict resolution; use `.gitignore` to exclude `.obsidian/workspace.json` which changes every session
- **Syncthing** — fast, peer-to-peer, no cloud; good for privacy-sensitive vaults

For Claude Code to work correctly from multiple machines, keep the `CLAUDE.md` and `.claude/skills/` under git — they're the shared context layer.

---

## Recommended Obsidian Plugins

These community plugins make a meaningful difference in an AI-agent-heavy workflow. Install them via Settings → Community Plugins → Browse.

**Templater** — a powerful templating engine that goes far beyond Obsidian's built-in templates. It supports JavaScript expressions, dynamic variables (current date, clipboard content, cursor position), and scripts. Essential for consistent frontmatter on new notes — pair it with a PARA template library so every new note starts with the correct structure.

**Dataview** — treats your vault as a queryable database. Write `dataview` code blocks to generate dynamic tables, lists, and calendars from frontmatter fields. Used in the AgentOS vault for project dashboards, task views, and status rollups. Works beautifully alongside Claude agents — Claude writes the notes; Dataview surfaces them.

**Tasks** — a task management layer built into Obsidian. Add due dates, recurrence, priorities, and tags to checkbox items. Query tasks across the entire vault with filters. Pairs with Dataview for custom task dashboards. The daily workflow above uses Tasks queries on the daily note template.

**Commander** — adds custom commands and buttons to the ribbon, toolbar, and note headers. In an agentic workflow, this means one-click shortcuts for "Open daily note", "Dispatch inbox review to Claude", and other frequent actions. Removes friction from the capture and review rituals.

**Omnisearch** — full-text search that actually works. Searches inside PDFs, images (via OCR), and note bodies with ranking by relevance. Replaces Obsidian's built-in search for anything beyond simple queries. Useful when you need to find a note by content and don't remember the title or tags.

**Local REST API** — exposes your vault via a local HTTP API on `localhost:27123`. This is how Claude Code and other agents read and write notes programmatically in real time, without the file system race conditions you get from direct writes while Obsidian is running. Required for the MCP-based Obsidian integration — see [[Claude Code with Obsidian]].

**QuickAdd** — a macro system for Obsidian. Define multi-step capture flows: prompt for a title, choose a template, insert at the correct PARA location, and open the note. Great for rapid structured capture (meeting notes, book annotations, project stubs) that would otherwise require several clicks.

**Periodic Notes** — extends Obsidian's daily notes to weekly, monthly, quarterly, and yearly notes. Each period gets its own template and folder. In the AgentOS workflow, weekly reviews live in a `weekly/` subfolder managed by Periodic Notes — Claude reads and writes them by navigating the consistent file structure.

**Custom Frames** — embeds any web app as a panel inside Obsidian (an iframe in a sidebar or tab). Useful for keeping a Claude chat interface, a Notion view, or a n8n dashboard visible while working in the vault. Reduces context switching without leaving Obsidian.

**Terminal** — runs a real shell terminal inside Obsidian. This means you can run `claude` or `obsidian` CLI commands without switching to a separate terminal window. In practice: open a note, spot a task, dispatch it to Claude from the same window. Keeps the workflow tight.

---

## Related notes

- [[Claude Code with Obsidian]] — deep dive on the CLI and MCP integration
- [[How to use Obsidian]] — core Obsidian concepts if you're new to the app
- [[Claude Skills]] — the skills available in this vault and how to load them
- [[Top 10 Claude Code Skills]] — the most useful skills for day-to-day work
