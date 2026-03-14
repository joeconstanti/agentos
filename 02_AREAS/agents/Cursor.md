---
title: Cursor
type: agent
category: ai-code-editor
provider: Cursor
license: Proprietary
platform: Desktop (macOS, Windows, Linux)
homepage: https://cursor.com
github: https://github.com/cursor/cursor
status: active
tags:
  - ai
  - coding
  - editor
  - vscode
  - autocomplete
  - composer
created: 2026-03-14
updated: 2026-03-14
---

# Cursor

The AI-first code editor built for pair programming with AI.

## Overview

Cursor is an AI-powered code editor built on VS Code that provides intelligent code generation, editing, and assistance. It's designed from the ground up for AI-enhanced development with features like chat, autocomplete, and autonomous agent mode.

## Key Features

### AI Code Autocomplete
- Multi-line code completions
- Smart predictions based on context and recent changes
- Suggests entire code blocks
- Context-aware next-line suggestions

### Chat Assistant
- Built-in chat interface aware of your codebase
- Ask questions about code
- Get bug fixes and optimization suggestions
- One-click code application from chat
- Codebase-wide understanding

### Composer & Agent Mode
- **Composer**: Describe high-level changes or features
- **Agent Mode**: AI takes autonomous actions
  - Edit multiple files independently
  - Run build and test commands
  - Complete complex multi-file tasks

### Multi-Model Support
- OpenAI (GPT-4, etc.)
- Anthropic (Claude)
- Google (Gemini)
- xAI (Grok)
- Choose models freely per task

### VS Code Compatibility
- Built on VS Code foundation
- Use any VS Code extension
- Import extensions, themes, and keybindings directly
- Familiar interface and shortcuts

### Extensibility
- MCP (Model Context Protocol) support
- Connect external tools and data sources
- Custom, reusable, scoped instructions
- Plugin system for extended functionality

## Installation

Download from https://cursor.com for your platform:
- macOS
- Windows
- Linux

## GitHub Repositories

### Main Repository
- **URL**: https://github.com/cursor/cursor
- **Description**: The AI Code Editor
- **Stars**: 32.4k
- **Forks**: 2.2k

### Related Cursor Repositories
- **cursor/plugins**: Plugin specification and official plugins
- **cursor/mcp-servers**: List of MCP servers for developer tools
- **cursor/agent-trace**: Standard format for tracing AI-generated code

### Community Resources
- **awesome-cursorrules**: Configuration files that enhance Cursor experience
  - URL: https://github.com/PatrickJS/awesome-cursorrules
  - Custom rules and behaviors

## Configuration

### Settings Location
- **macOS**: `~/.cursor/`
- **Windows**: `%APPDATA%\Cursor`
- **Linux**: `~/.config/Cursor`

### Environment Variables
```bash
export EDITOR=cursor  # Set as default editor
```

### Custom Rules
Create `.cursorrules` files to customize AI behavior per project.

## Usage

### Basic Operations
```bash
# Open current directory
cursor .

# Open specific file
cursor path/to/file

# Open project
cursor /path/to/project
```

### In-Editor Features
- **Cmd/Ctrl+K**: Generate code from description
- **Cmd/Ctrl+L**: Open chat
- **Tab**: Accept autocomplete suggestion
- **Composer**: High-level feature descriptions
- **Agent Mode**: Autonomous multi-file editing

### Keyboard Shortcuts
Inherits all VS Code shortcuts plus Cursor-specific:
- **Cmd+Shift+L**: Toggle between models
- **Cmd+I**: Inline edit mode
- **Cmd+K**: Command palette for AI actions

## Advanced Capabilities

### Context Management
- Automatically indexes codebase
- Understands project structure
- Maintains conversation context
- Suggests relevant files for tasks

### Code Intelligence
- LSP (Language Server Protocol) integration
- Syntax highlighting
- IntelliSense
- Refactoring tools
- Debugging support

### Collaboration
- Share chat conversations
- Export AI-generated code changes
- Review and approve suggestions
- Track AI modifications

## Integration with AgentOS

- Set as default editor: `EDITOR=cursor`
- Works seamlessly with file-first workflow
- Can open entire AgentOS vault
- Understands linked note structure
- Complements terminal-based agents

## Pricing

- **Free tier**: Available with limitations
- **Pro**: $20/month (individual)
- **Business**: Custom pricing (teams)

Check https://cursor.com/pricing for current pricing.

## Related

- [[Claude Code]] - Terminal-based AI coding
- [[OpenCode]] - Open-source CLI alternative
- [[Codex]] - OpenAI's coding agent
- External: [Cursor Documentation](https://cursor.com/features)
- External: [VS Code](https://code.visualstudio.com)

## Notes

- Most popular AI-first code editor (32.4k+ GitHub stars)
- Built on proven VS Code foundation
- Regular updates and active development
- Strong community and plugin ecosystem
- Privacy options available (local models, private mode)
- Composer mode particularly powerful for large refactors
- Agent mode can save significant time on multi-file tasks
- Free tier suitable for evaluation and light use
