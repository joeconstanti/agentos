import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('skills', Path(__file__).resolve().parents[1] / 'scripts/skills.py')
skills = importlib.util.module_from_spec(spec)
spec.loader.exec_module(skills)


class SkillValidation(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.folder = self.root / '.agents/skills/example'
        self.folder.mkdir(parents=True)
        alias = self.root / '.claude/skills/example'
        alias.parent.mkdir(parents=True)
        alias.symlink_to('../../.agents/skills/example')
        self.write()

    def write(self, name='example', description='Use for a specific example.'):
        (self.folder / 'SKILL.md').write_text(f'---\nname: {json.dumps(name)}\ndescription: {json.dumps(description)}\n---\n# Instructions\nDo the task.\n')

    def test_catalog_preserves_metadata_and_relative_location(self):
        catalog, errors = skills.inspect(self.root)
        self.assertEqual(errors, [])
        self.assertEqual(catalog, [{'name': 'example', 'description': 'Use for a specific example.', 'path': '.agents/skills/example/SKILL.md'}])

    def test_rejects_wrong_folder_invalid_name_and_empty_description(self):
        for name, desc in [('other', 'x'), ('bad--name', 'x'), ('example', ''), ('example', 'x' * 1025)]:
            with self.subTest(name=name, desc=desc[:10]):
                self.write(name, desc)
                self.assertTrue(skills.inspect(self.root)[1])

    def test_rejects_invalid_json_and_missing_frontmatter(self):
        for content in ['# No metadata', '---\nname: example\n---\nBody']:
            (self.folder / 'SKILL.md').write_text(content)
            self.assertTrue(skills.inspect(self.root)[1])

    def test_rejects_broken_alias(self):
        alias = self.root / '.claude/skills/example'
        alias.unlink()
        alias.symlink_to('missing')
        self.assertTrue(skills.inspect(self.root)[1])

    def test_local_reference_is_resolved_and_checked(self):
        path = self.folder / 'SKILL.md'
        target = self.folder / 'Reference File.md'
        target.write_text('Reference')
        path.write_text(path.read_text() + '\n[Reference](Reference%20File.md)\n')
        self.assertEqual(skills.inspect(self.root)[1], [])
        target.unlink()
        self.assertTrue(skills.inspect(self.root)[1])

    def test_external_reference_is_not_fetched(self):
        path = self.folder / 'SKILL.md'
        path.write_text(path.read_text() + '\n[Source](https://example.invalid/source)\n')
        self.assertEqual(skills.inspect(self.root)[1], [])

    def test_reference_outside_repository_is_rejected(self):
        path = self.folder / 'SKILL.md'
        path.write_text(path.read_text() + '\n[Outside](../../../../outside.md)\n')
        self.assertTrue(skills.inspect(self.root)[1])

    def test_empty_catalog_is_rejected(self):
        (self.folder / 'SKILL.md').unlink()
        self.folder.rmdir()
        self.assertTrue(skills.inspect(self.root)[1])

    def test_rejects_duplicate_metadata(self):
        path = self.folder / 'SKILL.md'
        path.write_text(path.read_text().replace('---\n#', 'name: "example"\n---\n#'))
        self.assertTrue(skills.inspect(self.root)[1])


if __name__ == '__main__':
    unittest.main()
