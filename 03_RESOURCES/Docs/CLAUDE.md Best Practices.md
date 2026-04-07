---
id: 20260406090500
type: note
status: draft
created: 2026-04-06 09:05
tags:
  - docs
  - guides
  - claude
  - claude-md
  - agents
  - conventions
area: docs
---
# CLAUDE.md Best Practices

CLAUDE.md is a Markdown file that Claude Code reads automatically at the start of every session. It's the closest thing to giving Claude a permanent memory of your project — the structure, conventions, key paths, and behaviours that apply to every task, without you having to re-explain them.

A great CLAUDE.md is worth more than an elaborate system prompt. It's always in scope, it's version-controlled alongside your code, and every collaborator on a project benefits from it.

## What CLAUDE.md is (and isn't)

**It is**: a factual briefing document. Project structure, naming conventions, key file paths, agent instructions, tool configurations — stable facts that help Claude operate correctly in this specific codebase or vault.

**It isn't**: a task queue, a system prompt, or a place for ephemeral notes. Don't write "please fix the login bug" in CLAUDE.md. Don't copy your entire README in either.

The signal: if a fact would be useful in every session, put it in CLAUDE.md. If it's relevant to only the current task, put it in the user turn.

## Core sections every CLAUDE.md should have

### 1. Project overview (2–4 sentences)

What this project is, what technology it uses, and what Claude's role is.

```markdown
## Overview
agentos is an Obsidian vault and Claude Code workspace for managing personal
knowledge, agentic workflows, and automation scripts. It uses a PARA folder
structure. Claude's role is to create notes, run automations, and maintain
vault conventions.
```

### 2. Directory structure

A map of where things live. Don't include every file — just the top-level shape and any non-obvious locations.

```markdown
## Structure
- 00_INBOX/         — unsorted capture; everything lands here first
- 01_PROJECTS/      — active projects with a defined outcome
- 02_AREAS/         — ongoing areas of responsibility
- 03_RESOURCES/     — reference notes, docs, attachments, templates
- 04_ARCHIVE/       — completed or paused projects
- .claude/          — skills, config, CLAUDE.md (this file)
- CLAUDE.md         — vault-wide context (you are reading it)
```

### 3. Conventions

The rules the agent must follow. Be concrete and specific.

```markdown
## Conventions

### Filenames
New notes use `YYYYMMDDHHMMSS-slug.md` format.
Slugs are lowercase with hyphens. Example: `20260406090000-getting-started-mcp.md`

### Frontmatter
Every note requires:
  id: YYYYMMDDHHMMSS (same as filename timestamp)
  type: note | project | area | resource
  status: draft | active | done | archive
  created: YYYY-MM-DD HH:MM
  tags: kebab-case list
  area: (parent area: projects, docs, journal, etc.)

### Tags
Always kebab-case. Common tags: docs, guides, claude, agents, mcp, obsidian,
automation, python, typescript

### Wikilinks
Use [[Note Name]] syntax (no path). Never use file paths in wikilinks.
Always link at least 2 related notes when creating a new note.

### Images
Attachments live in 03_RESOURCES/Attachments/
Embed with ![[filename.ext]] syntax (no path needed in Obsidian)
```

### 4. Key paths and files

Any files Claude should know about by name, especially config files and important notes.

```markdown
## Key files
- CLAUDE.md         — this file; always in scope
- README.md         — project overview for humans
- install.sh        — vault setup script
- .claude/skills/   — skill files (load with `npx openskills read <name>`)
- .obsidian/        — Obsidian config; read-only for Claude
```

### 5. Agent instructions

Behavioural rules specific to this project. Keep them in the imperative and make them unambiguous.

```markdown
## Agent instructions
- Always search for an existing note before creating a new one
- Never modify files in .obsidian/
- When creating notes, default destination is 00_INBOX/ unless told otherwise
- Run `obsidian help` if you're unsure of the current CLI syntax
- Load relevant skills before starting vault-heavy tasks
- Ask before bulk operations that touch more than 10 notes
```

### 6. Available tools and skills (optional)

If the project uses specific MCP servers or skills, list them here so Claude knows they're available.

```markdown
## Tools & skills
MCP servers active in this project: obsidian, filesystem, brave-search
Skills available (load with `npx openskills read <name>`):
  obsidian, ob-new, ob-open, ob-search, ob-daily, pdf, docx, pptx
```

## What to leave out

- Long prose explanations — bullet points and code blocks are faster to parse
- Redundant info — if it's in the README, don't copy it into CLAUDE.md
- Credentials and secrets — never put API keys in CLAUDE.md; use env vars
- Instructions that belong in the user turn — "today's task is X" is not a CLAUDE.md item
- Everything from `.obsidian/` — plugin configs aren't useful to the agent

## CLAUDE.md for different project types

### Monorepo

```markdown
## Overview
TypeScript monorepo managed with pnpm workspaces.
Packages in /packages/. Apps in /apps/. Shared types in /packages/shared-types/.

## Commands
- Build all: `pnpm -r build`
- Test: `pnpm -r test`
- Lint: `pnpm -r lint`

## Conventions
- All packages use ESM (type: "module" in package.json)
- Tests use Vitest; test files are co-located (`*.test.ts`)
- Commit messages follow Conventional Commits
- Never install dependencies to the root workspace

## Key files
- pnpm-workspace.yaml    — workspace config
- packages/shared-types/ — shared TypeScript interfaces
- .env.example           — required env vars (never commit .env)
```

### API project

```markdown
## Overview
Express + PostgreSQL REST API. TypeScript. Runs on Node 22.

## Structure
- src/routes/      — route handlers (one file per resource)
- src/middleware/  — auth, validation, error handling
- src/db/          — Drizzle ORM schema and migrations
- src/services/    — business logic (no DB calls here)

## Conventions
- All routes must have a matching test in tests/
- DB schema changes require a new migration file
- Never put business logic in route handlers
- Errors are thrown, not returned — the error middleware catches them

## Commands
- Dev: `pnpm dev`
- Migrate: `pnpm db:migrate`
- Test: `pnpm test`
```

### Obsidian vault

```markdown
## Overview
[vault name] — [one-sentence purpose]. PARA structure.
Claude Code is used for note creation, search, and automation.

## Structure
[folder map as shown above]

## Conventions
[frontmatter schema, filename format, wikilink rules, tag rules]

## Agent instructions
[behavioural rules as shown above]
```

## Template

Use this as a starting point — delete sections you don't need:

```markdown
# [Project Name]

## Overview
[2–4 sentences: what this is, tech stack, Claude's role]

## Structure
[directory map — key folders only]

## Conventions
[naming, formatting, file placement rules]

## Commands
[build, test, run commands]

## Key files
[important config files and what they do]

## Agent instructions
[behavioural rules — imperative, unambiguous]

## Tools & skills
[MCP servers, skills available in this project]
```

---

## Related notes

- [[Claude Code with Obsidian]] — how CLAUDE.md works in a vault context
- [[Prompt Engineering for Agents]] — how to write effective instructions for agents
