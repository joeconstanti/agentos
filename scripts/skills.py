#!/usr/bin/env python3
"""Validate/catalog AgentOS skills. Repository profile: JSON-quoted YAML scalars."""
import argparse
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
NAME = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')


def inspect(root):
    skills, errors = [], []
    for folder in sorted((root / '.agents/skills').glob('*')):
        path = folder / 'SKILL.md'
        try:
            if folder.is_symlink() or not folder.is_dir():
                raise ValueError('canonical skill must be a real directory')
            if path.is_symlink():
                raise ValueError('canonical SKILL.md must be a real file')
            text = path.read_text(encoding='utf-8')
            parts = text.split('---\n', 2)
            if len(parts) != 3 or parts[0]:
                raise ValueError('missing frontmatter delimiters')
            metadata = {}
            for line in parts[1].splitlines():
                key, sep, value = line.partition(': ')
                if not sep or key in metadata or key not in {'name', 'description'}:
                    raise ValueError('expected unique name/description JSON-quoted scalars')
                metadata[key] = json.loads(value)
            name, description = metadata.get('name'), metadata.get('description')
            if not isinstance(name, str) or not NAME.fullmatch(name) or len(name) > 64 or name != folder.name:
                raise ValueError('name must match folder and Agent Skills naming rules')
            if not isinstance(description, str) or not description.strip() or len(description) > 1024:
                raise ValueError('description must contain 1-1024 characters')
            if not parts[2].strip():
                raise ValueError('instructions are empty')
            alias = root / '.claude/skills' / folder.name
            if not alias.is_symlink() or alias.resolve() != folder.resolve():
                raise ValueError('Claude alias must point to canonical skill')
            skills.append({**metadata, 'path': path.relative_to(root).as_posix()})
        except (OSError, ValueError) as exc:
            errors.append(f'{path.relative_to(root)}: {exc}')
    return skills, errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['check', 'catalog'])
    parser.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args()
    skills, errors = inspect(args.root)
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    if args.command == 'catalog':
        print(json.dumps(skills, indent=2))
    else:
        print(f'Validated {len(skills)} portable skills')
    return 0


if __name__ == '__main__':
    sys.exit(main())
