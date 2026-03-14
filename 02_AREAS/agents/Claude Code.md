---
title: Claude Code
type: agent
category: ai-coding-assistant
provider: Anthropic
license: Proprietary
platform: CLI
homepage: https://code.claude.com
github: https://github.com/anthropics/claude-code
npm: "@anthropic-ai/claude-code"
status: active
tags:
  - ai
  - coding
  - terminal
  - anthropic
  - claude
created: 2026-03-14
updated: 2026-03-14
---
 
# Claude Code

Official CLI tool for Claude by Anthropic - an agentic coding tool that lives in your terminal.

## Overview

Claude Code is Anthropic's official command-line interface that brings Claude AI directly into your terminal. It's designed as an agentic coding tool that understands your codebase and helps you code faster through natural language commands.

## Key Features

- **Terminal-native**: Works directly in your terminal without requiring a browser
- **Codebase understanding**: Analyzes and understands your entire project context
- **Natural language interface**: Execute routine tasks through conversational commands
- **Git workflow integration**: Built-in support for git operations and PR workflows
- **Task automation**: Handles routine coding tasks automatically
- **Code explanation**: Explains complex code in plain language
- **Multi-tool execution**: Can run multiple tools in parallel for efficiency
- **MCP server support**: Extensible through Model Context Protocol servers
- **File operations**: Advanced read, write, edit capabilities
- **Task planning**: Built-in todo list management for complex tasks

## Installation

```bash
# NPM installation (deprecated - use official installer)
npm install -g @anthropic-ai/claude-code

# Run
claude
```

Latest version: 2.1.73 (actively maintained)

## Configuration

- **Config directory**: `~/.claude/`
- **Skills directory**: `~/.claude/skills/` (70+ skills available)
- **Settings file**: `~/.claude.json`
- **Plugins**: `~/.claude/plugins/`

## GitHub Repositories

### Main Repository
- **URL**: https://github.com/anthropics/claude-code
- **Description**: The AI Code Editor

### Related Official Repos
- **claude-code-action**: GitHub Actions integration
  - URL: https://github.com/anthropics/claude-code-action
- **claude-plugins-official**: Official Anthropic-managed plugins directory

## Skills System

Claude Code supports an extensive skills system with 70+ available skills:

### Categories
- **Google Workspace** (`gws-*`): Gmail, Calendar, Drive, Docs, Sheets, etc.
- **Personas** (`persona-*`): Pre-configured agent behaviors
- **Document Formats**: docx, xlsx, pptx, pdf handling
- **Design & Frontend**: figma, theme-factory, web-artifacts-builder
- **Development**: mcp-builder, skill-creator, webapp-testing
- **Media & Utilities**: screenshot, transcribe, playwright-cli

### Using Skills
```bash
npx openskills read <skill-name>
npx openskills read skill-one,skill-two  # Multiple skills
```

## Usage Patterns

### Basic Usage
```bash
# Start Claude Code
claude

# Common commands
claude "explain this codebase"
claude "fix the authentication bug"
claude "create a PR for this feature"
```

### With MCP Servers
Configure MCP servers in `~/.claude/` to extend capabilities with custom tools.

## Integration with AgentOS

- Default location for agent configs: `~/.agents/`
- Skills reference: `~/AGENTS.md`
- Works seamlessly with Obsidian vault structure
- File-first approach for durable context

## Related

- [[Cursor]] - Another AI code editor
- [[OpenCode]] - Open-source alternative
- [[Custom MCP-backed agents]] - Build custom agents with MCP
- External: [Official Documentation](https://code.claude.com)

## Notes

- Actively maintained by Anthropic
- NPM package updated regularly (last update: 4 hours ago as of research date)
- Supports both autonomous agent mode and collaborative assistant mode
- Can be used in terminal, IDE, or via GitHub (@claude mentions)
