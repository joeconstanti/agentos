#!/usr/bin/env node
/**
 * AgentOS Vault Navigator — build.js
 * Scans the vault and regenerates index.html with live data.
 *
 * Usage:  node build.js
 * Run from the agentos_web project folder or anywhere — it resolves paths automatically.
 */

const fs   = require('fs');
const path = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────
const SCRIPT_DIR  = __dirname;
const VAULT_ROOT  = path.resolve(SCRIPT_DIR, '../../');
const AGENTS_DIR  = path.join(VAULT_ROOT, '02_AREAS/agents');
const DOCS_DIR    = path.join(VAULT_ROOT, '03_RESOURCES/Docs');
const SKILLS_DIR  = path.join(path.homedir ? path.homedir() : require('os').homedir(), '.claude/skills');
const OUT_FILE    = path.join(SCRIPT_DIR, 'index.html');

// ── Frontmatter parser ────────────────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { body: content };
  const raw  = match[1];
  const body = content.slice(match[0].length).trim();
  const meta = {};
  let currentKey = null;
  let inList = false;

  for (const line of raw.split('\n')) {
    const listItem = line.match(/^\s+-\s+(.+)/);
    const keyVal   = line.match(/^(\w[\w-]*):\s*(.*)/);

    if (keyVal) {
      currentKey = keyVal[1];
      const val  = keyVal[2].trim();
      if (val === '' || val === null) {
        meta[currentKey] = [];
        inList = true;
      } else {
        meta[currentKey] = val.replace(/^["']|["']$/g, '');
        inList = false;
      }
    } else if (listItem && inList && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(listItem[1].trim());
    }
  }
  return { ...meta, body };
}

// ── Extract H1 title from markdown body ──────────────────────────────────
function extractTitle(body, fallback) {
  const m = body.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : fallback;
}

// ── Extract first non-heading paragraph ──────────────────────────────────
function extractDescription(body) {
  const lines = body.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('#') && !t.startsWith('!') && !t.startsWith('|') && !t.startsWith('-') && !t.startsWith('>') && !t.startsWith('```')) {
      return t.replace(/\[\[.*?\]\]/g, '').replace(/\*\*/g, '').slice(0, 100) + (t.length > 100 ? '…' : '');
    }
  }
  return '';
}

// ── Read all .md files from a directory ──────────────────────────────────
function readMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'))
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      const parsed  = parseFrontmatter(content);
      return { filename: f, ...parsed };
    });
}

// ── Count files in a directory ────────────────────────────────────────────
function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => !f.startsWith('.')).length;
}

function countSkills() {
  const os = require('os');
  const skillsDir = path.join(os.homedir(), '.claude/skills');
  if (!fs.existsSync(skillsDir)) return '—';
  const count = fs.readdirSync(skillsDir).filter(f => !f.startsWith('.')).length;
  return count > 0 ? count + '+' : '—';
}

// ── Emoji icon maps ───────────────────────────────────────────────────────
const AGENT_ICONS = {
  'claude code': '🤖', 'codex': '⚡', 'gemini': '✨',
  'cursor': '🎯', 'opencode': '🟢', 'mcp': '🔌',
  'windsurf': '🌊', 'aider': '🛠️', 'continue': '▶️',
};

const DOC_ICONS = {
  'mcp': '🔌', 'obsidian': '📓', 'skills': '⚙️', 'comfyui': '🎨',
  'n8n': '🔄', 'ollama': '🦙', 'cursor': '🎯', 'rag': '🧠',
  'prompt': '💬', 'workflow': '🗓️', 'agent': '🤖', 'claude': '🤖',
  'getting-started': '🚀', 'guide': '📖', 'build': '🔨',
  'alternatives': '🔄', 'orchestration': '🎼', 'automation': '⚡',
};

function agentIcon(name) {
  const n = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(AGENT_ICONS)) {
    if (n.includes(k)) return v;
  }
  return '🤖';
}

function docIcon(title, tags) {
  const haystack = [(title || ''), ...(Array.isArray(tags) ? tags : [])].join(' ').toLowerCase();
  for (const [k, v] of Object.entries(DOC_ICONS)) {
    if (haystack.includes(k)) return v;
  }
  return '📄';
}

// ── Platform badge ────────────────────────────────────────────────────────
function platformBadge(platform) {
  if (!platform) return 'Agent';
  const p = platform.toLowerCase();
  if (p.includes('cli')) return 'CLI';
  if (p.includes('desktop') || p.includes('gui') || p.includes('editor')) return 'GUI';
  if (p.includes('web')) return 'Web';
  if (p.includes('mcp')) return 'MCP';
  return platform.split(' ')[0];
}

// ── Obsidian URI ──────────────────────────────────────────────────────────
function obsidianURI(filePath) {
  return 'obsidian://open?vault=agentos&file=' + encodeURIComponent(filePath);
}

// ── Build data from vault ─────────────────────────────────────────────────
const agentFiles = readMdFiles(AGENTS_DIR);
const docFiles   = readMdFiles(DOCS_DIR);
const agentCount = agentFiles.length;
const docCount   = docFiles.length;
const skillCount = countSkills();
const buildDate  = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// ── Agent cards HTML ──────────────────────────────────────────────────────
function renderAgentCards() {
  return agentFiles.map(agent => {
    const name     = agent.title || agent.filename.replace('.md', '');
    const provider = agent.provider || '';
    const platform = platformBadge(agent.platform || '');
    const icon     = agentIcon(name);
    const tags     = Array.isArray(agent.tags) ? agent.tags.filter(t => !['ai','coding'].includes(t)).slice(0, 3) : [];
    const filePath = '02_AREAS/agents/' + agent.filename.replace('.md', '');

    return `
          <a class="glass agent-card" href="${obsidianURI(filePath)}" style="--glow:rgba(255,140,66,0.18)">
            <div class="agent-icon">${icon}</div>
            <div class="agent-name">${name}</div>
            <div class="agent-provider">${provider}${provider && platform ? ' &middot; ' : ''}${platform}</div>
            <ul class="agent-features">
              ${tags.map(t => `<li>${t}</li>`).join('\n              ')}
            </ul>
          </a>`;
  }).join('\n');
}

// ── Doc cards HTML ────────────────────────────────────────────────────────
function renderDocCards() {
  return docFiles.map(doc => {
    const name   = doc.filename.replace('.md', '');
    const title  = extractTitle(doc.body || '', name);
    const desc   = extractDescription(doc.body || '');
    const tags   = Array.isArray(doc.tags) ? doc.tags : [];
    const icon   = docIcon(title, tags);
    const filePath = '03_RESOURCES/Docs/' + encodeURIComponent(name);

    return `
      <a class="glass doc-card" href="${obsidianURI(filePath)}">
        <div class="doc-icon">${icon}</div>
        <div class="doc-title">${title}</div>
        <div class="doc-sub">${desc || tags.slice(0,2).join(', ')}</div>
      </a>`;
  }).join('\n');
}

// ── Full HTML template ────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentOS – Vault Navigator</title>
  <!-- Generated by build.js on ${new Date().toISOString()} -->
  <style>
    :root {
      --orange:      #ff8c42;
      --orange-dim:  #cc6a28;
      --orange-glow: rgba(255,140,66,0.22);
      --orange-soft: rgba(255,140,66,0.10);
      --bg:          #080604;
      --surface:     rgba(255,255,255,0.035);
      --border:      rgba(255,255,255,0.07);
      --text:        #f0ebe3;
      --text-muted:  #6b6055;
      --text-sub:    #9e9080;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      background-image:
        radial-gradient(ellipse 70% 50% at 15% 5%,  rgba(255,120,40,0.10) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 85% 90%, rgba(255,80,20,0.08)  0%, transparent 60%),
        radial-gradient(ellipse 35% 30% at 55% 40%, rgba(180,60,10,0.05)  0%, transparent 50%);
      min-height: 100vh;
      color: var(--text);
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    /* ── Glass ── */
    .glass {
      background: var(--surface);
      backdrop-filter: blur(20px) saturate(1.3);
      -webkit-backdrop-filter: blur(20px) saturate(1.3);
      border: 1px solid var(--border);
      border-radius: 14px;
      position: relative;
      overflow: hidden;
    }
    .glass::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,160,80,0.15), transparent);
      pointer-events: none;
    }

    /* ── Live dot ── */
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .live-dot {
      display: inline-block; width: 7px; height: 7px;
      background: #ff8c42; border-radius: 50%;
      box-shadow: 0 0 8px #ff8c42;
      animation: pulse 2.5s infinite;
      margin-right: 6px; vertical-align: middle;
    }

    /* ── Header ── */
    .header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 28px;
    }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-mark {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #ff8c42, #e05520);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 1.1rem; color: #fff;
      box-shadow: 0 0 24px rgba(255,120,50,0.45);
      flex-shrink: 0;
    }
    .logo-text { font-size: 1.2rem; font-weight: 700; letter-spacing: 0.08em; color: #f5ede3; }
    .logo-sub  { font-size: 0.68rem; color: var(--orange); letter-spacing: 0.15em; text-transform: uppercase; }
    .header-right { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; }

    /* ── Section label ── */
    .section-label {
      font-size: 0.65rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-muted);
      font-weight: 600;
      margin-bottom: 10px;
      padding-left: 2px;
    }

    /* ── Quick stats ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-widget { padding: 16px 18px; }
    .stat-label  { font-size: 0.67rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--orange); margin-bottom: 7px; font-weight: 600; }
    .stat-value  { font-size: 1.85rem; font-weight: 700; color: #f5ede3; line-height: 1; letter-spacing: -0.02em; }
    .stat-sub    { font-size: 0.7rem; color: var(--text-muted); margin-top: 5px; }

    /* ── Main grid ── */
    .main-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    /* ── Agent grid ── */
    .agents-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .agent-card {
      padding: 18px;
      cursor: pointer;
      text-decoration: none;
      display: block;
      color: inherit;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .agent-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,140,66,0.18);
    }
    .agent-card::after {
      content: '';
      position: absolute; bottom: 0; right: 0;
      width: 100px; height: 100px;
      background: radial-gradient(circle at 80% 80%, var(--glow, var(--orange-glow)), transparent 70%);
      pointer-events: none;
    }
    .agent-icon     { width: 36px; height: 36px; border-radius: 9px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 10px; }
    .agent-name     { font-size: 0.88rem; font-weight: 700; color: #f5ede3; margin-bottom: 2px; }
    .agent-provider { font-size: 0.68rem; color: var(--orange); font-weight: 500; margin-bottom: 10px; }
    .agent-features { list-style: none; display: flex; flex-direction: column; gap: 3px; }
    .agent-features li { font-size: 0.7rem; color: var(--text-sub); padding-left: 12px; position: relative; }
    .agent-features li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--orange); opacity: 0.5; }

    /* ── Side panel ── */
    .side-panel { display: flex; flex-direction: column; gap: 12px; }

    /* ── Quick links list ── */
    .link-list { padding: 14px 16px; }
    .link-list-title { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--orange); font-weight: 600; margin-bottom: 12px; }
    .link-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.8rem; transition: background 0.15s; }
    .link-item:hover { background: rgba(255,140,66,0.09); color: #ffd4a8; }
    .link-item .li-icon { font-size: 0.95rem; width: 20px; text-align: center; flex-shrink: 0; }
    .link-item .li-sub  { font-size: 0.65rem; color: var(--text-muted); margin-top: 1px; }
    .link-item-inner    { display: flex; flex-direction: column; }
    hr.link-sep { border: none; border-top: 1px solid var(--border); margin: 6px 0; }

    /* ── Docs row ── */
    .docs-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .doc-card {
      padding: 14px 16px;
      text-decoration: none; color: inherit; display: block;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .doc-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,140,66,0.15);
    }
    .doc-card::after {
      content: '';
      position: absolute; bottom: 0; right: 0;
      width: 80px; height: 80px;
      background: radial-gradient(circle at 80% 80%, var(--orange-glow), transparent 70%);
      pointer-events: none;
    }
    .doc-icon  { font-size: 1.2rem; margin-bottom: 8px; }
    .doc-title { font-size: 0.8rem; font-weight: 600; color: #f5ede3; margin-bottom: 3px; }
    .doc-sub   { font-size: 0.68rem; color: var(--text-muted); }

    /* ── Build stamp ── */
    .build-stamp {
      text-align: center;
      font-size: 0.62rem;
      color: var(--text-muted);
      margin-top: 32px;
      opacity: 0.5;
    }

    /* ── Responsive ── */
    @media (max-width: 1100px) {
      .docs-row { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 1000px) {
      .main-grid { grid-template-columns: 1fr; }
      .agents-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 700px) {
      .agents-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-row   { grid-template-columns: repeat(2, 1fr); }
      .docs-row    { grid-template-columns: repeat(2, 1fr); }
      .header-right { display: none; }
      .container   { padding: 20px 14px; }
    }
    @media (max-width: 480px) {
      .agents-grid { grid-template-columns: 1fr; }
      .docs-row    { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Header -->
    <header class="header">
      <div class="logo">
        <div class="logo-mark">A</div>
        <div>
          <div class="logo-text">AGENTOS</div>
          <div class="logo-sub">Vault Navigator</div>
        </div>
      </div>
      <div class="header-right">
        <span class="live-dot"></span>${agentCount} agents &middot; ${buildDate}
      </div>
    </header>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="glass stat-widget">
        <div class="stat-label">Active Agents</div>
        <div class="stat-value">${agentCount}</div>
        <div class="stat-sub">All profiles tracked</div>
      </div>
      <div class="glass stat-widget">
        <div class="stat-label">Skills Available</div>
        <div class="stat-value">${skillCount}</div>
        <div class="stat-sub">~/.claude/skills/</div>
      </div>
      <div class="glass stat-widget">
        <div class="stat-label">Docs &amp; Guides</div>
        <div class="stat-value">${docCount}</div>
        <div class="stat-sub">03_RESOURCES/Docs/</div>
      </div>
      <div class="glass stat-widget">
        <div class="stat-label">Sessions Today</div>
        <div class="stat-value">&mdash;</div>
        <div class="stat-sub">Connect data source</div>
      </div>
    </div>

    <!-- Main content grid -->
    <div class="main-grid">

      <!-- Left: Agent cards -->
      <div>
        <div class="section-label">Agent Profiles</div>
        <div class="agents-grid">
${renderAgentCards()}
        </div>
      </div>

      <!-- Right: Quick nav -->
      <div class="side-panel">
        <div class="link-list glass">
          <div class="link-list-title">Quick Access</div>
          <a class="link-item" href="obsidian://open?vault=agentos">
            <span class="li-icon">🏠</span>
            <div class="link-item-inner"><span>Open Vault</span><span class="li-sub">agentos root</span></div>
          </a>
          <a class="link-item" href="obsidian://daily">
            <span class="li-icon">📅</span>
            <div class="link-item-inner"><span>Daily Note</span><span class="li-sub">Today's entry</span></div>
          </a>
          <a class="link-item" href="obsidian://open?vault=agentos&file=00_INBOX">
            <span class="li-icon">📥</span>
            <div class="link-item-inner"><span>Inbox</span><span class="li-sub">00_INBOX/</span></div>
          </a>
          <a class="link-item" href="obsidian://search?vault=agentos&query=">
            <span class="li-icon">🔍</span>
            <div class="link-item-inner"><span>Search Vault</span><span class="li-sub">Quick find</span></div>
          </a>
          <hr class="link-sep">
          <a class="link-item" href="obsidian://open?vault=agentos&file=01_PROJECTS/agentos_web">
            <span class="li-icon">🚀</span>
            <div class="link-item-inner"><span>AgentOS Web</span><span class="li-sub">01_PROJECTS/agentos_web</span></div>
          </a>
          <a class="link-item" href="obsidian://open?vault=agentos&file=02_AREAS/agents">
            <span class="li-icon">🤖</span>
            <div class="link-item-inner"><span>All Agents</span><span class="li-sub">02_AREAS/agents/</span></div>
          </a>
          <a class="link-item" href="obsidian://open?vault=agentos&file=03_RESOURCES/Templates/main">
            <span class="li-icon">📄</span>
            <div class="link-item-inner"><span>Templates</span><span class="li-sub">03_RESOURCES/Templates/</span></div>
          </a>
          <a class="link-item" href="obsidian://open?vault=agentos&file=03_RESOURCES/Playbooks">
            <span class="li-icon">▶️</span>
            <div class="link-item-inner"><span>Playbooks</span><span class="li-sub">03_RESOURCES/Playbooks/</span></div>
          </a>
        </div>
      </div>
    </div>

    <!-- Docs row -->
    <div class="section-label">Guides &amp; Resources</div>
    <div class="docs-row">
${renderDocCards()}
    </div>

    <div class="build-stamp">Generated by build.js &middot; ${new Date().toISOString()}</div>

  </div>
</body>
</html>`;

// ── Write output ──────────────────────────────────────────────────────────
fs.writeFileSync(OUT_FILE, html, 'utf8');
console.log(`✓ index.html rebuilt`);
console.log(`  ${agentCount} agents · ${docCount} docs · ${skillCount} skills`);
console.log(`  → ${OUT_FILE}`);
