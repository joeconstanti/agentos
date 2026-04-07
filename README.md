```text
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗ ██████╗ ███████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔════╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║   ██║███████╗
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║╚════██║
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ╚██████╔╝███████║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚══════╝
```

## AgentOS

AgentOS is a **persistent brain for your AI agents** — a structured knowledge vault that any agent can read, write, and reason over. Use it with one agent or many; it serves as unified memory across all of them.

It combines:

- **Durable file-based memory** — knowledge persists across sessions, tools, and model versions
- **Obsidian** for human navigation, linking, and graph visualization
- **Any AI agent** — Claude Code, Codex, Gemini CLI, Cursor, OpenCode, and more
- **Reusable skills and playbooks** — agent capabilities compound over time

> Think of AgentOS as long-term memory that travels with your work, not locked inside any single chat window.

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/joeconstanti/agentos/main/install.sh | bash
```

Or clone first:

```bash
git clone https://github.com/joeconstanti/agentos.git ~/agentos
cd ~/agentos
./install.sh
```

The installer will:

- Prompt for a clone directory (default: `~`), cloning to `<directory>/agentos`
- Install Obsidian if needed (`brew install --cask obsidian` on macOS, `sudo snap install obsidian --classic` on Linux)
- Open the repo in Obsidian as a vault

## How It Works as a Unified Brain

Each agent reads the same vault when it starts. Notes, decisions, research, and playbooks written by one agent are immediately available to any other. There's no proprietary memory format — everything is plain Markdown files in a git repo.

```
You / Agent A writes a decision → 02_AREAS/ or 03_RESOURCES/
Agent B picks it up on next session → reads the same files
You review everything in Obsidian → backlinks, graph, search
```

The vault is version-controlled, so memory is auditable and reversible.

## Vault Layout

Following the PARA methodology (Projects, Areas, Resources, Archives):

| Folder | Purpose |
|--------|---------|
| `00_INBOX/` | Capture inbox — quick notes, clippings, unsorted captures |
| `01_PROJECTS/` | Active projects with goals and deadlines |
| `02_AREAS/` | Ongoing areas of responsibility — agent profiles, standards |
| `03_RESOURCES/` | Compiled knowledge base, docs, templates, playbooks |
| `04_ARCHIVE/` | Completed projects and retired work |
| `05_RAW/` | Unprocessed source material for agents to compile |

### Key locations

| Path | What lives here |
|------|----------------|
| `02_AREAS/agents/` | One profile per agent (capabilities, config, notes) |
| `03_RESOURCES/Docs/` | Structured reference docs |
| `03_RESOURCES/Playbooks/` | Reusable agent workflows |
| `03_RESOURCES/Templates/` | Note templates |
| `05_RAW/_topics/` | Raw ingest — web clips, papers, transcripts |

## Knowledge Base Workflow

AgentOS implements a two-layer knowledge base (inspired by Andrej Karpathy's personal research wiki approach):

- **`05_RAW/`** — drop unprocessed sources here (articles, papers, READMEs)
- **`03_RESOURCES/`** — agents compile those sources into structured wiki articles

Humans capture; agents compile. The compiled wiki becomes shared memory for all future sessions.

## Why AgentOS

- **Unified memory** — one vault, many agents, no context lost between sessions
- **Tool-agnostic** — any agent that can read files can participate
- **Version-controlled** — memory is git-tracked, auditable, and rollback-able
- **Obsidian-native** — backlinks, graph view, and search work out of the box
- **Skill-powered** — reusable skills extend what agents can do

## Supported Agents

- [Claude Code](02_AREAS/agents/Claude%20Code.md)
- [Codex](02_AREAS/agents/Codex.md)
- [Gemini CLI](02_AREAS/agents/Gemini%20CLI.md)
- [Cursor](02_AREAS/agents/Cursor.md)
- [OpenCode](02_AREAS/agents/OpenCode.md)
- [Custom MCP-backed agents](02_AREAS/agents/Custom%20MCP-backed%20agents.md)

## Typical Workflow

1. Drop raw sources or quick notes into `00_INBOX/` or `05_RAW/`
2. Run an agent — it reads the vault for context, then writes findings back
3. Browse memory in Obsidian — graph view shows how ideas connect
4. Add reusable workflows to `03_RESOURCES/Playbooks/` as you go

If you want a persistent, agent-friendly brain instead of one-off chat output, start here.
