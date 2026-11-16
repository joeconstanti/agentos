---
id: 20261116140000
type: note
status: active
created: 2026-11-16 14:00
tags:
  - skills
  - research
area: agents
---
# Agent Skill Improvement Research

Research checked on 2026-11-16. AgentOS already has useful ingest, Q&A, and health playbooks, but they are not discoverable as portable skills. Its only bundled skill is tied to Claude and includes a user-specific vault path. The first priority is to expose vault workflows without changing users' global agent settings.

## Sources reviewed

- [Agent Skills specification](https://agentskills.io/specification): standard skill directories and metadata constraints.
- [Agent Skills integration guide](https://agentskills.io/client-implementation/adding-skills-support): cross-client discovery, staged context loading, collisions, and trust boundaries.
- [Anthropic skill creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md): realistic prompts, observable outcomes, and iteration rather than metadata-only validation.
- [Superpowers verification](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md): fresh evidence before completion claims.
- [Superpowers debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md): investigate causes and test hypotheses before broad fixes.
- [Skills directory](https://skills.sh/): discovery starting point. Popularity alone does not establish task fit or safety.

## Selected improvements

| Change | AgentOS gap | Validation |
|---|---|---|
| Portable discovery | Claude-only bundled capability | Catalog, metadata and alias tests |
| Source compilation | Long manual ingest prompt | Traceable output and source-state scenario |
| Grounded Q&A | Old notes can be repeated as current facts | Contradictory and stale evidence scenario |
| Wiki maintenance | Findings can invite broad edits | Read-only triage and scoped repair scenario |
| Research intake | No source trust or provenance skill | Hostile-source and inaccessible-source scenario |
| Memory reconciliation | No conflict lifecycle | Conflicting decision scenario |
| Session handoff | No durable resume contract | Dirty work and pending job scenario |
| Systematic debugging | No reusable cause-finding procedure | Failure reproduction scenario |
| Evidence verification | Build and live claims can be confused | Build-only deployment scenario |
| Skill evaluation and CI | No repeatable skill acceptance loop | Trigger and behavior cases plus automated checks |

These are original AgentOS instructions informed by the sources, not copied upstream skill bundles. There is no third-party runtime or installer execution. Existing playbooks remain the detailed references. The suite does not install broad framework hooks or require delegation for routine work.

## Alternatives deferred

Frontend, browser, and document skills are useful elsewhere, but they do not address this vault's core workflow gaps. Importing a complete framework would duplicate existing session instructions and introduce workflow defaults beyond this request. Revisit external packages when a concrete task justifies one; inspect its current source, license, dependencies, and collisions before installation.

## Acceptance limits

Metadata and CI checks prove packaging and script behavior. Scenario reviews check the written decision path; they are not independent model benchmarks and cannot prove a measured performance gain. Future evaluations should compare actual artifacts with and without a skill using the same task and environment.

## Related

- [[Claude Skills]]
- [[Raw Ingest to Wiki]]
- [[Q&A Against the Wiki]]
- [[Wiki Health Check]]
