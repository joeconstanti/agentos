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
