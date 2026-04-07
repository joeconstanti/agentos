---
id: 20260325090100
type: note
status: draft
created: 2026-03-25 09:01
tags:
  - docs
  - guides
  - agents
  - ai
area: docs
---
# AI Coding Agent Alternatives

Beyond Claude Code, there are several strong terminal-based AI coding agents. Each has a different model, UX, and pricing model. This doc covers the three most used: **OpenCode**, **Codex CLI**, and **Gemini CLI**.

## Quick comparison

| Agent | Provider | Model(s) | Pricing | Open Source |
|-------|----------|----------|---------|-------------|
| Claude Code | Anthropic | Claude Sonnet/Opus | API usage or subscription | No |
| Codex CLI | OpenAI | GPT-4o, o3 | ChatGPT Plus/Pro/Team/API | No |
| Gemini CLI | Google | Gemini 2.5 Pro/Flash | Free tier + API | Yes |
| OpenCode | Community | 75+ providers | Free (OSS) | Yes |

---

## OpenCode

**What it is**: An open-source, Go-based terminal agent with a full TUI (Terminal User Interface). It supports 75+ AI providers — more than any other terminal coding agent.

**Install**:
```bash
# Homebrew (Mac/Linux)
brew install opencode-ai/tap/opencode

# npm
npm install -g opencode-ai

# Installer script
curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | bash
```

**Key features**:
- Supports Claude, GPT, Gemini, local (Ollama) models, and 70+ others via `models.dev`
- Multi-session support — run parallel agents on the same project
- LSP integration — language servers are auto-configured for the LLM
- Vim-mode editor, persistent SQLite session storage
- Privacy-first: no code or context data leaves your machine by default
- Session sharing via shareable links

**Best for**: Teams that want model flexibility, privacy, or need to switch between providers without changing tools.

**Docs**: [opencode.ai/docs](https://opencode.ai/docs/)

---

## Codex CLI (OpenAI)

**What it is**: OpenAI's intentionally lightweight terminal agent. It stays close to the shell — no heavy TUI, just a fast, local agent that reads and executes tasks in your terminal.

**Install**:
```bash
npm install -g @openai/codex
```

**Key features**:
- Powered by GPT-4o and o3
- Minimal, low-friction interface — designed to get out of the way
- Strong code generation and reasoning with o3 on complex tasks
- Included with ChatGPT Plus/Pro/Team/Enterprise subscriptions
- Supports `AGENTS.md` and `SKILL.md` files (cross-compatible with Claude Code skills)

**Limitations**:
- UX is more spartan than Claude Code or OpenCode
- Less agentic autonomy out of the box — needs more manual prompting for multi-step tasks

**Best for**: ChatGPT subscribers who want a quick terminal interface to GPT-4o/o3 without extra cost.

**Docs**: [platform.openai.com/docs/codex](https://platform.openai.com/docs/codex)

---

## Gemini CLI (Google)

**What it is**: Google's open-source terminal agent powered by Gemini models. Stands out with a **genuinely generous free tier** — 60 requests/minute and 1,000 requests/day with just a Google account.

**Install**:
```bash
npm install -g @google/gemini-cli
# or
npx @google/gemini-cli
```

**Authenticate**:
```bash
gemini auth login   # opens browser for Google OAuth
```

**Key features**:
- Gemini 2.5 Pro with a 1M token context window — best for large-context refactors and monorepo navigation
- Free tier is genuinely usable (not just trial credits)
- Fast iteration on UI and frontend tasks
- Open source under Apache 2.0
- Supports `GEMINI.md` workspace config file (similar to `CLAUDE.md`)

**Best for**: Large-context tasks, budget-conscious developers, and Google Workspace users.

**Docs**: [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)

---

## Choosing between them

- **Need max context or free usage?** → Gemini CLI
- **Want model flexibility / privacy / open source?** → OpenCode
- **Already on ChatGPT Plus?** → Codex CLI is included, no extra cost
- **Best overall agent UX?** → Claude Code (though it costs more)

## Cross-agent compatibility

Skills written in `SKILL.md` format work across Claude Code, Codex CLI, Gemini CLI, OpenCode, Cursor, and more. See [[Claude Skills]] for details.

---
