# AGENTOS Web Dashboard — Design Spec

**Date:** 2026-03-25
**Status:** Approved

---

## Overview

A single static HTML file (`index.html`) inside `01_PROJECTS/agentos_web/` that serves as a glassmorphic control-panel dashboard for the AgentOS vault. No build step, no dependencies, no external fonts or icon libraries — open directly in any browser. All CSS and minimal JS inline in the file.

**Page title:** `AgentOS – Control Panel`

---

## Layout

**Layout B: Stats Header + Agent Grid**

```
┌─────────────────────────────────────────────────────┐
│  [A] AGENTOS / Control Panel       ● 6 agents · date │
├──────────┬──────────┬──────────┬────────────────────┤
│ ACTIVE   │ SESSIONS │ SKILLS   │ TOKENS USED        │
│ AGENTS   │ TODAY    │ AVAIL.   │                    │
│    6     │   —      │  70+     │   —                │
├──────────┴──────────┴──────────┴────────────────────┤
│ Claude Code  │ Codex        │ Gemini CLI            │
│ OpenCode     │ Cursor       │ Custom MCP Agents     │
└─────────────────────────────────────────────────────┘
```

Max-width: 1280px, centred. Fluid between 900–1280px. Below 900px the agent grid collapses to 2 columns; below 600px to 1 column. Stats row stays 4-column down to 600px then wraps to 2×2.

---

## Agents (all 6)

Source: vault notes in `02_AREAS/agents/`. Values below are canonical.

| Agent | Provider | Platform | Accent | Icon (emoji) |
|---|---|---|---|---|
| Claude Code | Anthropic | CLI | `#7c6fff` | 🤖 |
| Codex | OpenAI | CLI | `#4f8fff` | ⚡ |
| Gemini CLI | Google | CLI | `#4fc3f7` | ✨ |
| Cursor | Cursor | GUI | `#c084fc` | 🎯 |
| OpenCode | Anomaly | CLI | `#3dffa0` | 🟢 |
| Custom MCP Agents | Various | MCP | `#ff9a5c` | 🔌 |

### Key features per card (exactly 3, in order)

**Claude Code**
1. Terminal-native, full MCP server support
2. 70+ skills ecosystem
3. Git + PR workflow integration

**Codex**
1. Sandboxed code execution
2. Multi-file reasoning
3. GitHub Actions integration

**Gemini CLI**
1. 1M token context window
2. Open source (Apache 2.0)
3. Google services integration

**Cursor**
1. VS Code-based GUI editor
2. Tab autocomplete
3. Composer for multi-file edits

**OpenCode**
1. Multi-provider: Claude, GPT, Gemini, Ollama
2. Rich TUI + LSP integration
3. Privacy-first, no data storage

**Custom MCP Agents**
1. Build with any LLM provider
2. Extensible tool registry
3. Lives in `~/mcp-servers/`

---

## Agent Card Anatomy

Each card contains, top to bottom:
1. **Header row** — emoji icon (40×40px rounded box) left, status badge right
2. **Agent name** — bold, 1rem
3. **Provider · Platform** — accent-coloured, 0.73rem
4. **Feature list** — 3 items, bullet-dot in accent colour, 0.75rem grey
5. **Stat bar** — a small inset panel at the bottom showing a `label / value` pair (see below)

**Stat bar:** A `div` with subtle inner background (`rgba(255,255,255,0.04)`), `1px rgba(255,255,255,0.07)` border, `8px` radius, `10px 12px` padding. Displays two items inline: a small uppercase grey label (`#554f88`, `0.68rem`, `letter-spacing: 0.08em`) on the left, and a bold accent-coloured value (`var(--accent)`, `0.85rem`, `font-weight: 700`) on the right. All six cards use `"Tasks this week"` as the label and `"—"` as the placeholder value, except Custom MCP Agents which uses `"Servers running"` / `"—"`.

**Icon box:** 40×40px, `border-radius: 10px`, `background: rgba(255,255,255,0.07)`, `border: 1px solid rgba(255,255,255,0.1)`, emoji centred at `1.2rem`.

**Status badges:**
- Five agents → green `ACTIVE` badge (`rgba(61,255,160,0.12)` bg, `#3dffa0` text)
- Custom MCP Agents → amber `CUSTOM` badge (`rgba(255,195,30,0.12)` bg, `#ffc31e` text)

---

## Header Stats Row (4 widgets)

| Position | Label (uppercase) | Value | Sub-text |
|---|---|---|---|
| 1 | ACTIVE AGENTS | `6` | All systems nominal |
| 2 | SESSIONS TODAY | `—` | Connect data source |
| 3 | SKILLS AVAILABLE | `70+` | ~/.claude/skills/ |
| 4 | TOKENS USED | `—` | Connect data source |

Each widget: `18px 20px` padding, `::before` top-edge shimmer (see Visual Style), plus a `::after` accent glow in the bottom-right corner.

### Widget glow (::after on each stat widget)
```css
content: '';
position: absolute;
bottom: -20px; right: -10px;
width: 80px; height: 80px;
background: radial-gradient(circle, <glow-colour>, transparent 70%);
pointer-events: none;
```

Glow colours by widget position:
| Widget | Glow colour |
|---|---|
| Active Agents (1) | `rgba(124,111,255,0.25)` |
| Sessions Today (2) | `rgba(79,143,255,0.25)` |
| Skills Available (3) | `rgba(61,255,160,0.20)` |
| Tokens Used (4) | `rgba(255,100,200,0.20)` |

---

## Visual Style

### Background
```css
background: #05040f;
background-image:
  radial-gradient(ellipse 80% 50% at 20% 10%, rgba(96,57,222,0.18) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 80% 90%, rgba(20,100,180,0.15) 0%, transparent 60%),
  radial-gradient(ellipse 40% 30% at 60% 30%, rgba(180,60,220,0.08) 0%, transparent 50%);
```

### Glass card base
```css
background: rgba(255,255,255,0.045);
backdrop-filter: blur(20px) saturate(1.4);
-webkit-backdrop-filter: blur(20px) saturate(1.4);
border: 1px solid rgba(255,255,255,0.09);
border-radius: 16px;
```

### Top-edge shimmer (::before on each glass element)
```css
content: '';
position: absolute; top: 0; left: 0; right: 0; height: 1px;
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
```

### Card hover
```css
transition: transform 0.2s ease, box-shadow 0.2s ease;
/* on :hover */
transform: translateY(-3px);
box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.12);
```

### Live dot animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
/* element: 7×7px circle, background #3dffa0, box-shadow 0 0 8px #3dffa0, animation: pulse 2s infinite */
```

### Typography
- Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` (SF Pro Display omitted — covered by -apple-system on macOS)
- Stat labels: uppercase, `letter-spacing: 0.1em`, `0.7rem`, accent colour
- Card provider line: accent colour, `0.73rem`
- Feature bullets: `#9993cc`, `0.75rem`

---

## File Structure

```
01_PROJECTS/agentos_web/
  index.html                          ← dashboard (single file, inline CSS)
  docs/
    superpowers/specs/
      2026-03-25-agentos-dashboard-design.md
  .superpowers/                       ← brainstorm session (gitignored)
```

Add `.superpowers/` to `.gitignore` if not present.

---

## Out of Scope

- No JS framework, no npm, no external CDN links
- Placeholder stats (`—`) are static strings; live data wiring is a future task
- No routing, no auth, no backend
- No dark/light mode toggle (dark only)
