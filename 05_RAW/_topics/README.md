---
id: 20260406100100
type: note
status: active
created: 2026-04-06 10:01
tags:
  - raw
  - ingest
  - topics
area: system
---
# _topics — Per-Topic Source Folders

Each research topic gets its own subfolder here. When you're building up knowledge on a subject, all raw sources for that subject land in the same folder — making it easy for an agent to compile them in one pass.

---

## Structure

```
05_RAW/_topics/
├── mcp-research/
│   ├── 20260406-mcp-spec-overview.md
│   ├── 20260407-mcp-server-examples.md
│   └── 20260408-mcp-security-patterns.md
├── ai-agents/
│   ├── 20260405-karpathy-llm-kb-workflow.md
│   └── 20260406-agent-orchestration-survey.md
└── n8n-automation/
    └── 20260407-n8n-ai-nodes-overview.md
```

---

## Creating a new topic folder

When you start researching a new topic:

1. Create a subfolder: `05_RAW/_topics/<topic-slug>/`
2. Use kebab-case for the folder name (e.g., `rag-architectures`, `prompt-engineering`)
3. Drop raw sources into the folder using the `YYYYMMDD-source-slug.md` naming convention
4. When ready, trigger the [[Raw Ingest to Wiki]] playbook to compile

---

## When to compile

Compile a topic folder into a wiki article when:

- You have 3+ sources on the same topic
- A source is more than 7 days old (the health check will flag it)
- You need to reference the knowledge in a project

The [[Wiki Health Check]] playbook includes a check for uncompiled raw sources older than 7 days.

---

## Example topic folders

| Folder | What goes here |
|--------|---------------|
| `mcp-research/` | MCP spec docs, server examples, integration patterns |
| `ai-agents/` | Papers, blog posts, benchmarks about AI agent systems |
| `prompt-engineering/` | Prompt templates, guides, techniques |
| `n8n-automation/` | n8n docs, workflow examples, node documentation |
| `rag-architectures/` | RAG papers, vector DB comparisons, implementation guides |
| `obsidian-plugins/` | Plugin READMEs, community forum posts, tutorials |
