---
id: 20260406090200
type: note
status: draft
created: 2026-04-06 09:02
tags:
  - docs
  - guides
  - n8n
  - automation
  - workflows
  - ai-tools
area: docs
---
# n8n Getting Started

n8n ("nodemation") is a fair-code workflow automation platform — like Zapier or Make, but self-hostable, extensible with code, and increasingly AI-native. It's the glue layer that lets you wire Claude (or any LLM) into your real-world systems: send a Slack message when a new email arrives, trigger a Claude analysis on a webhook, save summarised results to Notion — all without writing a full application.

![[n8n-workflow.svg]]

Since late 2024, n8n has added first-class AI Agent nodes, giving you LangChain-style orchestration in a visual canvas. It's become a go-to tool in the AgentOS stack for automations that need to run on a schedule or respond to external events.

## Self-hosted vs Cloud

| | Self-hosted | n8n Cloud |
|--|------------|-----------|
| **Cost** | Free (fair-code licence) | From $20/month |
| **Data stays on your machine** | ✓ | ✗ |
| **Setup time** | ~5 minutes with Docker | Instant |
| **Custom nodes** | ✓ | Limited |
| **Best for** | Privacy-sensitive data, local LLMs | Quick start, no ops overhead |

For an AI-agent workflow where you're passing notes, docs, or personal data to Claude, self-hosted is almost always the right call.

## Installing locally

### Option A — Docker (recommended)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

Open `http://localhost:5678` and create your account. Your workflows and credentials are persisted in the `n8n_data` volume.

### Option B — npm

```bash
npm install -g n8n
n8n start
```

### Option C — Docker Compose (for persistent setups)

```yaml
# docker-compose.yml
version: "3.8"
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

```bash
docker-compose up -d
```

## Building your first workflow

A workflow is a directed graph of nodes. Each node does one thing: receive data, transform it, call an API, make a decision, or send a result somewhere.

### The simplest AI workflow

1. **Open** n8n at `localhost:5678`
2. Click **New workflow**
3. Add a **Webhook** trigger node — this gives you a URL you can POST to
4. Add a **Claude** (or OpenAI) node, connect it to the Webhook
5. Set the system prompt and map `{{ $json.body.text }}` as the user message
6. Add a **Respond to Webhook** node to return the result

You now have a Claude API wrapper exposed as a webhook — useful for triggering from scripts, other services, or Claude Code itself.

### Key node types to know

**Triggers** — start a workflow on an event:
- `Webhook` — HTTP POST/GET to a generated URL
- `Schedule` — cron-style (every day at 9am, every hour, etc.)
- `Email Trigger (IMAP)` — fires when a new email arrives
- `RSS Feed Trigger` — fires when a feed has new items

**AI nodes** — the intelligence layer:
- `AI Agent` — a full ReAct-style agent with access to tools; uses LangChain internally
- `Chat Model` — call Claude, GPT, Gemini directly with a prompt
- `Embeddings` — generate vector embeddings for RAG workflows
- `Vector Store` — read/write to Pinecone, Supabase, Chroma, etc.

**Core nodes** — the plumbing:
- `Set` — create or remap fields
- `IF` — branch based on a condition
- `Loop Over Items` — iterate over arrays
- `Code` — arbitrary JavaScript or Python
- `HTTP Request` — call any API without a dedicated node
- `Merge` — combine results from parallel branches

**Integrations** (400+ apps) — direct connects to Google Workspace, Slack, Notion, GitHub, Airtable, Postgres, and hundreds more.

## Connecting to Claude via HTTP

n8n has native Claude / Anthropic nodes since v1.35. Set up credentials once and reuse everywhere:

1. Go to **Settings → Credentials → New**
2. Search for **Anthropic**
3. Enter your API key
4. In any AI node, select **Anthropic** as the provider and choose a model

If you want to call Claude through a proxy or a local model that speaks the Anthropic API, use the **HTTP Request** node instead:

```
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {{ $credentials.anthropicApi.apiKey }}
  anthropic-version: 2023-06-01
Body: {
  "model": "claude-sonnet-4-6",
  "messages": [{ "role": "user", "content": "{{ $json.text }}" }],
  "max_tokens": 1024
}
```

## Connecting n8n to Claude Code via webhook

Claude Code can trigger n8n workflows using the HTTP Request tool or via a [[Getting Started with MCP]] server:

```bash
# From a Claude Code session — trigger an n8n workflow
curl -X POST http://localhost:5678/webhook/my-workflow \
  -H "Content-Type: application/json" \
  -d '{"task": "summarise", "text": "{{ paste content here }}"}'
```

Or install the n8n MCP server so Claude Code can manage workflows directly:

```bash
npx @n8n/mcp-server
```

## Useful workflow patterns for AgentOS

**Daily digest** — Schedule trigger → fetch RSS feeds → Claude summarise → send to Slack/email.

**Inbox triage** — Email trigger → Claude classify priority/category → route to Notion DB or reply.

**Vault enrichment** — Webhook trigger (fired from Claude Code) → fetch URL → Claude extract key ideas → write Markdown note via Obsidian API.

**Agent loop** — Webhook → AI Agent node (with tools: web search, calculator, Notion read) → respond with structured result.

## Tips

- Use **Sticky Notes** on the canvas to document what each section of a workflow does — future you will thank you.
- Pin test data on nodes by right-clicking and choosing **Pin data** — this lets you run downstream nodes without re-triggering the full workflow.
- Enable **Error Workflow** in workflow settings to catch failures and alert you via Slack or email.
- Keep credentials in n8n's credential store, not hardcoded in **Code** or **Set** nodes.
- The `$json`, `$node`, and `$workflow` built-in variables give you access to the current item, upstream node outputs, and workflow metadata.

---

## Related notes

- [[Claude Skills]] — reusable instruction bundles that complement n8n automations
- [[Getting Started with MCP]] — how MCP servers and n8n can work together
