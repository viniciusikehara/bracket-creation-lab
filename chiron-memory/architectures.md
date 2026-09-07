# architecture

How the system is put together — layers, boundaries, and how data flows.

## Four layers, one direction: domain → persistence → store → UI

**What** · `src/domain/` holds entity types and factories with no I/O. `src/persistence/` turns the
localStorage envelope into domain records and back. `src/store/` is a small external store (one
immutable `AppData` snapshot, a `Set` of listeners, write-through to storage on every mutation)
exposed to React through `useSyncExternalStore`. `src/shell/` frames the screens in `src/screens/`.
Queries (`playerById`, `roundsOfTournament`, …) are pure functions over a snapshot, so screens and
tests use the same ones.

**Why** · Each layer is testable without the one above it: persistence is tested with a fake
`StorageLike`, the store with a real store over a fake storage, and screens over a real store — no
mocking framework anywhere. `useSyncExternalStore` gives React a tear-free view of a store that also
changes from outside React (another tab writing to the same key fires `reload()`).

**Where** · `src/domain/`, `src/persistence/`, `src/store/`, `src/shell/`, `src/screens/`.

**Learned** · 2026-09-07, work order "Application foundation: data model, persistence & shared UI shell".
