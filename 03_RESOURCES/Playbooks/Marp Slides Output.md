---
id: 20260406100500
type: note
status: active
created: 2026-04-06 10:05
tags:
  - playbook
  - marp
  - slides
  - output
area: docs
---
# Marp Slides Output

This playbook explains how to convert wiki content into Marp presentation slides directly from the AgentOS vault. Marp is a Markdown-based slide framework — slides are just Markdown files with a special frontmatter block.

---

## What is Marp

[Marp](https://marp.app) (Markdown Presentation Ecosystem) lets you write slide decks in plain Markdown. It's supported natively in VS Code (via the Marp for VS Code extension) and can export to PDF, HTML, or PPTX.

In Obsidian, Marp slides are rendered by the **Marp Slides** community plugin. Install it from Settings → Community Plugins → search "Marp Slides".

**Why use Marp for wiki output:**
- Slides are plain text files — version-controllable, diff-friendly
- Agents can generate them directly from wiki notes
- No design tool required
- Export to PDF for sharing

---

## Required Marp frontmatter

Every Marp slide file must begin with this frontmatter:

```yaml
---
marp: true
theme: default         # default | gaia | uncover
paginate: true
backgroundColor: #ffffff
color: #333333
style: |
  section {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1.6rem;
  }
  h1 { color: #1a1a2e; }
  h2 { color: #16213e; border-bottom: 2px solid #e94560; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
---
```

Slides are separated by `---` (horizontal rule). Each `---` starts a new slide.

**Theme options:**
- `default` — clean white, good for technical content
- `gaia` — bold, dark hero slides, good for opinionated talks
- `uncover` — centred, minimal, good for concept presentations

---

## Prompt template for agent-generated slides

Use this exact prompt to ask an agent to convert a wiki article into a Marp deck:

```
Convert the wiki article at `<FILE PATH>` into a Marp slide deck.

REQUIREMENTS:
1. Use the MARP TEMPLATE below as your starting point.
2. Slides structure:
   - Slide 1: Title slide (title, subtitle, date)
   - Slide 2: Agenda (bullet list of sections)
   - Slides 3–N: One slide per major concept or section heading from the source
   - Final slide: Summary + key takeaways (3–5 bullet points)
3. Each concept slide should have:
   - A clear heading (the concept name)
   - 3–5 bullet points (not paragraphs — distil to key facts)
   - One code block or diagram embed if relevant
4. Keep bullet points to under 10 words each — slides are not docs.
5. Include speaker notes (HTML comment <!-- --> below each slide) with fuller context from the source.
6. Save the output to `03_RESOURCES/Notes/<topic>-slides.md`.

MARP TEMPLATE:
---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
---

# Title
## Subtitle
*Date*

---

## Agenda
- Topic 1
- Topic 2
- Topic 3

---

## Concept Title
- Key point one
- Key point two
- Key point three

<!-- Speaker note: fuller context here -->

---

## Summary
### Key Takeaways
- Takeaway 1
- Takeaway 2
- Takeaway 3

*Thank you*
```

---

## Slide structure guidelines

### Title slide
```markdown
# Title of the Deck
## Subtitle or one-line summary
*Presenter · Date*

---
```

### Agenda slide
```markdown
## Agenda
- What this covers
- Key concept A
- Key concept B
- Practical patterns
- Summary

---
```

### Concept slide
```markdown
## Concept Name

- Core idea in under 10 words
- Second key point
- Third key point

> Optional pull quote or key insight

---
```

### Code/demo slide
```markdown
## How It Works

```typescript
// Minimal, illustrative code snippet
const result = await agent.run(prompt);
```

- Only show 5–10 lines — not full implementations
- Comment every non-obvious line

---
```

### Summary slide
```markdown
## Key Takeaways

- Most important thing to remember
- Second most important
- Third

*Questions? → [[Note Name]] in the AgentOS vault*

---
```

---

## Exporting slides

### From Obsidian (Marp Slides plugin)
1. Open the `.md` slide file in Obsidian
2. Click the Marp preview icon in the top-right toolbar
3. Use Cmd+Shift+P → "Export Slide Deck" → choose PDF or HTML

### From VS Code (Marp for VS Code)
1. Open the file in VS Code
2. Cmd+Shift+P → "Marp: Export Slide Deck"
3. Choose PDF, HTML, or PPTX

### From the command line (Marp CLI)
```bash
# Install
npm install -g @marp-team/marp-cli

# Export to PDF
marp 03_RESOURCES/Notes/my-slides.md --pdf

# Export to HTML
marp 03_RESOURCES/Notes/my-slides.md --html

# Export to PPTX
marp 03_RESOURCES/Notes/my-slides.md --pptx
```

---

## Example: full Marp deck skeleton

```markdown
---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
color: #1a1a2e
style: |
  section { font-family: 'Inter', system-ui; }
  h2 { border-bottom: 2px solid #e94560; }
---

# Multi-Agent Orchestration
## Patterns for coordinating AI agents at scale
*AgentOS Knowledge Base · April 2026*

---

## Agenda

- What is multi-agent orchestration?
- Core patterns: sequential, parallel, hierarchical
- Practical implementation with MCP
- When NOT to use multiple agents
- Summary

---

## What is Multi-Agent Orchestration?

- Coordinating multiple AI agents to complete a shared goal
- Each agent handles a specialised subtask
- An orchestrator routes work and combines results
- Enables parallelism and separation of concerns

<!-- Speaker note: This is distinct from a single agent with many tools. Orchestration implies independent agents that can fail, retry, and produce intermediate outputs. -->

---

## Core Patterns

### Sequential
Agent A → Agent B → Agent C (pipeline)

### Parallel
Agent A ↘
Agent B → Aggregator → Result
Agent C ↗

### Hierarchical
Orchestrator delegates to specialist agents, each of which may orchestrate sub-agents.

---

## Key Takeaways

- Use orchestration when tasks can be meaningfully parallelised
- Keep agent interfaces narrow — one capability per agent
- The orchestrator is responsible for error recovery
- Start simple: one agent is often enough

*See [[Multi-Agent Orchestration]] in the vault for the full reference*
```
