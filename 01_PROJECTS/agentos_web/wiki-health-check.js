#!/usr/bin/env node
/**
 * wiki-health-check.js
 * AgentOS vault health checker — inspired by Karpathy's LLM KB workflow.
 *
 * Usage:
 *   node wiki-health-check.js               # print report to terminal
 *   node wiki-health-check.js --write-report # also write 00_INBOX/_health-report.md
 *
 * Checks:
 *   1. Orphaned notes (no inbound wikilinks)
 *   2. Stub notes (< 100 words)
 *   3. Missing required frontmatter fields
 *   4. Notes with no outbound wikilinks
 *   5. Uncompiled raw sources in 05_RAW/ older than 7 days
 *   6. Note counts per top-level folder
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const VAULT_ROOT = path.resolve(__dirname, '../..'); // two levels up from 01_PROJECTS/agentos_web/
const REQUIRED_FRONTMATTER = ['id', 'type', 'status', 'created', 'tags'];
const STUB_THRESHOLD = 100; // words
const RAW_STALE_DAYS = 7;
const WRITE_REPORT = process.argv.includes('--write-report');

// Folders to exclude from general checks
const EXCLUDE_DIRS = new Set([
  '.obsidian',
  '.git',
  '.claude',
  'installer',
  'node_modules',
  '.superpowers',
]);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Recursively collect all .md file paths under a directory */
function collectMarkdownFiles(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Parse YAML frontmatter from markdown string. Returns {} if none found. */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  let currentKey = null;
  for (const line of match[1].split('\n')) {
    const listItem = line.match(/^\s+-\s+(.*)/);
    const keyVal   = line.match(/^([\w][\w-]*):\s*(.*)/);
    if (keyVal) {
      currentKey = keyVal[1];
      const v = keyVal[2].trim();
      fm[currentKey] = v === '' ? [] : v.replace(/^["']|["']$/g, '');
    } else if (listItem && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(listItem[1].trim());
    }
  }
  return fm;
}

/** Strip frontmatter, then count words in body */
function countWords(content) {
  const body = content.replace(/^---[\s\S]*?---\s*/, '');
  return body.split(/\s+/).filter(Boolean).length;
}

/** Extract all [[wikilinks]] from content */
function extractWikilinks(content) {
  const matches = content.match(/\[\[([^\]|#]+)[^\]]*\]\]/g) || [];
  return matches.map(m => {
    const inner = m.slice(2, -2).split('|')[0].split('#')[0].trim();
    return inner;
  });
}

/** Relative path from vault root for display */
function rel(p) {
  return path.relative(VAULT_ROOT, p);
}

/** Parse YYYYMMDD from filename or frontmatter `created` */
function extractDate(filename, frontmatter) {
  // Try filename prefix YYYYMMDD-...
  const fnMatch = path.basename(filename).match(/^(\d{8})/);
  if (fnMatch) {
    const s = fnMatch[1];
    return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
  }
  // Try frontmatter `created: YYYY-MM-DD` or `created: YYYYMMDD`
  if (frontmatter.created) {
    const d = new Date(frontmatter.created.split(' ')[0]);
    if (!isNaN(d)) return d;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function runChecks() {
  const allFiles = collectMarkdownFiles(VAULT_ROOT);

  // Build a lookup: note stem → full path (for wikilink resolution)
  const stemToPath = new Map();
  for (const f of allFiles) {
    const stem = path.basename(f, '.md');
    stemToPath.set(stem.toLowerCase(), f);
  }

  // Build inbound link map: path → Set of paths that link to it
  const inboundLinks = new Map();
  for (const f of allFiles) inboundLinks.set(f, new Set());

  // Per-file data
  const fileData = [];

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    const wordCount = countWords(content);
    const outlinks = extractWikilinks(content);

    // Record inbound links
    for (const link of outlinks) {
      const target = stemToPath.get(link.toLowerCase());
      if (target && target !== filePath) {
        inboundLinks.get(target)?.add(filePath);
      }
    }

    fileData.push({ filePath, content, fm, wordCount, outlinks });
  }

  // ---- Check 1: Orphaned notes ----
  const ORPHAN_EXCLUDE_PREFIXES = ['00_INBOX', '05_RAW', 'CLAUDE.md', 'README.md', '03_RESOURCES/Excalidraw', '03_RESOURCES/Templates'];
  const orphaned = fileData.filter(({ filePath }) => {
    const r = rel(filePath);
    if (ORPHAN_EXCLUDE_PREFIXES.some(p => r.startsWith(p))) return false;
    return (inboundLinks.get(filePath)?.size ?? 0) === 0;
  });

  // ---- Check 2: Stub notes ----
  const STUB_EXCLUDE_PREFIXES = ['00_INBOX', '05_RAW', '03_RESOURCES/Excalidraw', '03_RESOURCES/Templates'];
  const stubs = fileData.filter(({ filePath, wordCount }) => {
    const r = rel(filePath);
    if (STUB_EXCLUDE_PREFIXES.some(p => r.startsWith(p))) return false;
    return wordCount < STUB_THRESHOLD;
  });

  // ---- Check 3: Missing frontmatter ----
  const FM_EXCLUDE = ['05_RAW', 'README.md', 'CLAUDE.md', '03_RESOURCES/Excalidraw'];
  const missingFm = fileData.flatMap(({ filePath, fm }) => {
    const r = rel(filePath);
    if (FM_EXCLUDE.some(p => r.startsWith(p) || r === p)) return [];
    const missing = REQUIRED_FRONTMATTER.filter(field => {
      const v = fm[field];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (missing.length === 0) return [];
    return [{ filePath, missing }];
  });

  // ---- Check 4: No outbound links ----
  const NO_LINK_EXCLUDE = ['00_INBOX', '05_RAW', 'README.md', 'CLAUDE.md', '03_RESOURCES/Excalidraw', '03_RESOURCES/Templates'];
  const noOutbound = fileData.filter(({ filePath, outlinks }) => {
    const r = rel(filePath);
    if (NO_LINK_EXCLUDE.some(p => r.startsWith(p))) return false;
    return outlinks.length === 0;
  });

  // ---- Check 5: Stale raw sources ----
  const now = Date.now();
  const MS_PER_DAY = 86400 * 1000;
  const rawFiles = fileData.filter(({ filePath }) => rel(filePath).startsWith('05_RAW'));
  const staleRaw = rawFiles.filter(({ filePath, fm }) => {
    if (fm.status === 'compiled') return false;
    const d = extractDate(filePath, fm);
    if (!d) return false;
    return (now - d.getTime()) > RAW_STALE_DAYS * MS_PER_DAY;
  });

  // ---- Check 6: Note counts per folder ----
  const folderCounts = {};
  for (const { filePath } of fileData) {
    const parts = rel(filePath).split(path.sep);
    const top = parts[0];
    folderCounts[top] = (folderCounts[top] || 0) + 1;
  }

  return {
    allFiles,
    orphaned,
    stubs,
    missingFm,
    noOutbound,
    staleRaw,
    folderCounts,
    totalNotes: allFiles.length,
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

function statusIcon(count, warnThreshold = 1, errorThreshold = 6) {
  if (count === 0) return `${GREEN}✓${RESET}`;
  if (count < errorThreshold) return `${YELLOW}⚠️ ${RESET}`;
  return `${RED}✗${RESET}`;
}

function printReport(results) {
  const { orphaned, stubs, missingFm, noOutbound, staleRaw, folderCounts, totalNotes } = results;

  console.log();
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD}  AgentOS Wiki Health Check${RESET}`);
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`  Vault: ${DIM}${VAULT_ROOT}${RESET}`);
  console.log(`  Total notes scanned: ${BOLD}${totalNotes}${RESET}`);
  console.log();

  // Summary table
  const checks = [
    ['Orphaned notes', orphaned.length],
    ['Stub notes (< 100 words)', stubs.length],
    ['Missing frontmatter fields', missingFm.length],
    ['Notes with no outbound links', noOutbound.length],
    ['Stale raw sources (> 7 days)', staleRaw.length],
  ];

  console.log(`${BOLD}  Summary${RESET}`);
  console.log(`  ${'─'.repeat(50)}`);
  for (const [label, count] of checks) {
    const icon = statusIcon(count);
    console.log(`  ${icon}  ${label.padEnd(36)} ${count === 0 ? DIM + '0' + RESET : BOLD + count + RESET}`);
  }
  console.log();

  // Folder breakdown
  console.log(`${BOLD}  Notes per folder${RESET}`);
  console.log(`  ${'─'.repeat(50)}`);
  for (const [folder, count] of Object.entries(folderCounts).sort()) {
    console.log(`  ${DIM}${folder.padEnd(30)}${RESET} ${count}`);
  }
  console.log();

  // Details
  if (orphaned.length > 0) {
    console.log(`${BOLD}${YELLOW}  ⚠️  Orphaned Notes${RESET} ${DIM}(no inbound wikilinks)${RESET}`);
    for (const { filePath } of orphaned) {
      console.log(`  ${DIM}·${RESET} ${rel(filePath)}`);
    }
    console.log();
  }

  if (stubs.length > 0) {
    console.log(`${BOLD}${YELLOW}  ⚠️  Stub Notes${RESET} ${DIM}(< ${STUB_THRESHOLD} words)${RESET}`);
    for (const { filePath, wordCount } of stubs) {
      console.log(`  ${DIM}·${RESET} ${rel(filePath)} ${DIM}(${wordCount} words)${RESET}`);
    }
    console.log();
  }

  if (missingFm.length > 0) {
    console.log(`${BOLD}${YELLOW}  ⚠️  Missing Frontmatter${RESET}`);
    for (const { filePath, missing } of missingFm) {
      console.log(`  ${DIM}·${RESET} ${rel(filePath)} ${DIM}— missing: ${missing.join(', ')}${RESET}`);
    }
    console.log();
  }

  if (noOutbound.length > 0) {
    console.log(`${BOLD}${YELLOW}  ⚠️  No Outbound Links${RESET}`);
    for (const { filePath } of noOutbound) {
      console.log(`  ${DIM}·${RESET} ${rel(filePath)}`);
    }
    console.log();
  }

  if (staleRaw.length > 0) {
    console.log(`${BOLD}${RED}  ✗  Stale Raw Sources${RESET} ${DIM}(> ${RAW_STALE_DAYS} days, uncompiled)${RESET}`);
    for (const { filePath, fm } of staleRaw) {
      const d = extractDate(filePath, fm);
      const age = d ? Math.floor((Date.now() - d.getTime()) / (86400 * 1000)) : '?';
      console.log(`  ${DIM}·${RESET} ${rel(filePath)} ${DIM}(${age} days old)${RESET}`);
    }
    console.log();
  }

  const totalIssues = orphaned.length + stubs.length + missingFm.length + noOutbound.length + staleRaw.length;
  if (totalIssues === 0) {
    console.log(`${GREEN}${BOLD}  ✓ Vault is healthy — no issues found.${RESET}`);
  } else {
    const health = totalIssues === 0 ? `${GREEN}🟢 Healthy` : totalIssues < 10 ? `${YELLOW}🟡 Needs attention` : `${RED}🔴 Critical`;
    console.log(`  Overall health: ${health}${RESET} ${DIM}(${totalIssues} total issues)${RESET}`);
    console.log(`  ${DIM}Run with --write-report to save findings to 00_INBOX/_health-report.md${RESET}`);
  }
  console.log();
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log();
}

// ---------------------------------------------------------------------------
// Markdown report writer
// ---------------------------------------------------------------------------

function buildMarkdownReport(results) {
  const { orphaned, stubs, missingFm, noOutbound, staleRaw, folderCounts, totalNotes } = results;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const idStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

  const statusEmoji = (count) => count === 0 ? '✓' : count < 6 ? '⚠️' : '✗';

  const lines = [
    '---',
    `id: ${idStr}`,
    'type: note',
    'status: active',
    `created: ${dateStr}`,
    'tags:',
    '  - health-check',
    '  - maintenance',
    'area: system',
    '---',
    `# Wiki Health Report — ${dateStr}`,
    '',
    `Total notes scanned: **${totalNotes}**`,
    '',
    '## Summary',
    '',
    '| Check | Status | Issues |',
    '|-------|--------|--------|',
    `| Orphaned notes | ${statusEmoji(orphaned.length)} | ${orphaned.length} |`,
    `| Stub notes (< 100 words) | ${statusEmoji(stubs.length)} | ${stubs.length} |`,
    `| Missing frontmatter fields | ${statusEmoji(missingFm.length)} | ${missingFm.length} |`,
    `| Notes with no outbound links | ${statusEmoji(noOutbound.length)} | ${noOutbound.length} |`,
    `| Stale raw sources (> 7 days) | ${statusEmoji(staleRaw.length)} | ${staleRaw.length} |`,
    '',
    '## Notes per Folder',
    '',
  ];

  for (const [folder, count] of Object.entries(folderCounts).sort()) {
    lines.push(`- \`${folder}/\` — ${count} notes`);
  }
  lines.push('');

  if (orphaned.length > 0) {
    lines.push('## Orphaned Notes');
    lines.push('');
    for (const { filePath } of orphaned) lines.push(`- \`${rel(filePath)}\``);
    lines.push('');
  }

  if (stubs.length > 0) {
    lines.push('## Stub Notes');
    lines.push('');
    for (const { filePath, wordCount } of stubs) lines.push(`- \`${rel(filePath)}\` (${wordCount} words)`);
    lines.push('');
  }

  if (missingFm.length > 0) {
    lines.push('## Missing Frontmatter');
    lines.push('');
    for (const { filePath, missing } of missingFm) {
      lines.push(`- \`${rel(filePath)}\` — missing: \`${missing.join(', ')}\``);
    }
    lines.push('');
  }

  if (noOutbound.length > 0) {
    lines.push('## No Outbound Links');
    lines.push('');
    for (const { filePath } of noOutbound) lines.push(`- \`${rel(filePath)}\``);
    lines.push('');
  }

  if (staleRaw.length > 0) {
    lines.push('## Stale Raw Sources');
    lines.push('');
    for (const { filePath, fm } of staleRaw) {
      const d = extractDate(filePath, fm);
      const age = d ? Math.floor((Date.now() - d.getTime()) / (86400 * 1000)) : '?';
      lines.push(`- \`${rel(filePath)}\` (${age} days old)`);
    }
    lines.push('');
  }

  const totalIssues = orphaned.length + stubs.length + missingFm.length + noOutbound.length + staleRaw.length;
  const overallHealth = totalIssues === 0 ? '🟢 Healthy' : totalIssues < 10 ? '🟡 Needs attention' : '🔴 Critical';
  lines.push(`**Overall health:** ${overallHealth} (${totalIssues} total issues)`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

try {
  const results = runChecks();
  printReport(results);

  if (WRITE_REPORT) {
    const reportContent = buildMarkdownReport(results);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const reportPath = path.join(VAULT_ROOT, '00_INBOX', `_health-report-${dateStr}.md`);

    // Ensure 00_INBOX exists
    const inboxDir = path.join(VAULT_ROOT, '00_INBOX');
    if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir, { recursive: true });

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`  Report written to: ${path.relative(VAULT_ROOT, reportPath)}`);
    console.log();
  }
} catch (err) {
  console.error('Health check failed:', err.message);
  process.exit(1);
}
