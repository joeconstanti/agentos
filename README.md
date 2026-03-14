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
./install.sh
./scripts/setup-obsidian.sh
```

- `install.sh` launches the interactive setup wizard.
- `setup-obsidian.sh` creates the standard vault folders and attempts to open this repo in Obsidian.

## Vault Layout

- `notes/` daily notes, scratchpads, meeting logs
- `specs/` feature specs, research plans, design docs
- `agents/` agent configs, MCP servers, skills
- `playbooks/` repeatable workflows
- `scripts/` local automation utilities
- `archive/` completed and retired work

## Why this repo

- **File-first context**: your work is versionable and long-lived
- **Tool-agnostic**: any filesystem-capable agent can collaborate here
- **Obsidian-native**: backlinks, graph view, and templates work naturally
- **Skill-powered**: capabilities compound as you add reusable skills

## Supported Agents

- Claude Code
- GitHub Copilot / Codex
- Gemini CLI
- Cursor
- OpenCode
- Custom MCP-backed agents

## Typical Workflow

1. Capture notes and requirements in `notes/` and `specs/`
2. Run your agent in this repo for full workspace context
3. Save reusable workflows in `playbooks/`
4. Keep outcomes discoverable and linked in Obsidian

If you want a durable, agent-friendly workspace instead of chat-only output, start here.
