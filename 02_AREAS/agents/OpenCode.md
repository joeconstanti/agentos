---
title: OpenCode
type: agent
category: ai-coding-assistant
provider: Anomaly (formerly OpenCode AI)
license: MIT
platform: CLI
homepage: https://opencode.ai
github: https://github.com/anomalyco/opencode
language: Go
status: active
tags:
  - ai
  - coding
  - terminal
  - open-source
  - multi-provider
  - lsp
  - tui
created: 2026-03-14
updated: 2026-03-14
---

# OpenCode

The open-source AI coding agent built for the terminal.

## Overview

OpenCode is a powerful, open-source AI coding agent built in Go that brings AI assistance directly to your terminal. It provides a TUI (Terminal User Interface) for interacting with various AI models and is provider-agnostic, supporting multiple AI services and local models.

## Key Features

- **Open source**: MIT License - fully open and transparent
- **Multi-provider support**: Not locked to any single AI provider
  - Claude (Anthropic)
  - OpenAI (GPT models)
  - Google (Gemini)
  - Local models (Ollama, etc.)
- **Terminal User Interface (TUI)**: Rich interactive terminal experience
- **LSP Integration**: Language Server Protocol support for code intelligence
  - Multi-language code intelligence
  - Real-time syntax checking
  - Smart completions
- **Privacy-focused**: No data storage - your code stays local
- **Go-based**: Fast, lightweight, single-binary distribution
- **Provider flexibility**: Use OpenCode Zen or bring your own API keys

## Installation

```bash
# Installation instructions available at opencode.ai
# Typically via direct download or package manager

# Run
opencode
```

## GitHub Repositories

### Current Active Repository
- **URL**: https://github.com/anomalyco/opencode
- **Maintainer**: Anomaly
- **License**: MIT
- **Language**: Go
- **Status**: Active development

### Previous Repository (Archived)
- **URL**: https://github.com/opencode-ai/opencode
- **Stars**: 11.4k
- **Forks**: 1.1k
- **Status**: Archived (Sep 18, 2025) - read-only

### Community Resources
- **awesome-opencode**: Curated plugins, themes, agents, and resources
  - URL: https://github.com/awesome-opencode/awesome-opencode

### Alternative Implementations
- **opencode-go**: Go implementation fork
  - URL: https://github.com/z23cc/opencode-go

## Architecture

### Core Technology
- **Language**: Go
- **Distribution**: Single binary
- **Interface**: Terminal User Interface (TUI)
- **Protocol**: LSP for code intelligence

### AI Provider Integration
OpenCode acts as an abstraction layer over multiple AI providers:
1. Configure preferred provider
2. Set API keys (or use OpenCode Zen)
3. Switch providers seamlessly
4. Use local models for offline work

## Configuration

### Typical Setup
- Config location varies by platform
- Provider API keys
- Model preferences
- TUI customization
- LSP server settings

### Provider Setup Examples

```bash
# Using Claude
export ANTHROPIC_API_KEY=your_key

# Using OpenAI
export OPENAI_API_KEY=your_key

# Using local Ollama
# No API key needed - connect to local instance
```

## Capabilities

### Code Operations
- Code generation from descriptions
- Bug detection and fixing
- Code refactoring
- Documentation generation
- Multi-file understanding
- Syntax-aware editing

### Language Support
Via LSP integration:
- JavaScript/TypeScript
- Python
- Go
- Rust
- Java
- C/C++
- And many more through LSP servers

### Workflow Features
- Interactive TUI for better context
- History and session management
- File tree navigation
- Diff viewing
- Code review assistance

## Usage Patterns

### Basic Workflow
1. Navigate to project directory
2. Launch `opencode`
3. Interact via TUI
4. Choose AI provider/model
5. Describe coding tasks
6. Review and apply changes

### Provider Flexibility
- Start with one provider
- Switch based on task requirements
- Use local models when offline
- Optimize costs by choosing appropriate models

## Integration with AgentOS

- Compatible with file-first workflow
- Works in `agents/` directory structure
- Can leverage shared playbooks
- Complements other CLI agents
- No vendor lock-in

## Documentation

- **Official Site**: https://opencode.ai
- **Docs**: https://opencode.ai/docs/
- **GitHub Integration**: https://opencode.ai/docs/github/
- **Navigator AI Integration**: https://docs.ai.it.ufl.edu/docs/navigator_toolkit/integrations/opencode/

## Community

- Active community around awesome-opencode
- Plugin ecosystem developing
- Themes and customization options
- Growing resource library

## Advantages

### vs. Proprietary Tools
- ✅ Open source (MIT)
- ✅ No vendor lock-in
- ✅ Multi-provider flexibility
- ✅ Privacy (no data storage)
- ✅ Local model support

### vs. Other Open Source
- ✅ Go-based (fast, single binary)
- ✅ Rich TUI experience
- ✅ LSP integration
- ✅ Active development
- ✅ Provider agnostic

## Related

- [[Claude Code]] - Proprietary but powerful CLI
- [[Codex]] - OpenAI's coding agent
- [[Gemini CLI]] - Google's open-source CLI
- [[Cursor]] - GUI-based AI editor
- External: [OpenCode Website](https://opencode.ai)
- External: [OpenCode GitHub](https://github.com/anomalyco/opencode)

## Notes

- Previously maintained under opencode-ai organization
- Now maintained by Anomaly (anomalyco)
- Archive of original repo has 11.4k stars - showing strong community interest
- MIT license ensures long-term usability
- Provider flexibility is key differentiator
- Go implementation means fast startup and low memory
- TUI provides better context than simple REPL
- LSP integration gives production-grade code intelligence
- Privacy-focused: doesn't send unnecessary data
- Can work completely offline with local models
- Recommended for users who want control and flexibility
