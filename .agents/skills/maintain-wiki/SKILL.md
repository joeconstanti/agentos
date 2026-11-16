---
name: "maintain-wiki"
description: "Audit AgentOS wiki health and make scoped repairs when requested. Use for broken links, orphan notes, or source backlogs, not ordinary note writing."
---
# Maintain wiki quality

Read the [health playbook](../../../03_RESOURCES/Playbooks/Wiki%20Health%20Check.md). Start with `node 01_PROJECTS/agentos_web/wiki-health-check.js` from the repository root. This default command reports without writing. Use `--json` when the caller needs machine-readable relative paths. Use `--write-report` only when a saved report is requested; it writes a fixed inbox report path and can replace an older report.

The script reports orphans, stubs, missing frontmatter, notes with no outbound links, stale raw sources, broken wikilinks, and duplicate content basenames. It ignores fenced and inline examples, and it does not treat shared `_index` or `README` names as duplicates. It does not judge overlapping concepts or tag conflicts; inspect those separately when they fall within the requested audit. Exclude `.obsidian/`, hidden skill infrastructure, dependencies, and generated output from note repair.

Treat short notes, indexes, and zero-inbound notes as candidates for review. A short index can be complete; do not add filler or artificial links to satisfy a threshold. Resolve wikilinks using the actual path, alias, and heading. Duplicate basenames need path-qualified links. Fenced example links are not necessarily broken navigation.

For an audit, report findings with file/section evidence, impact, and a proposed repair. An audit alone does not authorize deletion, moving notes, or replacing tags across the vault. When repairs are requested, change only the agreed category and inspect inbound references before moves or merges. Preserve raw sources and unrelated content.

Re-run the relevant check after changes and inspect the diff. Report counts of inspected files and confirmed issues separately from heuristic warnings. State checks not covered, including any manual link-resolution limits.
