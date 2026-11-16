import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('evaluate', Path(__file__).resolve().parents[1] / 'scripts/evaluate_skills.py')
evaluate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(evaluate)


class EvaluationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.folder = self.root / '.agents/skills/example'
        self.folder.mkdir(parents=True)
        self.data = {'skill': 'example', 'positive': [{'prompt': 'Do task', 'expected': ['Creates artifact']}], 'negative': ['Unrelated task']}
        self.save()
        self.cases = evaluate.load_cases(self.root)
        self.results = [
            {'id': 'example/positive-1', 'activated': True, 'criteria': [True], 'evidence': 'Artifact inspected at /tmp/example'},
            {'id': 'example/negative-1', 'activated': False, 'criteria': [], 'evidence': 'Trace contained no activation'}]

    def save(self):
        (self.folder / 'evals.json').write_text(json.dumps(self.data))

    def test_loads_positive_and_negative_cases(self):
        self.assertEqual([case['activate'] for case in self.cases], [True, False])
        self.assertEqual(self.cases[0]['expected'], ['Creates artifact'])

    def test_scores_recorded_success_and_failure(self):
        self.assertEqual(evaluate.score(self.cases, self.results)['passed'], 2)
        self.results[0]['criteria'] = [False]
        self.assertEqual(evaluate.score(self.cases, self.results)['failed'], ['example/positive-1'])

    def test_wrong_trigger_fails(self):
        self.results[1]['activated'] = True
        self.assertEqual(evaluate.score(self.cases, self.results)['failed'], ['example/negative-1'])

    def test_missing_extra_and_duplicate_results_rejected(self):
        for results in [self.results[:1], self.results + [self.results[0]], self.results + [dict(self.results[0], id='unknown')]]:
            with self.subTest(results=results), self.assertRaises(ValueError):
                evaluate.score(self.cases, results)

    def test_missing_evidence_and_non_boolean_criteria_rejected(self):
        for patch in [{'evidence': ''}, {'criteria': [1]}, {'criteria': []}, {'activated': 'yes'}]:
            results = copy.deepcopy(self.results)
            results[0].update(patch)
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                evaluate.score(self.cases, results)

    def test_invalid_definitions_rejected(self):
        original = copy.deepcopy(self.data)
        for patch in [{'positive': []}, {'negative': []}, {'skill': 'wrong'}, {'positive': [{'prompt': 'x', 'expected': []}]}]:
            self.data = {**original, **patch}
            self.save()
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                evaluate.load_cases(self.root)

    def test_empty_suite_rejected(self):
        (self.folder / 'evals.json').unlink()
        self.folder.rmdir()
        with self.assertRaises(ValueError):
            evaluate.load_cases(self.root)


if __name__ == '__main__':
    unittest.main()
