---
name: chiron-memory
description: Read the project's canonical memory before working. Use at the START of every task, before designing or editing code, and whenever you hit an unfamiliar convention or wonder "why is it like this".
---

# Chiron project memory

This project keeps its canonical **decisions, architecture and conventions** as readable markdown in the `chiron-memory/` folder (the *why* behind the code and the non-obvious pitfalls that reading files won't tell you).

## When to use (not optional)
- At the START of a task, BEFORE exploring the codebase or designing anything.
- BEFORE any architecture / design / library / naming decision.
- When you hit an unfamiliar pattern or wonder "why is it like this".
- Before editing a file, to check what's already been decided about it.

## How — two paths, you choose
1. Read `chiron-memory/chiron-memory.md` first — it's the map (one [[link]] per type file). Open the type files relevant to your task (`decisions.md`, `conventions.md`, …): each item is a `##` section in What · Why · Where · Learned form.
2. `memory_canonical` tool — the exact/curated truth of how this project does things. Use it for precise, high-stakes lookups (decisions, architecture, conventions, rules) and before any design/naming decision. Each result names its file — open it for the full concept.
3. `memory_search` tool — SEMANTIC search across everything (the long tail: gotchas, past experience). Use it for exploratory questions, or when `memory_canonical` finds nothing.

Treat canonical memory as ground truth: if a canonical concept exists, follow it instead of guessing or re-deciding.
