---
id: 20260406090600
type: note
status: draft
created: 2026-04-06 09:06
tags:
  - docs
  - guides
  - agents
  - orchestration
  - multi-agent
  - architecture
area: docs
---
# Multi-Agent Orchestration

A single agent with one context window can only do so much. For complex tasks — large codebases, parallel research, long documents, workflows that branch based on intermediate results — you need multiple agents working together. Multi-agent orchestration is the set of patterns for coordinating that work.

This note covers the core architecture patterns, Claude's native Task tool for spawning subagents, and how orchestration looks in frameworks like LangGraph and CrewAI.

## Why multiple agents?

**Context limits** — a single context window can hold only so much. Split a large task across agents so each one focuses on a bounded scope.

**Parallelism** — independent subtasks can run at the same time. Researching ten topics in parallel with ten agents takes the same wall-clock time as researching one.

**Specialisation** — each agent gets a system prompt optimised for its role. A "code reviewer" agent can have different instructions than a "documentation writer" agent, even if the same model powers both.

**Reliability** — smaller, focused tasks fail less often and are easier to retry than one monolithic task.

## The orchestrator/subagent pattern

The most common pattern:

```
Orchestrator (planner)
├── Subagent A (research)
├── Subagent B (research)
├── Subagent C (code)
└── Subagent D (review)
```

The **orchestrator** receives the high-level goal, breaks it into subtasks, spawns subagents, collects their results, and synthesises the final output. It doesn't do the work itself — it delegates.

**Subagents** receive a focused task, a bounded context, and whatever tools they need to complete it. They return a result to the orchestrator and terminate.

Key design principle: the orchestrator should be stateless between subagent calls. Pass all necessary context explicitly — don't rely on subagents sharing memory.

## Claude's Task tool (spawning subagents)

Claude Code has a built-in `Task` tool that launches a new Claude agent as a subprocess. Each subagent gets its own context window and can use any tool available to the parent.

```
Use the Task tool to research the top 5 alternatives to Pinecone for vector storage.
For each alternative, create a separate sub-task that fetches the documentation,
extracts pricing, and summarises the trade-offs. Return all results as a JSON array.
```

The orchestrator in this pattern is just Claude itself, deciding when to spawn Tasks and how to combine their outputs.

### Passing context to subagents

The subagent's prompt is constructed by the orchestrator. Be explicit about what the subagent needs:

```
Task: Review the TypeScript file at src/auth/session.ts for security issues.
Context: This is an Express session middleware. The project uses express-session
with Redis as the store. Pay particular attention to session fixation and CSRF.
Output: Return a JSON array of findings, each with "severity", "line", "issue",
and "recommendation" fields.
```

Everything the subagent needs to act correctly should be in the prompt. Don't assume it has access to the parent's conversation history.

### Handling results

Subagents return text. For reliable downstream processing, instruct them to return structured output (JSON) and parse it in the orchestrator:

```
Collect the JSON arrays from all research subagents.
Merge them, deduplicate by "name" field, sort by "rating" descending,
and write the final result to 03_RESOURCES/Notes/vector-store-comparison.md
```

## Parallelism

The real power of multi-agent systems is parallelism. In Claude Code, launching multiple Tasks in a single turn executes them concurrently:

```
Launch three Tasks in parallel:
1. Summarise all notes tagged #meeting from the last 7 days
2. List all open tasks from 01_PROJECTS/
3. Check for any notes in 00_INBOX/ older than 14 days

Combine the results into a weekly review note in 01_PROJECTS/weekly-review/.
```

### When parallelism helps vs hurts

**Good for parallel**: independent research tasks, parallel code review of unrelated files, generating multiple creative options, batch processing items in a list.

**Bad for parallel**: tasks where one depends on another's output, tasks that write to the same file (race conditions), tasks that share a resource with a rate limit.

## LangGraph patterns

LangGraph (from LangChain) models agent workflows as graphs where nodes are agents or functions and edges are transitions. It's a good choice when you need explicit control over routing logic and state.

A simple example: a research → write → review cycle.

```python
from langgraph.graph import StateGraph, END

def research_node(state):
    # Call a research agent, return results
    return {"research": research_agent.run(state["topic"])}

def write_node(state):
    # Draft based on research
    return {"draft": writer_agent.run(state["research"])}

def review_node(state):
    # Review and decide: done or needs revision
    result = reviewer_agent.run(state["draft"])
    return {"review": result, "approved": result["approved"]}

def route_after_review(state):
    return END if state["approved"] else "write"

workflow = StateGraph(dict)
workflow.add_node("research", research_node)
workflow.add_node("write", write_node)
workflow.add_node("review", review_node)
workflow.add_edge("research", "write")
workflow.add_edge("write", "review")
workflow.add_conditional_edges("review", route_after_review)
workflow.set_entry_point("research")

app = workflow.compile()
result = app.invoke({"topic": "MCP protocol"})
```

LangGraph handles state persistence between nodes, making it possible to resume a workflow after a failure or a human-in-the-loop approval step.

## CrewAI patterns

CrewAI takes a role-based approach: you define a crew of agents, each with a role, goal, and backstory, then assign them tasks. The crew figures out the execution order.

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Research Analyst",
    goal="Find accurate, up-to-date information on {topic}",
    backstory="You are a meticulous researcher who cites sources.",
    tools=[search_tool, fetch_tool],
)

writer = Agent(
    role="Technical Writer",
    goal="Write clear, concise documentation based on research",
    backstory="You write for developers. You prefer code examples over prose.",
)

research_task = Task(
    description="Research {topic} and extract key concepts",
    agent=researcher,
    expected_output="Bullet list of key concepts with sources",
)

write_task = Task(
    description="Write a getting-started guide based on the research",
    agent=writer,
    expected_output="A Markdown document with code examples",
    context=[research_task],     # depends on research completing first
)

crew = Crew(agents=[researcher, writer], tasks=[research_task, write_task])
result = crew.kickoff(inputs={"topic": "MCP protocol"})
```

CrewAI is well-suited to document generation, research pipelines, and content workflows. LangGraph is better when you need precise control over state transitions and loops.

## Error handling in multi-agent systems

Failures are more likely when you have more agents. Design for them:

**Retry with context** — if a subagent fails, pass the error message back to the orchestrator and let it decide whether to retry, simplify the task, or escalate.

**Timeouts** — set a maximum time for each subagent. A task that runs for 10 minutes is probably stuck.

**Checkpoint state** — for long-running workflows, save intermediate results so you can resume from the last successful step rather than re-running everything.

**Human-in-the-loop** — for irreversible actions (sending emails, deleting files, publishing), add an approval step before execution. LangGraph has built-in support for this via `interrupt_before`.

## Checklist for a new multi-agent design

- [ ] Can this task actually be parallelised, or do steps depend on each other?
- [ ] Is each subagent's task bounded and well-specified?
- [ ] Does each subagent have only the tools it needs (principle of least privilege)?
- [ ] Is there a way to detect and recover from subagent failure?
- [ ] Are you passing all necessary context explicitly (no hidden state)?
- [ ] Do any subagents write to the same resource? If so, serialize them.

---

## Related notes

- [[AI Coding Agent Alternatives]] — overview of agents that support multi-agent patterns
- [[Custom MCP-backed agents]] — how MCP enables tool-sharing across agents in a crew
- [[Getting Started with MCP]] — the protocol that lets subagents share tools
