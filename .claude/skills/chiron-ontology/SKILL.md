---
name: chiron-ontology
description: Consult the project's knowledge base (PRD/brief your task came from, analyzed repos, docs, work items) via the ontology_* tools. Use when the task references context you don't see in the repo, and before designing anything that crosses module boundaries.
---

# Chiron project ontology

Besides the repository, this project has a knowledge base (the "ontology"): the PRD/brief your task was generated from, other company documents, the analyzed codebase (searchable code, architecture graph, generated docs) and — when connected — work items, commits and PRs. Three tools reach ALL of it:

1. `ontology_discover` — the map: which repos are analyzed and which knowledge sources exist (with counts). Call it FIRST; if it says the knowledge base is empty, don't search it.
2. `ontology_search` — one ranked search across every source. Narrow with `sources: ["company_docs"]` when you specifically want the PRD/brief or uploaded specs.
3. `ontology_fetch` — the full object behind a `ref` a search returned (or one seeded in your task context). Never invent a ref.

## When to use
- The task description references a decision, flow or requirement you can't find in the repo → search the PRD (`sources: ["company_docs"]`).
- Before designing anything that crosses module boundaries → search code/graph/docs for how it's already structured.
- You wonder "why is this requirement shaped like this" → fetch the brief and read the surrounding section.

## SCOPE RULE (mandatory)
The PRD describes the WHOLE initiative; your task is ONE slice of it. Use PRD content to understand the *why* of YOUR task — never as a work list:

- Implement ONLY what YOUR task and its acceptance criteria specify. The acceptance criteria are your contract.
- Other PRD sections belong to OTHER tasks (possibly other agents). Do NOT implement, refactor or "prepare" them, even when it looks quick or convenient.
- If reading the PRD reveals something missing or contradictory in your task, SAY IT in your final summary — don't act on it.
