#!/usr/bin/env node
/**
 * wiki-health-check.js
 * AgentOS vault health checker — inspired by Karpathy's LLM KB workflow.
 *
 * Usage:
 *   node wiki-health-check.js               # print report to terminal
 *   node wiki-health-check.js --json        # print a relative-path JSON summary
 *   node wiki-health-check.js --write-report # also write 00_INBOX/_health-report.md
 *   node wiki-health-check.js --root <dir>  # check a vault other than this repo
 *   node wiki-health-check.js --strict      # exit 1 when any check finds an issue
 *
 * Checks:
 *   1. Orphaned notes (no inbound wikilinks)
 *   2. Stub notes (< 100 words)
 *   3. Missing required frontmatter fields
 *   4. Notes with no outbound wikilinks
 *   5. Uncompiled raw sources in 05_RAW/ older than 7 days
 *   6. Broken wikilinks (no note with that basename)
 *   7. Duplicate content basenames (not _index or README)
 *   8. Sibling notes missing from a folder _index.md
 *   9. Invalid status or created values
 *   10. Note counts per top-level folder
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
const STRUCTURAL_STEMS = new Set(['_index', 'readme']);
const STATUS_VALUES = new Set(['active', 'draft', 'archived', 'stub', 'pending', 'compiled', 'uncompiled', 'done']);
const WRITE_REPORT = process.argv.includes('--write-report');

// Folders to exclude from general checks
const EXCLUDE_DIRS = new Set([
  '.obsidian',
  '.git',
  '.claude',
  '.agents',
  'scripts',
  'tests',
  'installer',
  'node_modules',
  '.superpowers',
]);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Recursively collect file paths under a directory, skipping tooling folders. */
function collectFiles(dir, results = []) {
  // An incomplete scan must not be reported as a healthy vault.
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, results);
    } else if (entry.isFile()) {
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

/** Drop fenced and inline examples so sample links are not vault navigation. */
function withoutExamples(content) {
  const kept = [];
  let fence = null;
  for (const line of content.split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      const token = marker[1][0];
      if (!fence) fence = token;
      else if (fence === token) fence = null;
      continue;
    }
    if (!fence) kept.push(line);
  }
  return kept.join('\n').replace(/`[^`\n]*`/g, '');
}

/** Basename used to resolve a wikilink, without a heading, alias, or .md suffix. */
function wikilinkStem(link) {
  let name = String(link).trim().replace(/\\/g, '/');
  if (name.toLowerCase().endsWith('.md')) name = name.slice(0, -3);
  return path.posix.basename(name).trim().toLowerCase();
}

/** Extract navigational [[wikilinks]] from content. */
function extractWikilinks(content) {
  const matches = withoutExamples(content).match(/\[\[([^\]|#]+)[^\]]*\]\]/g) || [];
  return matches.map(m => {
    const inner = m.slice(2, -2).split('|')[0].split('#')[0].trim();
    return inner;
  }).filter(Boolean);
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

/** True when created is a real calendar date, with an optional time. */
function isValidCreated(value) {
  if (typeof value !== 'string') return false;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function runChecks(root = VAULT_ROOT) {
  const vaultRoot = path.resolve(root);
  const rel = (p) => path.relative(vaultRoot, p);
  const allPaths = collectFiles(vaultRoot);
  const allFiles = allPaths.filter((filePath) => filePath.endsWith('.md'));
  const assetNames = new Set(allPaths.map((filePath) => path.basename(filePath).toLowerCase()));

  // Build a lookup: note stem → full path (for wikilink resolution)
  const stemToPath = new Map();
  const stemOwners = new Map();
  for (const f of allFiles) {
    const stem = path.basename(f, '.md').toLowerCase();
    stemToPath.set(stem, f);
    if (!stemOwners.has(stem)) stemOwners.set(stem, []);
    stemOwners.get(stem).push(f);
  }
  const duplicateStems = [];
  for (const [stem, filePaths] of stemOwners) {
    if (filePaths.length > 1 && !STRUCTURAL_STEMS.has(stem)) {
      duplicateStems.push({ stem, filePaths });
    }
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
      const target = stemToPath.get(wikilinkStem(link));
      if (target && target !== filePath) {
        inboundLinks.get(target)?.add(filePath);
      }
    }

    fileData.push({ filePath, content, fm, wordCount, outlinks });
  }

  // ---- Check 1: Orphaned notes ----
  const ORPHAN_EXCLUDE_PREFIXES = ['00_INBOX', '05_RAW', 'CLAUDE.md', 'AGENTS.md', 'README.md', '03_RESOURCES/Excalidraw', '03_RESOURCES/Templates'];
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
  const FM_EXCLUDE = ['05_RAW', 'README.md', 'CLAUDE.md', 'AGENTS.md', '03_RESOURCES/Excalidraw'];
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
  const NO_LINK_EXCLUDE = ['00_INBOX', '05_RAW', 'README.md', 'CLAUDE.md', 'AGENTS.md', '03_RESOURCES/Excalidraw', '03_RESOURCES/Templates'];
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

  // ---- Check 6: Broken wikilinks ----
  const brokenLinks = [];
  const seenBroken = new Set();
  for (const { filePath, outlinks } of fileData) {
    for (const link of outlinks) {
      const stem = wikilinkStem(link);
      // Notes resolve without an extension. Embeds such as ![[diagram.svg]] resolve by filename.
      if (!stem || stemToPath.has(stem) || assetNames.has(stem)) continue;
      const key = `${filePath}\0${link}`;
      if (seenBroken.has(key)) continue;
      seenBroken.add(key);
      brokenLinks.push({ filePath, link });
    }
  }

  // ---- Check 8: Sibling notes missing from _index.md ----
  const indexGaps = [];
  for (const index of fileData) {
    if (path.basename(index.filePath) !== '_index.md') continue;
    const dir = path.dirname(index.filePath);
    const text = index.content.toLowerCase();
    for (const note of fileData) {
      if (path.dirname(note.filePath) !== dir || path.basename(note.filePath) === '_index.md') continue;
      const stem = path.basename(note.filePath, '.md').toLowerCase();
      const needle = `[[${stem}`;
      let mentioned = false;
      for (let from = 0; from < text.length && !mentioned;) {
        const at = text.indexOf(needle, from);
        if (at === -1) break;
        const next = text[at + needle.length];
        mentioned = next === undefined || next === ']' || next === '|' || next === '#';
        from = at + needle.length;
      }
      if (!mentioned) indexGaps.push({ indexPath: index.filePath, filePath: note.filePath });
    }
  }

  // ---- Check 9: Invalid status or created values ----
  const VALUE_EXCLUDE = [...FM_EXCLUDE, '03_RESOURCES/Templates'];
  const invalidFm = [];
  for (const { filePath, fm } of fileData) {
    const r = rel(filePath);
    if (VALUE_EXCLUDE.some(p => r.startsWith(p) || r === p)) continue;
    const problems = [];
    if (typeof fm.status === 'string' && fm.status !== '' && !STATUS_VALUES.has(fm.status)) {
      problems.push(`status: ${fm.status}`);
    }
    if (typeof fm.created === 'string' && fm.created !== '' && !isValidCreated(fm.created)) {
      problems.push(`created: ${fm.created}`);
    }
    if (problems.length > 0) invalidFm.push({ filePath, problems });
  }

  // ---- Check 10: Note counts per folder ----
  const folderCounts = {};
  for (const { filePath } of fileData) {
    const parts = rel(filePath).split(path.sep);
    const top = parts[0];
    folderCounts[top] = (folderCounts[top] || 0) + 1;
  }

  return {
    vaultRoot,
    allFiles,
    orphaned,
    stubs,
    missingFm,
    noOutbound,
    staleRaw,
    brokenLinks,
    duplicateStems,
    indexGaps,
    invalidFm,
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
  const rel = (p) => path.relative(results.vaultRoot, p);
  const { orphaned, stubs, missingFm, noOutbound, staleRaw, brokenLinks, duplicateStems, indexGaps, invalidFm, folderCounts, totalNotes } = results;

  console.log();
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD}  AgentOS Wiki Health Check${RESET}`);
  console.log(`${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`  Vault: ${DIM}${results.vaultRoot}${RESET}`);
  console.log(`  Total notes scanned: ${BOLD}${totalNotes}${RESET}`);
  console.log();

  // Summary table
  const checks = [
    ['Orphaned notes', orphaned.length],
    ['Stub notes (< 100 words)', stubs.length],
    ['Missing frontmatter fields', missingFm.length],
    ['Notes with no outbound links', noOutbound.length],
    ['Stale raw sources (> 7 days)', staleRaw.length],
    ['Broken wikilinks', brokenLinks.length],
    ['Duplicate note basenames', duplicateStems.length],
    ['Notes missing from _index.md', indexGaps.length],
    ['Invalid status or created values', invalidFm.length],
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

  if (brokenLinks.length > 0) {
    console.log(`${BOLD}${RED}  ✗  Broken Wikilinks${RESET}`);
    for (const { filePath, link } of brokenLinks) {
      console.log(`  ${DIM}·${RESET} ${rel(filePath)} ${DIM}→ [[${link}]]${RESET}`);
    }
    console.log();
  }

  if (duplicateStems.length > 0) {
    console.log(`${BOLD}${YELLOW}  ⚠️  Duplicate Note Basenames${RESET}`);
    for (const { stem, filePaths } of duplicateStems) {
      console.log(`  ${DIM}·${RESET} ${stem}`);
      for (const filePath of filePaths) console.log(`    ${DIM}${rel(filePath)}${RESET}`);
    }
    console.log();
  }

  if (indexGaps.length > 0) {
    console.log(`${BOLD}${YELLOW}  ⚠️  Notes Missing From _index.md${RESET}`);
    for (const { indexPath, filePath } of indexGaps) {
      console.log(`  ${DIM}·${RESET} ${rel(filePath)} ${DIM}(not in ${rel(indexPath)})${RESET}`);
    }
    console.log();
  }

  if (invalidFm.length > 0) {
    console.log(`${BOLD}${YELLOW}  ⚠️  Invalid Frontmatter Values${RESET}`);
    for (const { filePath, problems } of invalidFm) {
      console.log(`  ${DIM}·${RESET} ${rel(filePath)} ${DIM}— ${problems.join(', ')}${RESET}`);
    }
    console.log();
  }

  const totalIssues = orphaned.length + stubs.length + missingFm.length + noOutbound.length + staleRaw.length + brokenLinks.length + duplicateStems.length + indexGaps.length + invalidFm.length;
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
  const rel = (p) => path.relative(results.vaultRoot, p);
  const { orphaned, stubs, missingFm, noOutbound, staleRaw, brokenLinks, duplicateStems, indexGaps, invalidFm, folderCounts, totalNotes } = results;
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
    `| Broken wikilinks | ${statusEmoji(brokenLinks.length)} | ${brokenLinks.length} |`,
    `| Duplicate note basenames | ${statusEmoji(duplicateStems.length)} | ${duplicateStems.length} |`,
    `| Notes missing from _index.md | ${statusEmoji(indexGaps.length)} | ${indexGaps.length} |`,
    `| Invalid status or created values | ${statusEmoji(invalidFm.length)} | ${invalidFm.length} |`,
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

  if (brokenLinks.length > 0) {
    lines.push('## Broken Wikilinks');
    lines.push('');
    for (const { filePath, link } of brokenLinks) {
      lines.push(`- \`${rel(filePath)}\` → \`[[${link}]]\``);
    }
    lines.push('');
  }

  if (duplicateStems.length > 0) {
    lines.push('## Duplicate Note Basenames');
    lines.push('');
    for (const { stem, filePaths } of duplicateStems) {
      lines.push(`- \`${stem}\`: ${filePaths.map((filePath) => `\`${rel(filePath)}\``).join(', ')}`);
    }
    lines.push('');
  }

  if (indexGaps.length > 0) {
    lines.push('## Notes Missing From Index');
    lines.push('');
    for (const { indexPath, filePath } of indexGaps) {
      lines.push(`- \`${rel(filePath)}\` is missing from \`${rel(indexPath)}\``);
    }
    lines.push('');
  }

  if (invalidFm.length > 0) {
    lines.push('## Invalid Frontmatter Values');
    lines.push('');
    for (const { filePath, problems } of invalidFm) {
      lines.push(`- \`${rel(filePath)}\` — ${problems.join(', ')}`);
    }
    lines.push('');
  }

  const totalIssues = orphaned.length + stubs.length + missingFm.length + noOutbound.length + staleRaw.length + brokenLinks.length + duplicateStems.length + indexGaps.length + invalidFm.length;
  const overallHealth = totalIssues === 0 ? '🟢 Healthy' : totalIssues < 10 ? '🟡 Needs attention' : '🔴 Critical';
  lines.push(`**Overall health:** ${overallHealth} (${totalIssues} total issues)`);
  lines.push('');

  return lines.join('\n');
}

/** Machine-readable summary. Paths are relative to the vault that was checked. */
function summarize(results) {
  const rel = (p) => path.relative(results.vaultRoot, p);
  const issues = results.orphaned.length
    + results.stubs.length
    + results.missingFm.length
    + results.noOutbound.length
    + results.staleRaw.length
    + results.brokenLinks.length
    + results.duplicateStems.length
    + results.indexGaps.length
    + results.invalidFm.length;
  return {
    totalNotes: results.totalNotes,
    issues,
    orphaned: results.orphaned.map(({ filePath }) => rel(filePath)),
    stubs: results.stubs.map(({ filePath, wordCount }) => ({ path: rel(filePath), words: wordCount })),
    missingFrontmatter: results.missingFm.map(({ filePath, missing }) => ({ path: rel(filePath), missing })),
    noOutbound: results.noOutbound.map(({ filePath }) => rel(filePath)),
    staleRaw: results.staleRaw.map(({ filePath }) => rel(filePath)),
    brokenLinks: results.brokenLinks.map(({ filePath, link }) => ({ path: rel(filePath), link })),
    duplicateStems: results.duplicateStems.map(({ stem, filePaths }) => ({
      stem,
      paths: filePaths.map((filePath) => rel(filePath)),
    })),
    indexGaps: results.indexGaps.map(({ indexPath, filePath }) => ({
      index: rel(indexPath),
      path: rel(filePath),
    })),
    invalidFrontmatter: results.invalidFm.map(({ filePath, problems }) => ({
      path: rel(filePath),
      problems,
    })),
    folderCounts: results.folderCounts,
  };
}

function flagValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index + 1 >= process.argv.length) return null;
  return process.argv[index + 1];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
try {
  const results = runChecks(flagValue('--root') || VAULT_ROOT);
  const asJson = process.argv.includes('--json');
  if (asJson) console.log(JSON.stringify(summarize(results), null, 2));
  else printReport(results);

  if (WRITE_REPORT) {
    const reportContent = buildMarkdownReport(results);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const reportPath = path.join(results.vaultRoot, '00_INBOX', `_health-report-${dateStr}.md`);

    // Ensure 00_INBOX exists
    const inboxDir = path.join(results.vaultRoot, '00_INBOX');
    if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir, { recursive: true });

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    const notice = `Report written to: ${path.relative(results.vaultRoot, reportPath)}`;
    if (asJson) console.error(notice);
    else {
      console.log(`  ${notice}`);
      console.log();
    }
  }
  if (process.argv.includes('--strict') && summarize(results).issues > 0) {
    process.exitCode = 1;
  }
} catch (err) {
  console.error('Health check failed:', err.message);
  process.exit(1);
}
}

module.exports = {
  parseFrontmatter,
  countWords,
  extractWikilinks,
  wikilinkStem,
  extractDate,
  isValidCreated,
  runChecks,
  printReport,
  buildMarkdownReport,
  summarize,
};

if (require.main === module) main();
