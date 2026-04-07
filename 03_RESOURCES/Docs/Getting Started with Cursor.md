---
id: 20260406090800
type: note
status: draft
created: 2026-04-06 09:08
tags:
  - docs
  - guides
  - cursor
  - ai-editor
  - coding
area: docs
---
# Getting Started with Cursor

Cursor is an AI-native code editor — a VS Code fork with deep model integration built directly into the editing experience. Where VS Code with Copilot adds AI as a layer on top, Cursor redesigns the editor around it: the AI knows your whole codebase, can edit across multiple files in one instruction, and runs as a full agent that executes multi-step tasks.

It's the most popular alternative to [[Claude Code]] for AI-assisted development, and the two tools are complementary: Cursor excels at interactive editing sessions; Claude Code excels at longer autonomous tasks run from the terminal.

## Install and initial setup

1. Download from [cursor.com](https://cursor.com) — available for macOS, Windows, Linux
2. On first launch, you can import your VS Code settings, extensions, and keybindings — Cursor is API-compatible, so the migration is seamless
3. Sign in and choose a subscription tier (free tier is available with usage limits)
4. In Settings → Models, select your preferred model — Cursor supports Claude, GPT-4o, Gemini, and its own routing ("Auto")

> [!TIP] Model choice
> As of early 2026, Claude Sonnet is the most popular model for Cursor users who prioritise code quality. GPT-4o is faster for quick edits. Use "Auto" if you want Cursor to route based on task type.

## Core modes

Cursor has three distinct interaction modes, each suited to a different type of task:

**Tab (autocomplete)** — Cursor's enhanced autocomplete. It predicts the next edit, not just the next token — it can suggest multi-line changes, complete function bodies, and anticipate follow-up edits based on recent changes. Press Tab to accept, Escape to dismiss.

**Chat (⌘L)** — Opens the chat panel. You can ask questions, get explanations, or request edits. The model has access to your codebase via `@` references. Changes are shown as diffs you can accept or reject.

**Agent (⌘⇧I)** — Full agentic mode. Give a high-level goal; Cursor plans and executes multi-step changes across multiple files, runs terminal commands, reads error output, and iterates. This is equivalent to Claude Code's interactive session, but inside the editor.

## Context management with @-mentions

The `@` syntax is how you tell Cursor what to look at. Available in Chat and Agent:

| Mention | What it includes |
|---------|-----------------|
| `@file` | The contents of a specific file |
| `@folder` | All files in a directory |
| `@code` | A specific function or class (auto-detected) |
| `@docs` | Your linked documentation sites |
| `@web` | A live web search result |
| `@git` | Recent git history or a specific commit |
| `@terminal` | Most recent terminal output |
| `@Codebase` | Full codebase search (RAG over your project) |

The `@Codebase` mention triggers Cursor's vector search over your indexed codebase — it finds the most relevant files automatically, so you don't have to name them.

### Example: refactoring with context

```
@auth/session.ts @auth/middleware.ts

Refactor session handling to use a class-based approach.
Keep the same external API. Write tests for the new class.
```

## .cursorrules — project-level configuration

`.cursorrules` is Cursor's equivalent of `CLAUDE.md` — a file at the project root that loads into every session. Write it like a standing brief for a new developer:

```
# Project conventions
This is a TypeScript monorepo using pnpm workspaces and Vitest for testing.

## Code style
- Use functional patterns; avoid classes except for Error types
- Prefer explicit return types on all exported functions
- All async functions must handle errors — never let promises go unhandled

## File structure
- Business logic in src/services/ — no DB calls, no HTTP
- Route handlers in src/routes/ — thin, delegate to services
- Shared types in packages/shared-types/

## Testing
- Write tests before considering a task complete
- Test files live alongside source: foo.ts → foo.test.ts
- Mock external services; never make real HTTP calls in tests

## Commit style
Follow Conventional Commits: feat:, fix:, refactor:, docs:, test:
```

As of Cursor v0.45, the format changed: project rules now live in `.cursor/rules/*.mdc` files (MDC is Markdown with optional frontmatter for attachment rules). The `.cursorrules` file still works for backwards compatibility, but the new format is preferred.

```
# .cursor/rules/core-conventions.mdc
---
alwaysAttach: true
---
[your conventions here]
```

```
# .cursor/rules/testing.mdc
---
attachOn: ["*.test.ts", "*.spec.ts"]
---
[testing-specific rules]
```

The `alwaysAttach: true` flag means this rule is injected into every session. `attachOn` adds a rule only when matching files are in context — useful for keeping your rules lean.

## Codebase indexing

Cursor builds a local vector index of your codebase for semantic search. The index updates automatically on file changes.

```
Settings → Features → Codebase Indexing
```

For large codebases (>100k lines), indexing takes a few minutes on first run. After that, incremental updates are fast. You can see index status and force a re-index in Settings.

For very large monorepos, tell Cursor what to focus on:

```
# .cursorignore  (same syntax as .gitignore)
node_modules/
dist/
.next/
coverage/
*.generated.ts
```

## Tips for large codebases

**Use `@Codebase` liberally** — it's RAG over your project and usually surfaces the right files faster than `@file` for cross-cutting questions.

**Scope requests to a module** — instead of "refactor the auth system", say "refactor `src/auth/session.ts` to use the new token schema defined in `@src/types/auth.ts`". Smaller scope = fewer mistakes.

**Use Agent mode for multi-file tasks** — if a task touches more than 2 files, switch to Agent mode (⌘⇧I). It handles the coordination; Chat mode is for single-file or conceptual work.

**Review diffs carefully in Agent mode** — Agent mode can make many changes across many files. Use the diff view (`⌘Z` to step through changes) before accepting.

**Combine with Claude Code** — Cursor is excellent for the interactive, back-and-forth phase of development. When you need to run a long autonomous task (generate a full feature, write 50 tests, migrate a schema), Claude Code in the terminal is often more reliable and easier to monitor.

**Keep `.cursorrules` / `.cursor/rules/` under version control** — it benefits the whole team, not just you.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘L` | Open Chat panel |
| `⌘⇧I` | Open Agent panel |
| `⌘K` | Inline edit at cursor position |
| `Tab` | Accept autocomplete suggestion |
| `Esc` | Dismiss suggestion |
| `⌘⇧L` | Add selected text to Chat context |
| `⌘.` | Apply a suggested fix |

---

## Related notes

- [[AI Coding Agent Alternatives]] — comparison of Cursor, Claude Code, Codex, Gemini CLI, and others
- [[Claude Skills]] — how skills (SKILL.md) work across Cursor and other agents
- [[Cursor]] — agent profile with more detail on Cursor's capabilities
