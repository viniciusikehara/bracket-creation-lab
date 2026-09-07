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

## One bracket component; interactivity is opt-in, not a `readOnly` flag

**What** · `src/bracket/BracketView.tsx` renders `roundsOfTournament()` output as one column per
round. It takes an OPTIONAL `onSelectMatch`. Without a handler each match is a plain `<div>`; with
one it is a `<button>`. `src/bracket/roundLabel.ts` names rounds from the end
(Final / Semi-finals / Quarter-finals / Round N), which is how people talk about a bracket.

**Why** · "Read-only" has to be structural, not cosmetic. With interactivity opt-in, a read-only
bracket has literally no button, input or focusable element in its subtree — a test can assert
`querySelectorAll('button, input, ...').length === 0` instead of asserting that something merely
looks disabled. A boolean `readOnly` prop would invert the default the wrong way: forgetting it
would render an editable bracket, whereas forgetting a handler renders a safe one. The live Bracket
screen reuses the same component by passing a handler rather than growing a second renderer.

**Where** · `src/bracket/` (`BracketView.tsx`, `BracketView.css`, `roundLabel.ts`), consumed by
`src/screens/HistoryTournamentScreen.tsx`.

**Learned** · 2026-09-07, work order "History screen" — verified in the running app: an 8-player
finished bracket rendered with zero interactive nodes inside `.bracket`, and the only control in the
content area was the back link.
