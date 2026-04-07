---
id: 20260406100400
type: note
status: active
created: 2026-04-06 10:04
tags:
  - playbook
  - wiki
  - query
  - qa
area: docs
---
# Q&A Against the Wiki

This playbook explains how to query the compiled AgentOS knowledge base effectively. The wiki in `03_RESOURCES/` is your primary knowledge source — use it rather than relying on an LLM's training data, which may be stale or hallucinated.

---

## When to use the wiki vs. asking Claude directly

**Use the wiki when:**
- The question is about something the vault has been specifically trained on (your tools, workflows, agent capabilities)
- You need a stable, citable answer you can link to
- You want the agent to build on prior research rather than starting from scratch
- The topic has been actively researched and compiled into `03_RESOURCES/`

**Ask Claude directly (without wiki context) when:**
- The question is general knowledge Claude already knows well
- The topic has no raw sources or compiled articles yet (then add sources to `05_RAW/` first)
- Speed matters more than grounding

---

## How to frame queries for best results

Good wiki queries are specific and point the agent toward the right folder.

| Instead of... | Try... |
|---------------|--------|
| "What is MCP?" | "Summarise our wiki articles on MCP in `03_RESOURCES/Wiki/mcp-research/`" |
| "How do agents work?" | "Read `02_AREAS/agents/` and summarise the key differences between Claude Code, Cursor, and Codex" |
| "What's in the vault?" | "Read `03_RESOURCES/Docs/_index.md` and give me a one-sentence summary of each doc" |

**Always:**
1. Point to specific folders or files
2. Ask for a specific output format
3. Tell the agent whether to save the output back to the vault

---

## The research chain pattern

For complex questions, don't try to answer everything in one shot. Use a chain:

### Step 1 — Broad query (orientation)
```
Read the _index.md files in 03_RESOURCES/Docs/ and 03_RESOURCES/Wiki/ (if it exists).
Give me a map of what the vault knows about <TOPIC>.
List: relevant files, key themes covered, obvious gaps.
```

### Step 2 — Identify gaps
```
Based on your orientation, what's missing from our wiki on <TOPIC>?
Are there raw sources in 05_RAW/_topics/ that haven't been compiled yet?
What questions remain unanswered after reading what we have?
```

### Step 3 — Targeted follow-ups
```
Deep-dive on [specific gap identified in Step 2].
Read [specific file] and extract [specific information].
Compare [Note A] and [Note B] — what are the key differences?
```

This chain prevents shallow synthesis and ensures the agent actually reads the source material rather than guessing.

---

## Maintaining a fast-orientation index

Create and maintain a master index file that gives agents (and you) instant orientation:

**File:** `03_RESOURCES/_vault-index.md`

This file should list every major topic in the vault with a one-line description and links to the relevant MOC files. Update it when you add a new topic folder.

**Prompt to generate/update the index:**
```
Scan the vault structure:
- 02_AREAS/agents/ — list each agent file with one-line description
- 03_RESOURCES/Docs/ — list each doc with one-line description  
- 03_RESOURCES/Wiki/ — list each topic subfolder
- 03_RESOURCES/Playbooks/ — list each playbook with one-line description

Write or update 03_RESOURCES/_vault-index.md with this map.
Format each entry as: [[Note Name]] — one sentence description
Group by folder.
```

---

## Output formats

When saving query results, choose the format based on the use case:

| Use case | Format | Where to save |
|----------|--------|---------------|
| Research synthesis | Markdown article | `03_RESOURCES/Wiki/<topic>/` |
| Quick answer to keep | Markdown note | `00_INBOX/` |
| Presentation | Marp slides | `03_RESOURCES/Notes/` (see [[Marp Slides Output]]) |
| Summary for sharing | Markdown with headers | `00_INBOX/` then move |
| Decision record | ADR-style note | `01_PROJECTS/<project>/` |

---

## Filing query outputs back into the wiki

Good query outputs enhance the wiki. After running a research chain:

1. If the output adds new knowledge: save it as a wiki article using the template in [[Raw Ingest to Wiki]]
2. If it answers a question you'll want to re-ask: add it to the relevant `_index.md` MOC
3. If it identifies gaps: add a stub note with `status: stub` as a placeholder, or add raw sources to `05_RAW/`
4. Always: add backlinks from the output to the source notes it drew from

---

## Example queries and expected agent behaviour

### Example 1 — "What agents do we have profiles for?"
```
Read all files in 02_AREAS/agents/.
For each agent, extract: name, provider, status, key capabilities (2-3 bullet points).
Format as a comparison table.
```
**Expected:** Agent reads 5–6 files, produces a clean markdown table. Takes ~30 seconds.

### Example 2 — "Explain MCP to someone new to it"
```
Read 03_RESOURCES/Docs/Getting Started with MCP.md.
Write a plain-English explanation of MCP suitable for a developer who hasn't heard of it before.
Keep it under 300 words. No jargon. Use one analogy.
Save to 00_INBOX/mcp-explainer.md.
```
**Expected:** Agent reads the source doc, writes a clear summary grounded in the wiki's content.

### Example 3 — "What playbooks do we have and when do I use each?"
```
Read all files in 03_RESOURCES/Playbooks/.
For each playbook, extract: name, purpose (1 sentence), trigger conditions (when to use it).
Format as a reference table.
```
**Expected:** Agent reads all playbooks and produces an immediately usable reference card.

### Example 4 — "Build me a Marp deck on multi-agent orchestration"
```
Read 03_RESOURCES/Docs/Multi-Agent Orchestration.md.
Convert it into a Marp slide deck following the [[Marp Slides Output]] playbook.
Save to 03_RESOURCES/Notes/multi-agent-orchestration-slides.md.
```
**Expected:** Agent reads the source doc and playbook, produces a properly formatted Marp deck.
