---
name: "evaluate-skills"
description: "Evaluate AgentOS skill discovery and task behavior when adding or changing a skill. Use for skill acceptance work, not ordinary product testing."
---
# Evaluate a skill change

Run `python3 scripts/skills.py check`, `python3 scripts/evaluate_skills.py check`, and `python3 -m unittest discover -s tests` from the repository root. These validate packaging, references, evaluation definitions, and helper behavior; they do not execute skill scenarios.

Run `python3 scripts/evaluate_skills.py cases` to list positive behavior cases and negative routing cases. For the changed skill, use realistic source artifacts in a temporary workspace. Run each prompt with the skill available, inspect the actual output and side effects, and record which criteria were met. Negative cases test whether the skill stays out of unrelated tasks. Do not supply the expected answer to the worker being evaluated.

For an end-to-end routing test, expose the catalog without forcing activation; record whether the skill was selected. A forced skill invocation can test behavior but cannot prove automatic routing. If delegation or model execution is unavailable, review the cases manually and label that result as instruction review. Do not fabricate a trace or treat a hypothetical outcome as an observed pass.

For a complete recorded suite, store a JSON list with one object per case: `id`, boolean `activated`, a `criteria` boolean list in expected-criterion order, and an `evidence` string pointing to observations or artifacts. Run `python3 scripts/evaluate_skills.py score --results /path/to/results.json`. The scorer checks completeness and summarizes supplied observations; it does not independently verify them. For a scoped run, report individual cases directly rather than filling unrun cases with invented results.

To claim an improvement, compare matched runs with and without the skill, keeping model, tools, inputs, and environment fixed. Inspect correctness and side effects before latency or token cost. Keep failures and uncertainty visible. Change instructions only where observed behavior supports the change; do not add broad rules for speculative failures.
