#!/usr/bin/env python3
"""List skill scenarios or score explicitly recorded observations; never run a model."""
import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def load_cases(root):
    cases = []
    for folder in sorted((root / '.agents/skills').glob('*')):
        data = json.loads((folder / 'evals.json').read_text())
        if not isinstance(data, dict) or set(data) != {'skill', 'positive', 'negative'} or data['skill'] != folder.name:
            raise ValueError(f'{folder.name}: invalid evaluation metadata')
        if not isinstance(data['positive'], list) or not data['positive'] or not isinstance(data['negative'], list) or not data['negative']:
            raise ValueError(f'{folder.name}: positive and negative cases required')
        for index, case in enumerate(data['positive'], 1):
            if not isinstance(case, dict) or set(case) != {'prompt', 'expected'}:
                raise ValueError(f'{folder.name}: invalid positive case')
            if not isinstance(case['prompt'], str) or not case['prompt'].strip():
                raise ValueError(f'{folder.name}: prompt required')
            expected = case['expected']
            if not isinstance(expected, list) or not expected or not all(isinstance(x, str) and x.strip() for x in expected):
                raise ValueError(f'{folder.name}: observable criteria required')
            cases.append({'id': f'{folder.name}/positive-{index}', 'activate': True, **case})
        for index, prompt in enumerate(data['negative'], 1):
            if not isinstance(prompt, str) or not prompt.strip():
                raise ValueError(f'{folder.name}: negative prompt required')
            cases.append({'id': f'{folder.name}/negative-{index}', 'activate': False, 'prompt': prompt, 'expected': []})
    if not cases:
        raise ValueError('no skill evaluation cases found')
    return cases


def score(cases, observations):
    if not isinstance(observations, list):
        raise ValueError('results must be a list of observations')
    by_id = {}
    for item in observations:
        if not isinstance(item, dict) or set(item) != {'id', 'activated', 'criteria', 'evidence'}:
            raise ValueError('each observation requires id, activated, criteria, evidence')
        if not isinstance(item['id'], str) or item['id'] in by_id:
            raise ValueError('observation IDs must be unique strings')
        by_id[item['id']] = item
    if set(by_id) != {case['id'] for case in cases}:
        raise ValueError('results must cover each case exactly once')
    failed = []
    for case in cases:
        item = by_id[case['id']]
        if type(item['activated']) is not bool or not isinstance(item['criteria'], list):
            raise ValueError(f'{case["id"]}: activation must be boolean and criteria a list')
        if len(item['criteria']) != len(case['expected']) or not all(type(x) is bool for x in item['criteria']):
            raise ValueError(f'{case["id"]}: record one boolean per expected criterion')
        if not isinstance(item['evidence'], str) or not item['evidence'].strip():
            raise ValueError(f'{case["id"]}: observation evidence required')
        if item['activated'] != case['activate'] or not all(item['criteria']):
            failed.append(case['id'])
    return {'cases': len(cases), 'passed': len(cases) - len(failed), 'failed': failed,
            'limit': 'Scores recorded observations only; does not verify evidence or run a model.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['check', 'cases', 'score'])
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--results', type=Path)
    args = parser.parse_args()
    try:
        cases = load_cases(args.root)
        if args.command == 'cases':
            print(json.dumps(cases, indent=2))
        elif args.command == 'score':
            if not args.results:
                parser.error('score requires --results')
            result = score(cases, json.loads(args.results.read_text()))
            print(json.dumps(result, indent=2))
            return bool(result['failed'])
        else:
            print(f'Validated {len(cases)} evaluation definitions; no behavior was executed')
    except (OSError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
