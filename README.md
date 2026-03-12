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

### AgentOS — Your Personal Vault + AI Agent Workspace

**AgentOS** is a workspace that combines:

- **AI Agents** (Claude Code, Codex, Gemini CLI, OpenCode, etc.) with full context of your vault
- **Obsidian** for beautiful visualization and navigation of your knowledge base
- **Agent Skills** (like Claude Skills) to give your agent superpowers

---

### Quick Start

Get up and running with one simple interactive command:

```bash
./install.sh
```

---

### What makes this different

This repo is your **living knowledge vault** where:

- **Your artifacts live**: notes, specs, research, datasets, prompts, scripts
- **Your agents collaborate**: AI tools share the same structure and conventions
- **Obsidian enhances**: beautiful graphs, links, and visual navigation of your vault
- **Skills amplify**: extend your agent's capabilities with reusable skills

Use it as a **starting template** for a durable agentic workspace you can grow over time.

---

### Vault Structure

The workspace comes with a thoughtful structure that works great with both agents and Obsidian:

- **`/notes`**: Daily notes, scratchpads, meeting logs
- **`/specs`**: Feature specs, research plans, design docs
- **`/agents`**: Agent configs, MCP servers, skills, and capabilities
- **`/playbooks`**: Step‑by‑step workflows and repeatable processes
- **`/scripts`**: Automation utilities that accelerate your work
- **`/archive`**: Completed projects and retired artifacts

Evolve this structure as your needs grow.

---

### Using Agent Skills

Agent Skills are reusable capabilities that extend what your AI agent can do. Store them in `/agents/skills/` and reference them in your workflows.

Examples:
- Web research and synthesis
- Code analysis and refactoring
- Document generation
- Data processing pipelines

Your agent can use these skills as building blocks for complex tasks.

---

### Obsidian Integration

Open this repo in Obsidian to unlock:

- **Graph view**: Visualize connections between notes and specs
- **Backlinks**: See how ideas reference each other
- **Templates**: Quick-start new artifacts
- **Daily notes**: Capture thoughts and link them to your vault

Your agent can read and write these files while you navigate them beautifully in Obsidian.

---

### Supported Agents

Works with any agent that can access your filesystem:

- **Claude Code** (CLI)
- **GitHub Copilot / Codex**
- **Gemini CLI**
- **Cursor**
- **OpenCode**
- **Custom MCP servers**

Point your agent at this workspace and it gains full context of your vault.

---

### Core Principles

- **Vault-first design**: Files over ephemeral chats
- **Agent-augmented**: AI tools as collaborators, not replacements
- **Obsidian-enhanced**: Beautiful visualization meets powerful automation
- **Skill-powered**: Reusable capabilities that compound over time

---

### Next Steps

1. Run `./install.sh` to configure your workspace
2. Open the repo in Obsidian
3. Point your preferred AI agent to this directory
4. Start building your vault

This is your **agentic workspace for serious knowledge work**. Adapt it to fit how you actually think and build.