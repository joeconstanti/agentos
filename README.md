```text
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗ ██████╗ ███████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔════╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║   ██║███████╗
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║╚════██║
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ╚██████╔╝███████║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚══════╝
```

[![GitHub stars](https://img.shields.io/github/stars/automatedigital/agentos?style=flat-square)](https://github.com/automatedigital/agentos/stargazers)
[![CI](https://img.shields.io/github/actions/workflow/status/automatedigital/agentos/ci.yml?style=flat-square&label=CI)](https://github.com/automatedigital/agentos/actions)
[![License](https://img.shields.io/github/license/automatedigital/agentos?style=flat-square)](https://github.com/automatedigital/agentos/blob/main/LICENSE)

## AgentOS

AgentOS is a practical workspace for AI-assisted knowledge work.

It combines:
- your files as a durable knowledge vault
- Obsidian for navigation and linking
- AI agents (Claude Code, Codex, Gemini CLI, OpenCode, and more)
- reusable agent skills and playbooks

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/joeconstanti/agentos/main/install.sh | bash
```

Installs to `~/agentos` by default. To choose a custom location:

```bash
curl -fsSL https://raw.githubusercontent.com/joeconstanti/agentos/main/install.sh | bash -s -- ~/my-workspace
```

Or clone the repository first:

```bash
git clone https://github.com/joeconstanti/agentos.git ~/agentos
cd ~/agentos
./install.sh
```

The installer will:
- Create the standard vault folder structure
- Prompt you to install Obsidian (automatically, manually, or skip)
- Attempt to open the vault in Obsidian

## Vault Layout

Following the PARA methodology (Projects, Areas, Resources, Archives):

- `00_INBOX/` capture inbox for new items, unsorted notes, quick captures
- `01_PROJECTS/` active projects with specific goals and deadlines
- `02_AREAS/` ongoing areas of responsibility and standards
- `03_RESOURCES/` reference materials, research, knowledge base
- `04_ARCHIVE/` completed projects and retired work

## Why this repo

- **File-first context**: your work is versionable and long-lived
- **Tool-agnostic**: any filesystem-capable agent can collaborate here
- **Obsidian-native**: backlinks, graph view, and templates work naturally
- **Skill-powered**: capabilities compound as you add reusable skills

## Supported Agents

- [[Claude Code]]
- [[Codex]]
- [[Gemini CLI]]
- [[Cursor]]
- [[OpenCode]]
- [[Custom MCP-backed agents]]

## Typical Workflow

1. Capture notes and requirements in `notes/` and `specs/`
2. Run your agent in this repo for full workspace context
3. Save reusable workflows in `playbooks/`
4. Keep outcomes discoverable and linked in Obsidian

If you want a durable, agent-friendly workspace instead of chat-only output, start here.
