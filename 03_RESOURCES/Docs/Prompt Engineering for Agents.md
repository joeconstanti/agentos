---
id: 20260406090400
type: note
status: draft
created: 2026-04-06 09:04
tags:
  - docs
  - guides
  - prompt-engineering
  - agents
  - claude
area: docs
---
# Prompt Engineering for Agents

Prompting an agent is different from prompting a chat model. In a chat, you write a message and get a response. In an agentic loop, your prompt is a standing instruction set that guides dozens of decisions: which tool to call, when to ask for clarification, how to format the output, when to stop. Small wording choices have outsized effects — they determine whether the agent confidently completes a task or hallucinates, loops, or asks unnecessary questions.

This note covers the patterns that matter most: system prompts, tool descriptions, CLAUDE.md files, and the structural techniques (few-shot, chain-of-thought, structured output) that make agents reliable.

## System prompts: the agent's standing orders

The system prompt is the first thing an agent reads before your task arrives. Write it like an onboarding doc for a very capable but extremely literal new hire.

### What to include

**Role and purpose** — tell the agent what it is and what domain it operates in. Be specific.

```
You are a senior software engineer working in a TypeScript monorepo that uses
pnpm workspaces. Your job is to implement features, fix bugs, and write tests.
```

**Constraints and policies** — what the agent should never do. Explicit prohibitions are more reliable than vague caution.

```
Never modify files outside the /src and /tests directories.
Always write tests for new functions before considering a task complete.
If a task would require touching more than 5 files, pause and ask for confirmation.
```

**Output format** — if you want structured output (JSON, Markdown, a specific structure), say so in the system prompt, not just the user message.

```
After completing a task, always write a one-paragraph summary starting with
"Done:" followed by a bullet list of every file modified.
```

**Available context** — tell the agent what it can reference. If there's a CLAUDE.md in scope, note that it contains project conventions.

**Persona and tone** — useful for customer-facing agents. Keep it brief; don't over-specify.

### What to avoid

- Long narrative backstories — the model doesn't need them and they dilute the instructions
- Vague requests like "be careful" or "be thorough" — define what careful or thorough means in your context
- Contradictory instructions — the model will pick one and ignore the other
- Information that belongs in the user turn — the system prompt is for standing instructions, not task-specific data

## Tool descriptions: what the model sees when choosing

In agentic frameworks, tools are presented to the model with a name, description, and parameter schema. The description is the most important part — it's what the model uses to decide whether to call the tool and how.

### Write for the model, not the developer

The description should answer: "When should I call this, and what will I get back?"

```json
// Weak
{
  "name": "db_query",
  "description": "Query the database"
}

// Strong
{
  "name": "db_query",
  "description": "Run a read-only SQL SELECT query against the analytics database. Returns results as a JSON array of rows. Use this when you need to look up user counts, event totals, or any aggregate data. Maximum 1000 rows."
}
```

### Parameter annotations

Annotate every parameter. Include type, purpose, valid values, and defaults:

```
"city": "The city to look up, e.g. 'London' or 'New York'. Do not include country name."
"units": "Temperature units — 'celsius' (default) or 'fahrenheit'"
"limit": "Maximum results to return. Default 20, max 100."
```

### Tool naming

Use `verb_noun` naming that describes the action: `search_docs`, `create_ticket`, `read_file`, `send_message`. Avoid generic names like `tool1` or names that overlap with other tools.

## CLAUDE.md: project-level context for Claude Code

CLAUDE.md is a Markdown file loaded into every Claude Code session automatically. It's the right place for conventions, structure, and paths that apply to every task in a project.

See [[CLAUDE.md Best Practices]] for a full guide. The key principle: CLAUDE.md is not a system prompt — don't put task instructions there. Put facts, conventions, and constraints.

## Few-shot examples

When you need specific output formats or behaviours, showing the model an example is faster and more reliable than describing the pattern in words.

```
Extract action items from meeting notes. Return a JSON array of objects with
"owner", "task", and "deadline" fields.

Example input:
"Alice will draft the proposal by Friday. Bob needs to review the API docs."

Example output:
[
  { "owner": "Alice", "task": "Draft the proposal", "deadline": "Friday" },
  { "owner": "Bob", "task": "Review the API docs", "deadline": null }
]

Now extract action items from:
{{ meeting_notes }}
```

Use 1–3 examples. More than 3 rarely helps and wastes context.

## Chain-of-thought

For complex reasoning tasks, explicitly ask the model to think before answering:

```
Before writing any code, first:
1. Identify the root cause of the bug based on the error message and stack trace
2. List the files you'll need to touch
3. Write out your plan in plain English
Then implement the fix.
```

Or use the `<thinking>` / `</thinking>` pattern to keep reasoning separate from the final answer:

```
<thinking>
[model works through the problem]
</thinking>

[final answer here]
```

The key insight: explicit reasoning steps catch mistakes before they're baked into code or output.

## Structured output

For data extraction, classification, or any task where downstream code will parse the result, ask for JSON and give a schema:

```
Return your analysis as a JSON object with exactly this structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.0–1.0,
  "key_topics": ["string", ...],
  "summary": "one sentence"
}
Do not include any text outside the JSON object.
```

Many model APIs support native structured output (Anthropic's response format, OpenAI's JSON mode) which is more reliable than prompting alone.

## Common failure modes and fixes

| Failure | Cause | Fix |
|---------|-------|-----|
| Agent loops on the same tool call | No stopping condition | Add explicit "stop when X is true" to system prompt |
| Agent asks unnecessary clarifying questions | System prompt too vague | Add more constraints and examples to the system prompt |
| Wrong tool chosen | Tool descriptions too similar | Differentiate descriptions; add "use this instead of Y when…" |
| Hallucinated file paths or function names | Model doesn't know the codebase | Point agent to CLAUDE.md or load codebase context first |
| Verbose output when concise is needed | No output length instruction | Specify max length or format explicitly |
| Agent writes files it shouldn't | No path restrictions | Add explicit constraints; use MCP server with path allow-lists |

## Putting it together: a well-structured agent prompt

```
You are a documentation engineer working in the agentos Obsidian vault.
The vault uses PARA structure (00_INBOX, 01_PROJECTS, 02_AREAS, 03_RESOURCES, 04_ARCHIVE).
All notes use the frontmatter schema defined in CLAUDE.md.
Filenames follow the YYYYMMDDHHMMSS-slug.md format.

Your job: when given a URL or piece of text, create a well-structured note in
03_RESOURCES/Clippings/ with correct frontmatter, a concise summary, and
relevant wikilinks to existing notes.

Constraints:
- Do not modify existing notes
- Always include at least 2 wikilinks
- Tags must be kebab-case
- Never create duplicate notes — search first

Output format: after creating the note, respond with only:
"Created: [[Note Name]]"
```

---

## Related notes

- [[Claude Skills]] — pre-packaged instructions that extend what an agent can do
- [[Claude Code with Obsidian]] — applying these patterns in a vault context
- [[CLAUDE.md Best Practices]] — writing the project-level context file
