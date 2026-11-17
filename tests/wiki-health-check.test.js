const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const hc = require('../01_PROJECTS/agentos_web/wiki-health-check.js');

function vault(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-'));
  for (const [name, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), body);
  }
  return root;
}

const FM = '---\nid: 1\ntype: note\nstatus: active\ncreated: 2026-01-01\ntags:\n  - a\n---\n';

test('parseFrontmatter reads scalars and lists', () => {
  assert.deepStrictEqual(hc.parseFrontmatter('---\ntype: "note"\ntags:\n  - x\n  - y\n---\nbody'), { type: 'note', tags: ['x', 'y'] });
  assert.deepStrictEqual(hc.parseFrontmatter('no frontmatter'), {});
});

test('extractWikilinks strips aliases and headings', () => {
  assert.deepStrictEqual(hc.extractWikilinks('[[A]] [[B|alias]] [[C#Heading]]'), ['A', 'B', 'C']);
});

test('extractWikilinks ignores fenced and inline examples', () => {
  const text = 'See [[Real]]\n```\n[[Fake]]\n```\nAnd `[[Also Fake]]`.';
  assert.deepStrictEqual(hc.extractWikilinks(text), ['Real']);
});

test('wikilinkStem uses the basename without an extension', () => {
  assert.strictEqual(hc.wikilinkStem('Docs/My Note.md'), 'my note');
});

test('countWords ignores frontmatter', () => {
  assert.strictEqual(hc.countWords(FM + 'one two three'), 3);
});

test('runChecks finds orphans, stubs and missing frontmatter', () => {
  const root = vault({
    '03_RESOURCES/Docs/A.md': FM + 'Links to [[B]].',
    '03_RESOURCES/Docs/B.md': '# no frontmatter [[A]]',
  });
  const r = hc.runChecks(root);
  assert.strictEqual(r.totalNotes, 2);
  assert.strictEqual(r.orphaned.length, 0);
  assert.strictEqual(r.stubs.length, 2);
  assert.strictEqual(r.missingFm.length, 1);
  assert.match(hc.buildMarkdownReport(r), /Wiki Health Report/);
});

test('path-qualified wikilinks count as inbound links', () => {
  const words = Array.from({ length: 120 }, () => 'word').join(' ');
  const root = vault({
    '03_RESOURCES/Docs/A.md': FM + 'See [[sub/B.md]].',
    '03_RESOURCES/Docs/sub/B.md': FM + words,
  });
  const r = hc.runChecks(root);
  assert.strictEqual(r.orphaned.some((note) => note.filePath.endsWith(`${path.sep}B.md`)), false);
});

test('runChecks reports duplicate content basenames and ignores structural names', () => {
  const root = vault({
    '03_RESOURCES/Docs/Note.md': FM + 'One.',
    '02_AREAS/Note.md': FM + 'Two.',
    'README.md': FM + 'root',
    '05_RAW/README.md': FM + 'raw',
    '02_AREAS/agents/_index.md': FM + 'agents',
    '03_RESOURCES/Docs/_index.md': FM + 'docs',
  });
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.duplicateStems.map((item) => item.stem), ['note']);
  assert.strictEqual(r.duplicateStems[0].filePaths.length, 2);
  assert.match(hc.buildMarkdownReport(r), /Duplicate Note Basenames/);
});

test('runChecks resolves embeds by filename and still flags missing targets', () => {
  const root = vault({
    '03_RESOURCES/Docs/A.md': FM + 'See ![[diagram.svg]] and ![[Missing.png]].',
    '03_RESOURCES/Attachments/diagram.svg': '<svg/>',
  });
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.brokenLinks.map((item) => item.link), ['Missing.png']);
});

test('isValidCreated accepts calendar dates and rejects impossible ones', () => {
  assert.strictEqual(hc.isValidCreated('2026-04-06'), true);
  assert.strictEqual(hc.isValidCreated('2026-04-06 10:06'), true);
  assert.strictEqual(hc.isValidCreated('2026-02-31'), false);
  assert.strictEqual(hc.isValidCreated('<% tp.date.now("YYYY-MM-DD") %>'), false);
});

test('runChecks reports invalid status and created values', () => {
  const root = vault({
    '03_RESOURCES/Docs/Bad.md': '---\nid: 1\ntype: note\nstatus: purple\ncreated: not-a-date\ntags:\n  - a\n---\nbody',
    '03_RESOURCES/Docs/Good.md': FM + 'ok',
    '03_RESOURCES/Templates/main.md': '---\nid: 1\ntype: note\nstatus: draft\ncreated: <% tp.date.now("YYYY-MM-DD HH:mm") %>\ntags:\n  - a\n---\n',
  });
  const r = hc.runChecks(root);
  assert.strictEqual(r.invalidFm.length, 1);
  assert.deepStrictEqual(r.invalidFm[0].problems, ['status: purple', 'created: not-a-date']);
  assert.match(hc.buildMarkdownReport(r), /status: purple/);
});

test('runChecks reports sibling notes missing from _index.md', () => {
  const root = vault({
    '03_RESOURCES/Docs/_index.md': FM + 'See [[Listed|alias]], [[Other#Heading]], and [[Notebook]].',
    '03_RESOURCES/Docs/Note.md': FM + 'Prefix of Notebook, so the longer link must not hide it.',
    '03_RESOURCES/Docs/Listed.md': FM + 'Indexed.',
    '03_RESOURCES/Docs/Other.md': FM + 'Also indexed.',
    '03_RESOURCES/Docs/Absent.md': FM + 'Not in the index.',
    '02_AREAS/agents/Alone.md': FM + 'No index in this folder.',
  });
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.indexGaps.map((gap) => path.basename(gap.filePath)).sort(), ['Absent.md', 'Note.md']);
  assert.match(hc.buildMarkdownReport(r), /Absent\.md/);
});

test('--json prints relative paths for a chosen vault root', () => {
  const root = vault({
    '03_RESOURCES/Docs/A.md': FM + 'See [[Missing]].',
  });
  const script = path.join(__dirname, '../01_PROJECTS/agentos_web/wiki-health-check.js');
  const proc = spawnSync(process.execPath, [script, '--json', '--root', root], { encoding: 'utf8' });
  assert.strictEqual(proc.status, 0, proc.stderr);
  const body = JSON.parse(proc.stdout);
  assert.deepStrictEqual(body.brokenLinks, [{ path: '03_RESOURCES/Docs/A.md', link: 'Missing' }]);
  assert.ok(body.issues >= 1);
});

test('--strict exits non-zero only when findings exist', () => {
  const script = path.join(__dirname, '../01_PROJECTS/agentos_web/wiki-health-check.js');
  const words = Array.from({ length: 120 }, () => 'word').join(' ');
  const dirty = vault({ '03_RESOURCES/Docs/A.md': FM + 'See [[Missing]].' });
  const clean = vault({
    '03_RESOURCES/Docs/A.md': `${FM}${words} [[B]]`,
    '03_RESOURCES/Docs/B.md': `${FM}${words} [[A]]`,
  });
  const failed = spawnSync(process.execPath, [script, '--json', '--strict', '--root', dirty], { encoding: 'utf8' });
  const passed = spawnSync(process.execPath, [script, '--json', '--strict', '--root', clean], { encoding: 'utf8' });
  assert.strictEqual(failed.status, 1);
  assert.strictEqual(passed.status, 0, passed.stdout + passed.stderr);
  assert.strictEqual(JSON.parse(passed.stdout).issues, 0);
});

test('runChecks reports wikilinks that match no note', () => {
  const root = vault({
    '03_RESOURCES/Docs/A.md': FM + 'See [[Missing]] and [[B#Section|alias]] plus [[docs/B.md]].',
    '03_RESOURCES/Docs/B.md': FM + '```\n[[Not A Link]]\n```\nBack to [[A]].',
  });
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.brokenLinks.map((item) => item.link), ['Missing']);
  assert.match(hc.buildMarkdownReport(r), /\[\[Missing\]\]/);
});


test('scan failures never produce a healthy summary', (t) => {
  const root = vault({ '03_RESOURCES/Docs/A.md': FM + 'body' });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.throws(() => hc.runChecks(path.join(root, 'missing')), /ENOENT/);
  assert.throws(() => hc.runChecks(path.join(root, '03_RESOURCES/Docs/A.md')), /ENOTDIR/);
  const original = fs.readdirSync;
  t.mock.method(fs, 'readdirSync', (dir, ...args) => {
    if (dir === path.join(root, '03_RESOURCES')) {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      throw error;
    }
    return original(dir, ...args);
  });
  assert.throws(() => hc.runChecks(root), /Permission denied/);
});

test('CLI exits nonzero on invalid roots without emitting a healthy JSON report', (t) => {
  const root = vault({ 'not-a-directory': 'file' });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const script = path.join(__dirname, '../01_PROJECTS/agentos_web/wiki-health-check.js');
  for (const target of ['missing', 'not-a-directory']) {
    const proc = spawnSync(process.execPath, [script, '--json', '--strict', '--root', path.join(root, target)], { encoding: 'utf8' });
    assert.strictEqual(proc.status, 1);
    assert.strictEqual(proc.stdout, '');
    assert.match(proc.stderr, /Health check failed:/);
  }
});


test('reports retain their own vault root across interleaved scans', (t) => {
  const first = vault({ '03_RESOURCES/Docs/A.md': FM + '[[Missing]]' });
  const second = vault({ '02_AREAS/B.md': FM + '[[Absent]]' });
  t.after(() => [first, second].forEach(root => fs.rmSync(root, { recursive: true, force: true })));
  const result = hc.runChecks(first);
  const summary = hc.summarize(result);
  const markdown = hc.buildMarkdownReport(result);
  const output = [];
  t.mock.method(console, 'log', (...args) => output.push(args.join(' ')));
  hc.printReport(result);
  const terminal = output.join('\n');
  hc.runChecks(second);
  assert.deepStrictEqual(hc.summarize(result), summary);
  assert.strictEqual(hc.buildMarkdownReport(result), markdown);
  output.length = 0;
  hc.printReport(result);
  assert.strictEqual(output.join('\n'), terminal);
  assert.deepStrictEqual(summary.brokenLinks, [{ path: '03_RESOURCES/Docs/A.md', link: 'Missing' }]);
});

test('--write-report saves inside the explicitly selected vault', (t) => {
  const root = vault({ '03_RESOURCES/Docs/A.md': FM + '[[Missing]]' });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const script = path.join(__dirname, '../01_PROJECTS/agentos_web/wiki-health-check.js');
  const proc = spawnSync(process.execPath, [script, '--json', '--root', root, '--write-report'], { encoding: 'utf8' });
  assert.strictEqual(proc.status, 0, proc.stderr);
  assert.strictEqual(JSON.parse(proc.stdout).totalNotes, 1);
  const reports = fs.readdirSync(path.join(root, '00_INBOX'));
  assert.strictEqual(reports.length, 1);
  assert.match(fs.readFileSync(path.join(root, '00_INBOX', reports[0]), 'utf8'), /03_RESOURCES\/Docs\/A.md/);
});

test('path resolution distinguishes duplicate notes and missing folders', (t) => {
  const root = vault({
    '03_RESOURCES/Docs/A.md': FM + '[[02_AREAS/Note]] [[Wrong/Note]] [[Wrong/image.svg]] [[Attachments/image.svg]]',
    '02_AREAS/Note.md': FM + 'target',
    '03_RESOURCES/Docs/Note.md': FM + 'other',
    '03_RESOURCES/Attachments/image.svg': '<svg/>',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.brokenLinks.map(x => x.link), ['Wrong/Note', 'Wrong/image.svg']);
  const orphans = r.orphaned.map(x => path.relative(root, x.filePath));
  assert.ok(!orphans.includes('02_AREAS/Note.md'));
  assert.ok(orphans.includes('03_RESOURCES/Docs/Note.md'));
});

test('bare duplicate links prefer a local note and never credit an arbitrary remote duplicate', (t) => {
  const root = vault({
    '02_AREAS/A.md': FM + '[[Note]]',
    '02_AREAS/Note.md': FM + 'local',
    '03_RESOURCES/Docs/Note.md': FM + 'remote',
    '01_PROJECTS/B.md': FM + '[[Note]]',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.brokenLinks, []);
  const orphans = r.orphaned.map(x => path.relative(root, x.filePath));
  assert.ok(!orphans.includes('02_AREAS/Note.md'));
  assert.ok(orphans.includes('03_RESOURCES/Docs/Note.md'));
});

test('index coverage uses real resolved links rather than raw examples or basename prefixes', (t) => {
  const root = vault({
    '03_RESOURCES/Docs/_index.md': FM + '[[03_RESOURCES/Docs/Listed.md|label]] [[Docs/Heading#Section]] [[02_AREAS/Wrong]]\n`[[Inline]]`\n```md\n[[Fenced]]\n```',
    '03_RESOURCES/Docs/Listed.md': FM + 'listed',
    '03_RESOURCES/Docs/Heading.md': FM + 'listed heading',
    '03_RESOURCES/Docs/Wrong.md': FM + 'not the linked duplicate',
    '02_AREAS/Wrong.md': FM + 'actual target',
    '03_RESOURCES/Docs/Inline.md': FM + 'example only',
    '03_RESOURCES/Docs/Fenced.md': FM + 'example only',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.indexGaps.map(x => path.basename(x.filePath)).sort(), ['Fenced.md', 'Inline.md', 'Wrong.md']);
});
