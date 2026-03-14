---
title: Gemini CLI
type: agent
category: ai-coding-assistant
provider: Google
license: Apache-2.0
platform: CLI
homepage: https://geminicli.com
github: https://github.com/google-gemini/gemini-cli
npm: "@google/gemini-cli"
status: active
tags:
  - ai
  - coding
  - terminal
  - google
  - gemini
  - open-source
  - mcp
created: 2026-03-14
updated: 2026-03-14
---

# Gemini CLI

An open-source AI agent that brings the power of Gemini directly into your terminal.

## Overview

Gemini CLI is Google's official open-source command-line interface for Gemini AI models. It brings multi-modal AI capabilities to your terminal, understanding code and automating tasks with full local project context.

## Key Features

- **Open source**: Fully open-source under Apache 2.0 license
- **Multi-modal AI**: Leverages Google's Gemini models
- **MCP server support**: Configure custom tools via Model Context Protocol
- **Local project context**: Understands your entire workspace
- **GitHub Actions integration**: Automated coding teammate for repositories
- **Task automation**: Build workflows and automate routine tasks
- **Code understanding**: Analyzes and explains code
- **No data storage**: Privacy-focused - doesn't store code or context

## Installation

```bash
# Install globally via npm
npm install -g @google/gemini-cli

# Run
gemini
```

## GitHub Repositories

### Main Repository
- **URL**: https://github.com/google-gemini/gemini-cli
- **Description**: An open-source AI agent for terminal-based coding
- **License**: Apache 2.0

### GitHub Actions
- **URL**: https://github.com/google-github-actions/run-gemini-cli
- **Description**: GitHub Action for invoking Gemini CLI
- **Status**: Beta, available worldwide

### Alternative Implementations

- **reugn/gemini-cli**: Multi-turn chat interface for Gemini
  - URL: https://github.com/reugn/gemini-cli
  - Supports various generative models

- **Zibri/gemini-cli**: High-performance C implementation
  - URL: https://github.com/Zibri/gemini-cli
  - Features: Interactive chat, scripting, file attachments, session management
  - No external runtime dependencies

## Configuration

### Settings Location
- **Config file**: `~/.gemini/settings.json`
- **MCP servers**: Configure in settings.json to extend with custom tools

### MCP Integration
```json
{
  "mcpServers": {
    "custom-server": {
      "command": "node",
      "args": ["/path/to/server.js"]
    }
  }
}
```

## Capabilities

### Code Operations
- Code generation and completion
- Bug fixing and refactoring
- Code explanation and documentation
- Multi-file editing
- Context-aware suggestions

### Workflow Automation
- Custom workflow creation
- Integration with existing tools
- Automated routine tasks
- Build and test orchestration

### GitHub Actions Integration
- Acts as autonomous agent for repository tasks
- On-demand collaboration
- Pull request assistance
- No cost for beta users

## Usage

### Basic Commands
```bash
# Start interactive session
gemini

# Ask questions
gemini "explain this function"

# Generate code
gemini "create a REST API endpoint"

# With file context
gemini "refactor this component" --file src/App.js
```

### Advanced Usage
- Configure MCP servers for extended capabilities
- Set up GitHub Actions for automated code review
- Build custom workflows for repetitive tasks
- Integrate with existing CI/CD pipelines

## Documentation

- **Official Docs**: https://geminicli.com/docs/
- **Installation Guide**: https://geminicli.com/docs/get-started/installation/
- **CLI Commands**: https://google-gemini.github.io/gemini-cli/docs/cli/commands.html
- **Deployment**: https://google-gemini.github.io/gemini-cli/docs/get-started/deployment.html
- **Hands-on Codelab**: https://codelabs.developers.google.com/gemini-cli-hands-on

## Integration with AgentOS

- Compatible with MCP server architecture in `~/mcp-servers/`
- Works with file-first vault structure
- Can leverage existing agent configurations
- Complements other CLI agents

## Related

- [[Claude Code]] - Anthropic's CLI coding assistant
- [[OpenCode]] - Open-source multi-provider agent
- [[Custom MCP-backed agents]] - Build custom agents with MCP
- External: [Gemini API Documentation](https://ai.google.dev/)

## Notes

- Fully open-source (Apache 2.0) - unlike many competitors
- First-class MCP support enables extensive customization
- GitHub Actions integration in beta (no cost)
- Privacy-focused: no code or context storage
- Multi-modal capabilities (text, code, images via Gemini models)
- Active development by Google
- Can work with local or cloud-based Gemini models
