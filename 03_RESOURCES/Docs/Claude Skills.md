---
id: 20260325090300
type: note
status: draft
created: 2026-03-25 09:03
tags:
  - docs
  - guides
  - claude
  - skills
  - agents
area: docs
---
# Claude Skills

Skills are reusable bundles of instructions, scripts, and context that an AI agent loads on demand to complete specialized tasks. Think of them like plugins — they teach the agent how to work with a specific tool, follow a specific workflow, or produce output in a specific format.

Skills were introduced by Anthropic in October 2025. In December 2025, Anthropic released the **Agent Skills open standard** (`SKILL.md` format), which was quickly adopted by OpenAI for Codex CLI. Skills now work across Claude Code, Codex, Gemini CLI, OpenCode, Cursor, and more.

## What a skill does

A skill typically contains:
- **Instructions** for how to complete a task (written in Markdown)
- **Scripts or tools** the agent should use (bash, Python, etc.)
- **Context** like API patterns, templates, or brand guidelines

When invoked, the skill file is injected into the agent's context window, giving it the knowledge and procedure to complete the task without you needing to re-explain it every time.

## How to use skills (Claude Code)

Skills are installed to `~/.claude/skills/` and invoked via the `openskills` CLI:

```bash
# Read a skill into context (Claude loads and follows the instructions)
npx openskills read <skill-name>

# Read multiple skills at once
npx openskills read skill-one,skill-two

# List available skills
npx openskills list

# Search skills
npx openskills search "google drive"
```

Inside a Claude Code session, skills can also be invoked as slash commands if configured:

```
/gmail-send
/pdf
/frontend-design
```

## Skills in this vault

This vault has 70+ skills pre-configured in `~/.claude/skills/`. Categories include:

| Category | Examples |
|----------|---------|
| Google Workspace | `gws-gmail`, `gws-calendar`, `gws-drive`, `gws-sheets`, `gws-docs` |
| Documents | `pdf`, `docx`, `xlsx`, `pptx` |
| Design & Frontend | `frontend-design`, `figma`, `theme-factory` |
| Obsidian | `obsidian`, `ob-new`, `ob-open`, `ob-search`, `ob-daily` |
| Development | `mcp-builder`, `skill-creator`, `webapp-testing` |
| Media | `screenshot`, `transcribe` |

See `~/AGENTS.md` for the full catalog.

## Can skills work with other agents?

**Yes — since December 2025, skills are cross-agent by design.**

The `SKILL.md` format is an open standard. Skills written for Claude Code are compatible with:

| Agent | Compatibility |
|-------|--------------|
| Claude Code | Native |
| OpenAI Codex CLI | Full (`SKILL.md` format adopted Dec 2025) |
| Gemini CLI | Full (reads `SKILL.md` and `GEMINI.md`) |
| OpenCode | Full (supports `SKILL.md` via `AGENTS.md`) |
| Cursor | Full |
| Aider | Full |
| Windsurf | Full |

To install a skill for a non-Claude agent, the same `openskills` CLI works:

```bash
# Install for a specific agent
npx openskills install <skill-name> --agent codex
npx openskills install <skill-name> --agent gemini
npx openskills install <skill-name> --agent opencode
```

The skill is placed in the correct config directory for that agent.

## Finding and installing new skills

**Official skills** (maintained by Anthropic):
```bash
# GitHub: https://github.com/anthropics/skills
npx openskills install <skill-name>
```

**Community skills** (1,234+ on OpenSkills):
```bash
npx openskills search <query>
npx openskills install <skill-name>
```

**Marketplace**: [openskills.app/skills](https://openskills.app/skills)

## Building a custom skill

Use the `skill-creator` skill to scaffold a new one:

```
npx openskills read skill-creator
```

A minimal skill file looks like:

```markdown
---
name: my-skill
description: What this skill does and when to use it
version: 1.0.0
---

# My Skill

## When to use
[Describe the trigger conditions]

## Instructions
[Step-by-step instructions for the agent]

## Example
[Optional: an example invocation]
```

Save it to `~/.claude/skills/my-skill.md` and it's immediately available.

## Tips

- Skills are injected into context, so keep them focused — one clear job per skill.
- For multi-step workflows, chain skills together rather than building one giant skill.
- Community skills are frequently updated — run `npx openskills update` to pull latest versions.
- If a skill needs credentials (API keys, OAuth), store them as environment variables, never hardcode in the skill file.

---

## Related

- [[Claude Code with Obsidian]] — How to use Skills within an Obsidian vault workflow
- [[Top 10 Claude Code Skills]] — The most useful skills ranked
- [[AI Coding Agent Alternatives]] — How Skills compare across different agents
- [[Prompt Engineering for Agents]] — Writing effective instructions that complement Skills
