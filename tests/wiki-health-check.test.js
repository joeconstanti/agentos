const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
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

test('runChecks resolves embeds by filename and still flags missing targets', () => {
  const root = vault({
    '03_RESOURCES/Docs/A.md': FM + 'See ![[diagram.svg]] and ![[Missing.png]].',
    '03_RESOURCES/Attachments/diagram.svg': '<svg/>',
  });
  const r = hc.runChecks(root);
  assert.deepStrictEqual(r.brokenLinks.map((item) => item.link), ['Missing.png']);
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
