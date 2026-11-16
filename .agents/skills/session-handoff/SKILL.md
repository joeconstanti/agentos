---
name: "session-handoff"
description: "Prepare a resumable AgentOS work handoff when asked to pause, transfer, or summarize unfinished work. Do not use for ordinary status answers."
---
# Prepare a resumable handoff

Capture the active goal, latest user corrections, constraints, completed outcomes, and remaining work. Keep verified facts separate from assumptions. Include exact repository, branch, and relevant commit IDs when code work is involved; inspect the current state rather than relying on an earlier snapshot.

Record dirty paths and ownership of unrelated changes without copying secrets or private file contents. Preserve unfinished nested tasks. Link evidence for tests, builds, deployed state, and artifacts with the scope each proves. A local build is not deployment evidence.

For running work, record the existing job identifier, status, output location, and safe resume/check command. Instruct the next session to check that job before resubmitting. Do not cancel work, start duplicate jobs, or restart services merely to make the handoff tidy.

State the next concrete action and any exact missing input or blocker. Include permissions already given and actions still outside scope. The handoff must not silently broaden authorization.

Write a handoff note under the relevant `01_PROJECTS/<project>/` only when a saved handoff is requested; otherwise respond in the thread. Use vault frontmatter for saved notes and link them from the project's existing index if present. Never include tokens, passwords, environment values, or secret-bearing URLs.

Verify referenced files exist and commands are appropriate for the recorded environment. A fresh session should be able to continue from the handoff without repeating completed work or guessing which branch holds it.
