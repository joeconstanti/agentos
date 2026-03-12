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

### AgentOS — Personal Agentic Workspace for Knowledge Work

**AgentOS** is your **personal operating system for knowledge work**: a lightweight, extensible workspace where AI agents, tools, and your own workflows plug together into a single environment.

- **For knowledge workers**: researchers, builders, writers, engineers, founders.
- **For real projects**: specs, notes, experiments, automations, and code.
- **For multi-agent workflows**: Cursor, Claude Code, Antigravity, and more, all pointed at the same workspace.

---

### Why this repo exists

Modern knowledge work is:

- **Fragmented** across docs, chats, scratchpads, and repos.
- **Opaque** to agents (they can’t see your “real” working context).
- **Hard to reuse** (insights and decisions get lost in history).

This repo is meant to be a **living home base** where:

- **Your artifacts live**: notes, specs, research, datasets, prompts, scripts.
- **Your agents collaborate**: different tools share the same structure and conventions.
- **Your workflows solidify**: from “one-off clever prompt” to repeatable systems.

Use it as a **starting template** for a durable agentic workspace you can grow over time.

---

### Core ideas

- **Workspace, not app**: This is a folder-first design. Your tools (Cursor, Claude, terminal, notebooks) all operate on the same files.
- **Artifacts over prompts**: Capture knowledge and decisions as files (docs, specs, playbooks) instead of ephemeral chats.
- **Agents as teammates**: Treat AI tools as collaborators with roles, responsibilities, and interfaces, not just autocomplete.
- **Composable workflows**: Small scripts + conventions > huge platforms. Keep it simple and remixable.

---

### Suggested structure

You can evolve this however you like, but a simple starting point:

- **`/notes`**: Daily notes, scratchpads, meeting logs.
- **`/specs`**: Feature specs, research plans, design docs.
- **`/agents`**: Agent configs, MCP servers, skills, and prompt “contracts”.
- **`/playbooks`**: Step‑by‑step workflows (e.g. “debugging checklist”, “publish a post”, “ship a feature”).
- **`/scripts`**: Small utilities that accelerate your work (data cleaning, report generation, automation).
- **`/archive`**: Closed loops — completed projects and retired artifacts, kept for reference.

Feel free to start with just a couple of these and add more as your needs grow.

---

### How to use this with agents

- **With Cursor / Claude Code**
  - Open this repo as your main workspace.
  - Point agents to specific folders (`notes`, `specs`, `playbooks`) so they can read and update your artifacts.
  - Keep long‑lived docs (e.g. “working agreements”, “coding standards”, “research log”) in versioned files instead of in-chat.

- **With other tools (Antigravity, CLI agents, MCP)**
  - Treat this repo as the **single source of truth** those tools operate on.
  - Store credentials/configs in environment files or secrets managers (never commit secrets).
  - Use `agents/` to define how each tool should behave in this workspace.

---

### Example workflows

- **Designing a feature with agents**
  - Capture the problem and constraints in `specs/<feature>.md`.
  - Use agents to explore options, review tradeoffs, and propose designs directly in that file.
  - Evolve the spec into implementation notes, tasks, and tests.

- **Research & synthesis**
  - Drop raw findings into `notes/research-<topic>.md`.
  - Ask agents to summarize, compare, and extract decisions into `specs/` or `playbooks/`.

- **Personal knowledge base**
  - Keep evergreen concepts (systems, frameworks, mental models) in `notes/` and link to them from specs and playbooks.
  - Periodically refactor: consolidate scattered insights into clearer artifacts.

---

### Principles for working here

- **Make thinking legible**: Prefer writing things down over keeping them in your head or in chat logs.
- **Prefer small, named artifacts**: Many focused docs beat one giant brain dump.
- **Automate the repeatable**: When you do something a third time, capture it as a playbook or script.
- **Keep it tool-agnostic**: This repo should outlive any specific AI product or editor.

---

### Getting started

1. **Clone / init this repo** whenever you start a new machine or environment.
2. **Create just a couple of folders** you’ll actually use next week (probably `notes` and `specs`).
3. **Add a first spec or playbook** (e.g. “How I ship small features with agents”).
4. **Point your agents here** and let them help you refine the structure as you go.

This is your **agentic workspace for serious knowledge work**. Adapt it, break it, and rebuild it to fit how you actually think and build.