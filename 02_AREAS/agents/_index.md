---
id: 20260406100600
type: index
status: active
created: 2026-04-06 10:06
tags:
  - index
  - moc
  - agents
area: agents
---
# Agents Index

Map of all AI agent profiles in this vault. Each file covers one agent: what it is, its capabilities, installation, and how it integrates with AgentOS.

Update this file whenever a new agent profile is added to `02_AREAS/agents/`.

---

## Agent Profiles

- [[Claude Code]] — Anthropic's official CLI agent; primary agent for this vault; deep codebase understanding, MCP support, skills system
- [[Codex]] — OpenAI's terminal-based coding agent; multi-model support (GPT-4o, o3, o4-mini); strong for sandboxed code execution
- [[Cursor]] — AI-powered code editor built on VS Code; inline edits, Composer for multi-file changes, Agent mode for autonomous tasks
- [[Gemini CLI]] — Google's open-source terminal agent; integrates Gemini models; large context window; MCP support
- [[OpenCode]] — Open-source terminal agent by Anomaly, written in Go; model-agnostic; fast; supports any OpenAI-compatible endpoint
- [[Custom MCP-backed agents]] — Framework for building purpose-built agents using the Model Context Protocol; community-driven; platform-agnostic

---

## Quick comparison

| Agent | Provider | License | Primary interface | MCP support |
|-------|----------|---------|-------------------|-------------|
| [[Claude Code]] | Anthropic | Proprietary | CLI | ✓ |
| [[Codex]] | OpenAI | Proprietary | CLI | Partial |
| [[Cursor]] | Cursor | Proprietary | Desktop editor | ✓ |
| [[Gemini CLI]] | Google | Apache-2.0 | CLI | ✓ |
| [[OpenCode]] | Anomaly | MIT | CLI | ✓ |
| [[Custom MCP-backed agents]] | Community | Varies | Any | ✓ (native) |

---

## See also

- [[Getting Started with MCP]] — How agents connect to tools via MCP
- [[AI Coding Agent Alternatives]] — Comparison of terminal agents
- [[Multi-Agent Orchestration]] — Coordinating multiple agents together
