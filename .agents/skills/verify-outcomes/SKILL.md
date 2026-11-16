---
name: "verify-outcomes"
description: "Verify task outcomes before reporting completion, especially code, deployment, installation, or multi-step delivery. Use when preparing a completion claim."
---
# Verify the claimed outcome

Translate the user's latest scope into observable acceptance conditions. Reuse valid evidence for unchanged work; do not repeat broad suites without a new reason. Select the smallest check that proves each condition.

Run or inspect the relevant checks on the final changed state. Record the command or action, target environment, commit or artifact when relevant, result, and limits. A command that started successfully may still fail later; obtain its exit status or terminal job result.

Match claims to evidence: a source diff proves an edit; a test proves its covered behavior; a build proves artifact creation; a push proves remote Git state. Installation needs evidence from the installed target. Deployment needs evidence from the intended environment and affected route or flow. Do not substitute one layer for another.

For pull requests, inspect the current head, required checks, mergeability, reviews, and unresolved findings before merging within the user's authorization. Do not bypass protections. Confirm merged state afterward. If checks are pending, use the environment's supported notification/watch mechanism when available instead of repeated polling.

For skills, metadata validation proves packaging. Evaluate realistic trigger and behavior cases separately, and label manual scenario review as such. Do not call static validation a model benchmark.

Report what changed and what the evidence supports. If a requested condition remains unverified or failed, state it directly and keep the task open where continued action is possible. Never infer success merely from the absence of an error message.
