---
id: 20260314223653
type: note
status: draft
created: 2026-03-14 22:36
tags: [claude-code, skills, research, ai-tools]
area: inbox
---

# Top 10 Claude Code Skills - Research Report

## Executive Summary

Based on analysis of the Claude Code skills ecosystem (60,000+ published skills as of March 2026) and examination of the local skills repository (73 skills installed), this report identifies the top 10 most valuable Claude Code skills for developers and knowledge workers.

## Methodology

- Analyzed AGENTS.md skill catalog (17 officially documented skills)
- Examined local ~/.claude/skills/ directory (73 installed skills)
- Reviewed web research on skill popularity, install counts, and use cases
- Considered skill categories: document processing, design, integration, development tools, and workflow automation

## Top 10 Claude Code Skills

### 1. **frontend-design**
**Category:** Design & Development
**Install Count:** 277,000+ (March 2026)
**Official:** Yes (Anthropic)

Creates distinctive, production-grade frontend interfaces with high design quality. Breaks the pattern of "distributional convergence" where AI models reproduce statistically average designs. Used for building web components, pages, dashboards, React components, and HTML/CSS layouts.

**Key Features:**
- Pushes Claude to make deliberate aesthetic choices before coding
- Generates creative, polished UI that avoids generic AI aesthetics
- Supports websites, landing pages, and web applications

### 2. **docx**
**Category:** Document Processing
**Universality:** Highest
**Official:** Yes (Anthropic)

Comprehensive Word document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. Described as one of "the most universally useful Claude Code skills available."

**Key Features:**
- Create and modify professional documents
- Track changes and add comments
- Preserve formatting during edits
- Extract text for analysis

### 3. **xlsx**
**Category:** Document Processing
**Universality:** Highest
**Official:** Yes (Anthropic)

Comprehensive spreadsheet creation, editing, and analysis with formulas, formatting, data analysis, and visualization. Supports .xlsx, .xlsm, .csv, .tsv formats.

**Key Features:**
- Create spreadsheets with formulas and formatting
- Read and analyze data
- Modify while preserving formulas
- Data analysis and visualization
- Formula recalculation

### 4. **pdf**
**Category:** Document Processing
**Universality:** Highest
**Official:** Yes (Anthropic)

PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms.

**Key Features:**
- Fill PDF forms programmatically
- Extract text and tables
- Create and merge PDFs
- Process PDFs at scale

### 5. **pptx**
**Category:** Document Processing
**Universality:** High
**Official:** Yes (Anthropic)

Presentation creation, editing, and analysis for .pptx files with layout management and speaker notes.

**Key Features:**
- Create and edit presentations
- Work with layouts and themes
- Add comments and speaker notes
- Analyze presentation content

### 6. **mcp-builder**
**Category:** Development Tools
**Official:** Yes (Anthropic)

Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Supports both Python (FastMCP) and Node/TypeScript (MCP SDK).

**Key Features:**
- Build MCP servers for external API integration
- Follow best practices and patterns
- Support for multiple programming languages

### 7. **web-artifacts-builder**
**Category:** Development Tools
**Official:** Yes (Anthropic)

Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using React, Tailwind CSS, and shadcn/ui. For complex artifacts requiring state management, routing, or shadcn/ui components.

**Key Features:**
- Modern frontend web technologies
- State management and routing
- shadcn/ui component integration
- Complex multi-component artifacts

### 8. **skill-creator**
**Category:** Meta/Development
**Official:** Yes (Anthropic)

Guide for creating effective skills that extend Claude's capabilities with specialized knowledge, workflows, or tool integrations.

**Key Features:**
- Create new skills from scratch
- Update existing skills
- Follow skill creation best practices
- Extend Claude's capabilities

### 9. **theme-factory**
**Category:** Design
**Official:** Yes (Anthropic)

Toolkit for styling artifacts with themes. Works with slides, docs, reports, HTML landing pages, etc. Includes 10 pre-set themes with colors/fonts, or can generate themes on-the-fly.

**Key Features:**
- Apply pre-set themes to artifacts
- Generate custom themes
- Consistent styling across artifact types
- Professional color/font combinations

### 10. **Google Workspace Suite (gws-*)**
**Category:** Integration & Automation
**Skill Count:** 30+ individual skills
**Official:** Community

Comprehensive Google Workspace integration including Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Tasks, Chat, Meet, Keep, Classroom, and People. Includes workflow automation skills for common tasks.

**Key Components:**
- **gws-gmail**: Email management, search, and organization
- **gws-calendar**: Calendar management and event scheduling
- **gws-drive**: File storage and sharing
- **gws-docs**: Document creation and editing
- **gws-workflow-***: Pre-built workflows (email-to-task, weekly-digest, meeting-prep, standup-report)

## Honorable Mentions

### webapp-testing
Playwright-based toolkit for testing local web applications, verifying frontend functionality, and debugging UI behavior.

### doc-coauthoring
Structured workflow for co-authoring documentation, proposals, technical specs, and decision docs.

### Composio Integration
Not a single skill but an integration backbone supporting 850+ SaaS apps with OAuth lifecycle management, scoped credentials, and standardized action schemas.

### Persona Skills
Specialized personas for different workflows:
- persona-exec-assistant
- persona-researcher
- persona-content-creator
- persona-project-manager

## Key Insights

### Ecosystem Statistics
- **60,000+ published skills** as of March 2026
- Skills available for Pro, Max, Team, and Enterprise tiers (not Free tier)
- Progressive disclosure: ~100 tokens for metadata scanning, <5k tokens when activated

### Skill Categories by Value
1. **Document Processing** (docx, pdf, xlsx, pptx): Most universally useful
2. **Design & Frontend** (frontend-design, theme-factory): High install counts
3. **Development Tools** (mcp-builder, web-artifacts-builder): Essential for developers
4. **Integration** (Google Workspace suite): Workflow automation
5. **Meta Skills** (skill-creator): Ecosystem expansion

### Usage Patterns
- Developers use Claude Code to plan multi-step features, run test suites, refactor legacy modules, and generate infrastructure configurations
- Document skills serve the broadest user base across all industries
- Design skills differentiate by producing non-generic, thoughtful aesthetics
- Integration skills enable Claude to take actions across 1000+ apps

## Recommendations

### For General Users
Start with the **document processing quad**: docx, pdf, xlsx, pptx. These provide immediate value for everyday tasks.

### For Developers
Prioritize **frontend-design**, **mcp-builder**, and **web-artifacts-builder** for building production-grade interfaces and integrations.

### For Workflow Automation
Explore the **Google Workspace suite** (gws-*) for email, calendar, and document automation.

### For Customization
Use **skill-creator** to build domain-specific skills tailored to your unique workflows.

## References

- Local AGENTS.md catalog (17 project skills)
- Local ~/.claude/skills/ directory (73 installed skills)
- Web research: Composio, Snyk, GitHub awesome-claude-skills repositories
- Skill ecosystem: 60,000+ published skills (March 2026)
- Frontend-design install count: 277,000+ (March 2026)

---

*Research conducted: March 14, 2026*
*Document status: Draft*
*Area: Inbox*
