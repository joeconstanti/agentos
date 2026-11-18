# AgentOS

<div align="center">

![Made by Joe](https://img.shields.io/badge/Made%20by-Joe-red?style=for-the-badge)
![Agent Skills](https://img.shields.io/badge/Agent-Skills-orange?style=for-the-badge)
![Markdown](https://img.shields.io/badge/Memory-Markdown-blue?style=for-the-badge&logo=markdown&logoColor=white)
![Obsidian](https://img.shields.io/badge/Obsidian-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white)

[![Skill validation](https://github.com/joeconstanti/agentos/actions/workflows/skills.yml/badge.svg)](https://github.com/joeconstanti/agentos/actions/workflows/skills.yml)

---

**A persistent brain for your AI agents. Keep research, decisions and reusable workflows in one Markdown vault that travels with your work.**

[Skills](#skills) • [Quick Start](#quick-start) • [Agent Support](#agent-support) • [Report Bug](https://github.com/joeconstanti/agentos/issues)

</div>

## Features

<div align="center">

| Feature | What it does |
|---------|--------------|
| **Shared memory** | Gives agents the same file-based knowledge across sessions and tools |
| **Plain Markdown** | Keeps notes readable, editable and independent of a chat provider |
| **Obsidian navigation** | Connects research, projects and agent profiles through wikilinks and indexes |
| **Nine focused skills** | Compile sources, answer questions, maintain knowledge and verify outcomes |
| **Shared skill source** | Canonical `.agents/skills/` files with Claude discovery links |
| **Source-backed research** | Separates raw captures from compiled articles and preserves provenance |
| **Versioned knowledge** | Uses Git to review changes and recover earlier decisions |

</div>

## Skills

| Skill | Outcome | Side effects |
|-------|---------|--------------|
| `compile-sources` | Turn raw sources into traceable wiki articles | Article, index and processed-source metadata updates |
| `query-wiki` | Answer from actual notes with freshness and evidence limits | Read-only answers unless saving is requested |
| `maintain-wiki` | Triage health warnings and make scoped repairs | Read-only audit by default; repairs or saved reports when requested |
| `research-intake` | Evaluate external sources and record provenance | Answers in chat; pending raw notes when capture is requested |
| `reconcile-memory` | Resolve stale or conflicting knowledge while preserving history | Scoped vault updates when requested |
| `session-handoff` | Preserve goals, evidence, running jobs and next actions | Chat summary or a saved project handoff when requested |
| `debug-evidence` | Reproduce failures and test causal hypotheses | Diagnostic output and bounded repairs within the task |
| `verify-outcomes` | Match completion claims to the evidence that supports them | Verification output; external actions still require task authorization |
| `evaluate-skills` | Review skill routing, behavior and recorded observations | Local checks and evaluation artifacts |

Skills are agent instructions, not shell executables. Run
`python3 scripts/skills.py catalog` to list their descriptions and paths, then
ask your agent to use the relevant skill. Agents with project skill discovery
can load them directly; others can read the listed `SKILL.md` file.

Canonical skills live in `.agents/skills/`. Relative links in `.claude/skills/`
expose the same instructions to Claude. The existing Obsidian skill remains
separate. No global skill installation is required.

See [AGENTS.md](AGENTS.md) for discovery and validation, and the
[research record](03_RESOURCES/Docs/Agent%20Skill%20Improvement%20Research.md)
for sources, selection decisions and evaluation limits.

## Knowledge Workflow

AgentOS separates captured material from compiled knowledge:

```text
Capture sources → 05_RAW/_topics/<topic>/
Compile findings → 03_RESOURCES/Wiki/<topic>/
Connect knowledge → Topic indexes and related notes
Reuse evidence → Agent answers, decisions and project work
```

Drop articles, papers, repository notes or transcripts into `05_RAW/`. Ask an
agent to compile them into a wiki article with source links, then browse the
result in Obsidian. Another agent can read the same files in a later session.
Agents must load the relevant notes; the vault does not automatically inject
all prior knowledge into every conversation.

Use `00_INBOX/` for captures without a clear home, `01_PROJECTS/` for active
work, and `02_AREAS/` for ongoing responsibilities. Create inbox, archive or
wiki topic folders as needed.

| Playbook | When to use it |
|----------|----------------|
| [Raw Ingest to Wiki](03_RESOURCES/Playbooks/Raw%20Ingest%20to%20Wiki.md) | Compile sources into linked articles and update their indexes |
| [Q&A Against the Wiki](03_RESOURCES/Playbooks/Q%26A%20Against%20the%20Wiki.md) | Find relevant notes and answer grounded research questions |
| [Wiki Health Check](03_RESOURCES/Playbooks/Wiki%20Health%20Check.md) | Review orphans, metadata gaps and uncompiled sources |
| [Marp Slides Output](03_RESOURCES/Playbooks/Marp%20Slides%20Output.md) | Turn wiki content into a slide deck |

## Technologies Used

<div align="center">

![Markdown](https://img.shields.io/badge/Markdown-000000?style=flat-square&logo=markdown&logoColor=white)
![Obsidian](https://img.shields.io/badge/Obsidian-7C3AED?style=flat-square&logo=obsidian&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)

</div>

| Technology | Purpose |
|------------|---------|
| **Markdown + SKILL.md** | Portable notes, playbooks and agent instructions |
| **Obsidian** | Human navigation, backlinks, search and graph view |
| **Git** | Shared history and reviewable knowledge changes |
| **Python standard library** | Skill catalog, validation, evaluation scoring and tests |
| **Node.js** | Wiki health checker and vault navigator build script |
| **Bash** | Interactive vault and Obsidian setup on macOS or Linux |
| **GitHub Actions** | Skill validation on pull requests and main |

## Project Structure

```text
agentos/
├── 00_INBOX/                 # Unsorted captures; create as needed
├── 01_PROJECTS/              # Active deliverables and the vault navigator
├── 02_AREAS/agents/          # Agent profiles and ongoing responsibilities
├── 03_RESOURCES/
│   ├── Docs/                 # Reference guides and research
│   ├── Playbooks/            # Detailed reusable workflows
│   ├── Templates/            # Note templates
│   ├── Attachments/          # Local images and diagrams
│   └── Wiki/                 # Compiled topic articles; create as needed
├── 04_ARCHIVE/               # Retired work; create as needed
├── 05_RAW/_topics/           # Unprocessed source material
├── .agents/skills/           # Nine canonical project skills
├── .claude/skills/           # Claude links and the existing Obsidian skill
├── .github/workflows/        # Skill validation CI
├── scripts/                  # Catalog, validation and evaluation tools
├── tests/                    # Tooling tests
├── installer/                # Node-based installer UI source
├── install.sh                # Interactive setup entrypoint
├── AGENTS.md                 # Shared agent entrypoint
└── CLAUDE.md                 # Vault layout and note conventions
```

## Local Development

### Quick Start

Clone the vault, inspect the installer, then run it from an interactive terminal:

```sh
git clone https://github.com/joeconstanti/agentos.git ~/agentos
cd ~/agentos
less install.sh
./install.sh
```

Or use the remote installer:

```sh
curl -fsSL https://raw.githubusercontent.com/joeconstanti/agentos/main/install.sh | bash
```

The installer requires Git and a terminal. It prompts for a parent directory
(default: your home directory), clones or uses `<directory>/agentos`, installs
Obsidian if needed, and attempts to register and open the vault.

| Platform | Obsidian installation |
|----------|-----------------------|
| **macOS** | Uses an existing installation or Homebrew: `brew install --cask obsidian` |
| **Linux** | Uses an existing installation or Snap: `sudo snap install obsidian --classic` |

The setup script supports macOS and Linux. You can also open the cloned folder
as a vault in an existing Obsidian installation, or work directly with its
Markdown files without running the installer.

### Agent Support

| Agent | How it uses AgentOS |
|-------|---------------------|
| [Claude Code](02_AREAS/agents/Claude%20Code.md) | Reads `CLAUDE.md` and project skills through `.claude/skills/` |
| [Codex](02_AREAS/agents/Codex.md) | Reads `AGENTS.md` and canonical `.agents/skills/` files |
| [Cursor](02_AREAS/agents/Cursor.md) | Reads vault notes and relevant canonical skill instructions |
| [Gemini CLI](02_AREAS/agents/Gemini%20CLI.md) | Reads vault notes and relevant canonical skill instructions |
| [OpenCode](02_AREAS/agents/OpenCode.md) | Reads vault notes and relevant canonical skill instructions |
| [Custom MCP-backed agents](02_AREAS/agents/Custom%20MCP-backed%20agents.md) | Accesses the vault through its configured file tools |

These are shared-file workflows. Automatic skill discovery and invocation depend
on the client. AgentOS includes Claude links; it does not ship command adapters
for every client. Checkouts must preserve relative symlinks to use those links.

### Validation

Run from the repository root with Python 3:

```sh
python3 scripts/skills.py catalog
python3 scripts/skills.py check
python3 scripts/evaluate_skills.py check
python3 -m unittest discover -s tests -v
```

The maintained frontmatter profile uses JSON-quoted `name` and `description`
scalars, which are valid YAML. Validation checks that profile, skill names,
local references and Claude links; it is not a general YAML parser.

GitHub Actions runs packaging checks, evaluation-definition checks and unit
tests. The included scenarios support behavior review. Static CI does not run
model trials or establish a measured improvement in agent performance.

For wiki health, run the read-only report with Node.js:

```sh
node 01_PROJECTS/agentos_web/wiki-health-check.js
```

### CI behavior and limits

[Skill validation](.github/workflows/skills.yml) runs on pull requests and pushes
into `main`. Feature-branch pushes use the PR run; the subsequent `main` run
checks the merged result. New revisions cancel superseded runs on the same PR.
Each `main` run remains independent so post-merge evidence is retained.

CI always runs the Python checks above and `git diff --check`. The Node
fixture suite runs on every `main` push and every PR except those that only
edit existing Markdown files in `03_RESOURCES/Docs/` or the root `README.md`.
Additions, deletions, renames, type changes and unverified PR comparisons
use the full suite. Python checks still validate skill references to the
documentation.

```sh
node --test tests/*.test.js
git diff --check
```

Use Python 3.10+ and Node.js 18+ for these checks. They require no dependency
installation, Obsidian session, network service, browser or live vault. The
health-check regression tests use temporary fixture vaults; permission-denied
traversal is mocked so it also works under privileged runners.

The read-only wiki health report can contain heuristic findings in real notes;
`--strict` deliberately returns a failure when findings exist. CI tests that
contract on fixtures rather than requiring the entire personal vault to have
zero findings. Skill definition checks do not execute model trials, and CI does
not verify the installer UI, installed Obsidian or a live deployment. Investigate
a failed current-head check before merging; rerun only after a change or evidence
of a transient runner failure.

### Workflow Evaluation

List the positive behavior and negative routing cases:

```sh
python3 scripts/evaluate_skills.py cases
```

Use the [evaluation skill](.agents/skills/evaluate-skills/SKILL.md) to record
actual observations. The optional scorer checks complete result records and
summarizes supplied evidence; it does not run a model or verify that evidence
independently.

## Customization

Start with the [note template](03_RESOURCES/Templates/main.md) and follow the
conventions in [CLAUDE.md](CLAUDE.md). Keep project work in its project folder,
reference material in `03_RESOURCES/`, and raw sources in `05_RAW/`.

Update the relevant `_index.md` when adding a reference note. Add reusable
procedures to `03_RESOURCES/Playbooks/`, or extend a project skill when the task
needs discoverable instructions. Keep skill descriptions specific and load
supporting material only when needed.

Obsidian settings in `.obsidian/` are shared app configuration. Keep changes to
plugins, hotkeys and themes separate from ordinary note or skill updates.

## Contributing

<div align="center">

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge)
[![Issues](https://img.shields.io/badge/Issues-Welcome-red?style=for-the-badge)](https://github.com/joeconstanti/agentos/issues)

</div>

| Step | Action |
|------|--------|
| **Branch** | Use a descriptive branch such as `docs/wiki-navigation` |
| **Change** | Keep notes traceable and skill changes focused on the requested workflow |
| **Validate** | Run the relevant checks above and inspect the diff |
| **PR** | Explain the resulting behavior, evidence and remaining limits |

Useful contributions include clearer source provenance, practical playbooks,
agent compatibility fixes and evidence-backed skill improvements.

## Acknowledgments

- [Obsidian](https://obsidian.md): the vault's human navigation and linking interface.
- [Agent Skills](https://agentskills.io/specification): the portable skill format.
- [Anthropic skills](https://github.com/anthropics/skills) and [Superpowers](https://github.com/obra/superpowers): research references for skill evaluation, debugging and verification.
- [jstack](https://github.com/joeconstanti/jstack): README structure and presentation reference.

See the [research record](03_RESOURCES/Docs/Agent%20Skill%20Improvement%20Research.md)
for the rationale behind the original AgentOS workflow instructions.

---

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/joeconstanti/agentos?style=social)](https://github.com/joeconstanti/agentos/stargazers)

**Made by [Joe](https://madebyjoe.co)**

[GitHub](https://github.com/joeconstanti/agentos) • [Report Bug](https://github.com/joeconstanti/agentos/issues)

</div>
