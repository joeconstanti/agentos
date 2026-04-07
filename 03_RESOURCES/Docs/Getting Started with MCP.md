---
id: 20260406090000
type: note
status: draft
created: 2026-04-06 09:00
tags:
  - docs
  - guides
  - mcp
  - agents
  - getting-started
area: docs
---
# Getting Started with MCP (Model Context Protocol)

MCP is an open standard developed by Anthropic that defines how AI agents connect to external tools, data sources, and services. It solves a real problem: before MCP, every AI integration was a one-off custom connector. Now, a single protocol lets any MCP-compatible agent — Claude Code, Cursor, Gemini CLI, OpenCode, and more — plug into any MCP server without custom glue code.

Think of it like USB for AI. The protocol, not the specific cable or device, is the standard.

![[mcp-architecture.svg]]

## Why MCP matters

The old world: to give Claude access to your database, your Slack workspace, and your file system, you'd write three separate integrations and re-do them for every agent you wanted to use. With MCP, you write a server once and any MCP client can use it.

The practical benefits are:

- **Composability**: mix and match any MCP client with any MCP server
- **Security**: servers run in isolated processes; the client never gets raw credentials
- **Standardised discovery**: clients can ask a server what tools and resources it exposes, then choose what to call
- **Cross-agent portability**: a server you build for Claude Code works in Cursor, Gemini CLI, and elsewhere

## How the architecture works

MCP has three layers:

**Host** — the application running the AI model (Claude Code, your custom app, n8n). The host manages sessions and enforces policy.

**Client** — a protocol handler embedded in the host. Each client maintains a 1:1 connection with one MCP server.

**Server** — a lightweight process (local or remote) that exposes three types of primitives:

| Primitive | What it is | Example |
|-----------|-----------|---------|
| **Tools** | Callable functions the model can invoke | `read_file`, `query_db`, `send_email` |
| **Resources** | Data the model can read | Files, database rows, API responses |
| **Prompts** | Reusable prompt templates | Summarise a doc, translate a snippet |

The transport layer uses JSON-RPC 2.0 over stdio (local), HTTP+SSE, or WebSockets (remote).

## Connecting an MCP server to Claude Code

### 1. Install and run the server

Most MCP servers are available as npm packages or Python packages. For example, the official filesystem server:

```bash
# Install globally
npm install -g @modelcontextprotocol/server-filesystem

# Or run via npx (no install)
npx @modelcontextprotocol/server-filesystem /path/to/allowed/dir
```

### 2. Register it in your config

Claude Code reads MCP server config from `~/.claude/claude.json` (global) or `.claude/claude.json` (project-level):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/Users/joe/Developer"
      ]
    },
    "my-db-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/index.js"],
      "env": {
        "DATABASE_URL": "postgres://..."
      }
    }
  }
}
```

### 3. Verify the connection

Start Claude Code — it will spin up all registered servers on launch. Use `/mcp` inside a session to list connected servers and their tools.

```
/mcp
```

You should see something like:

```
● filesystem — 5 tools (read_file, write_file, list_directory, …)
● my-db-server — 3 tools (query, insert_row, list_tables)
```

### 4. Use the tools

Claude will automatically discover and call tools when relevant. You can also prompt explicitly:

```
Use the filesystem server to list all Markdown files in my vault root.
```

## Popular ready-to-use MCP servers

| Server | Package | What it does |
|--------|---------|-------------|
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | Read/write local files with path restrictions |
| **Git** | `@modelcontextprotocol/server-git` | Clone, commit, diff, log — all git operations |
| **SQLite** | `@modelcontextprotocol/server-sqlite` | Query and modify SQLite databases |
| **PostgreSQL** | `@modelcontextprotocol/server-postgres` | Full SQL access to Postgres |
| **Brave Search** | `@modelcontextprotocol/server-brave-search` | Web search via Brave API |
| **Fetch** | `@modelcontextprotocol/server-fetch` | Retrieve web pages and URLs |
| **GitHub** | `@modelcontextprotocol/server-github` | Repos, PRs, issues, file contents |
| **Slack** | `@modelcontextprotocol/server-slack` | Read channels, send messages |
| **Obsidian** | community | Full vault read/write via Local REST API plugin |
| **n8n** | community | Trigger and manage n8n workflows |

The full catalogue is at [modelcontextprotocol.io/servers](https://modelcontextprotocol.io/servers).

## Remote vs local servers

**Local (stdio)** — server runs as a child process on the same machine. Best for tools that work with local files, local databases, or dev tools. Zero network exposure.

**Remote (HTTP+SSE)** — server runs on a network endpoint. Best for shared team tools, cloud services, or servers that need to scale. Requires authentication (usually OAuth 2.0 or API keys passed in headers).

## Security model

MCP is intentionally cautious:
- Clients request explicit approval before a server can access system resources
- Servers declare upfront what they need (path prefixes, env vars, etc.)
- The host application controls which servers can be connected and what they can do
- Tools that cause side effects (write, delete, send) should require human confirmation — well-behaved servers mark these as such in their tool schemas

## Debugging

```bash
# Run Claude Code with MCP debug logging
claude --mcp-debug

# Or inspect a server directly via the MCP inspector
npx @modelcontextprotocol/inspector npx @modelcontextprotocol/server-filesystem ~/
```

The MCP Inspector opens a browser UI where you can browse tools, call them manually, and see raw JSON-RPC traffic — invaluable when building your own server.

---

## Related notes

- [[Custom MCP-backed agents]] — profiles of agents that use MCP heavily
- [[Claude Code with Obsidian]] — how Claude Code uses MCP to talk to Obsidian
- [[Claude Skills]] — the complementary pattern: skills load instructions, MCP loads tools
- [[Building Your Own MCP Server]] — step-by-step guide to writing a custom MCP server
