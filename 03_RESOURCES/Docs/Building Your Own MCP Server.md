---
id: 20260406090100
type: note
status: draft
created: 2026-04-06 09:01
tags:
  - docs
  - guides
  - mcp
  - development
  - node-js
  - python
area: docs
---
# Building Your Own MCP Server

Writing a custom MCP server is one of the highest-leverage things you can do in an agentic workflow. Once built, any MCP-compatible agent can use your tools — Claude Code, Cursor, Gemini CLI, and more. This guide walks through scaffolding a minimal server, defining tools with proper schemas, testing locally, and connecting to Claude Code.

Start with the [[Getting Started with MCP]] note if you haven't already.

## When to build a custom server

Build one when you need an agent to interact with:
- An internal API or service not covered by existing servers
- A proprietary database or data format
- A tool with specific business logic (e.g. "create a JIRA ticket with our naming conventions")
- A local CLI tool you want the agent to orchestrate

For everything already covered by the official server catalogue, use those instead — they're well-tested and maintained.

## Option A — Node.js (TypeScript)

The official SDK makes this straightforward. You're dealing with `@modelcontextprotocol/sdk`.

### Scaffold the project

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node ts-node
npx tsc --init
```

### Minimal server (`src/index.ts`)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. Create the server
const server = new McpServer({
  name: "my-tools",
  version: "1.0.0",
});

// 2. Define a tool
server.tool(
  "get_weather",                          // tool name
  "Get current weather for a city",      // description (shown to the model)
  {
    city: z.string().describe("The city name"),
    units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  },
  async ({ city, units }) => {
    // Your implementation here
    const data = await fetchWeather(city, units);
    return {
      content: [
        {
          type: "text",
          text: `Weather in ${city}: ${data.temp}°, ${data.description}`,
        },
      ],
    };
  }
);

// 3. Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("MCP server running on stdio");
```

### Run it

```bash
npx ts-node src/index.ts
```

Claude Code communicates over stdin/stdout, so `console.error` is safe for logging (it goes to stderr, not stdout where the protocol runs).

## Option B — Python

```bash
pip install mcp
```

### Minimal server (`server.py`)

```python
from mcp.server.fastmcp import FastMCP

# 1. Create the server
mcp = FastMCP("my-tools")

# 2. Define a tool with a decorator
@mcp.tool()
def get_weather(city: str, units: str = "celsius") -> str:
    """Get current weather for a city.
    
    Args:
        city: The city name to look up
        units: Temperature units — 'celsius' or 'fahrenheit'
    """
    # Your implementation here
    data = fetch_weather(city, units)
    return f"Weather in {city}: {data['temp']}°, {data['description']}"

# 3. Run
if __name__ == "__main__":
    mcp.run()
```

### Run it

```bash
python server.py
```

FastMCP handles all the transport boilerplate and converts your Python type hints and docstrings into the JSON Schema the client needs.

## Defining good tool schemas

The schema is what the model sees when deciding which tool to call. A bad schema leads to incorrect calls or the model ignoring the tool entirely.

**Do:**
- Write a clear, action-oriented description: `"Search the internal knowledge base for relevant documents"` not just `"search"`
- Annotate every parameter with `.describe()` (TS) or docstring (Python) — include units, expected formats, constraints
- Use `enum` for parameters with a fixed set of values
- Mark truly optional parameters as optional (don't make the model guess)

**Don't:**
- Use jargon the model won't understand (internal codenames, database table names in the description)
- Make one tool do too many unrelated things — one clear job per tool
- Return raw stack traces or verbose logs; format results as human-readable text

## Common patterns

### File tools

```typescript
server.tool(
  "read_file",
  "Read the full contents of a file at the given path",
  { path: z.string().describe("Absolute or relative file path") },
  async ({ path }) => {
    const content = await fs.readFile(path, "utf-8");
    return { content: [{ type: "text", text: content }] };
  }
);
```

> [!TIP] Path allow-listing
> Always validate paths against an allowed root to prevent traversal attacks. The official filesystem server does this with a `--allowed-path` argument.

### API wrapper

```typescript
server.tool(
  "create_ticket",
  "Create a new support ticket in the internal JIRA project",
  {
    title: z.string().describe("Short title for the ticket"),
    description: z.string().describe("Detailed description of the issue"),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  },
  async ({ title, description, priority }) => {
    const ticket = await jiraClient.issues.createIssue({
      fields: {
        project: { key: "SUPPORT" },
        summary: title,
        description,
        priority: { name: priority },
      },
    });
    return {
      content: [{ type: "text", text: `Created: ${ticket.key} — ${ticket.self}` }],
    };
  }
);
```

### Database tool

```python
@mcp.tool()
def query_analytics(
    sql: str,
    limit: int = 100
) -> str:
    """Run a read-only SQL query against the analytics database.
    
    Args:
        sql: A SELECT statement (no writes allowed)
        limit: Maximum rows to return (default 100, max 1000)
    """
    if not sql.strip().upper().startswith("SELECT"):
        return "Error: only SELECT queries are permitted"
    
    limit = min(limit, 1000)
    rows = db.execute(sql + f" LIMIT {limit}").fetchall()
    return format_as_markdown_table(rows)
```

## Exposing resources

Resources are read-only data the model can browse before deciding what to fetch. Useful for file listings, database schemas, or static reference data:

```typescript
server.resource(
  "vault://docs",
  "obsidian://docs",          // URI (arbitrary scheme is fine)
  async (uri) => {
    const files = await listMarkdownFiles("./docs");
    return {
      contents: [{ uri, text: files.join("\n"), mimeType: "text/plain" }],
    };
  }
);
```

## Testing locally

```bash
# 1. Start your server
npx ts-node src/index.ts &

# 2. Connect the MCP Inspector to it
npx @modelcontextprotocol/inspector npx ts-node src/index.ts
```

The Inspector UI lets you list tools, call them with arbitrary inputs, and inspect the raw JSON-RPC messages — much faster than iterating through Claude Code.

## Connecting to Claude Code

Add the server to your project config:

```json
// .claude/claude.json (project-level, committed to the repo)
{
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": ["ts-node", "./mcp-server/src/index.ts"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

Use `${ENV_VAR}` syntax in env values to pull from your shell environment — never hardcode secrets in the config file.

## Packaging for distribution

Once your server is ready to share:

```bash
# Publish to npm
npm publish --access public

# Users install and configure:
# { "command": "npx", "args": ["@yourorg/mcp-my-tools"] }
```

Or share as a Docker image for servers with complex dependencies.

---

## Related notes

- [[Getting Started with MCP]] — protocol fundamentals and architecture
- [[Custom MCP-backed agents]] — profiles of agents built around custom MCP servers
