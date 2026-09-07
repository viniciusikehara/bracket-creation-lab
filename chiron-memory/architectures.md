# architecture

How the system is put together — layers, boundaries, and how data flows.

## All app data (players, tournaments, matches) is persisted in a single localStorage key as…

What: All app data (players, tournaments, matches) is persisted in a single localStorage key as a versioned envelope `{ schema_version, players, tournaments, matches }` · Why: — · Where: src/persistence/ <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-1 -->

## Players are stored as a flat collection keyed by id rather than embedded inside tournamen…

What: Players are stored as a flat collection keyed by id rather than embedded inside tournament rosters · Why: a player renamed later stays consistent across every tournament that references them · Where: src/domain/, src/store/ <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-4 -->

## Matches live in their own top-level collection rather than nested inside the tournament r…

What: Matches live in their own top-level collection rather than nested inside the tournament record · Why: the bracket can be queried by round (matches of tournament X, by round) without rewriting the whole tournament record on every match result · Where: src/domain/, src/store/ <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-5 -->

## The store layer is a small repository over the persistence layer (CRUD + queries), expose…

What: The store layer is a small repository over the persistence layer (CRUD + queries), exposed to React via context using useSyncExternalStore, and every mutation writes through to localStorage immediately · Why: — · Where: src/store/store.ts, src/store/StoreProvider.tsx <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-6 -->

## Theme state (light/dark/system) is applied via a `data-theme` attribute on `<html>`, pers…

What: Theme state (light/dark/system) is applied via a `data-theme` attribute on `<html>`, persisted choice with `prefers-color-scheme` as the default, and the toggle lives in the shell header so it applies on every screen · Why: — · Where: src/theme/, src/shell/ <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-7 -->

## Navigation swaps from a horizontal header nav (desktop) to a bottom tab bar (phone) at th…

What: Navigation swaps from a horizontal header nav (desktop) to a bottom tab bar (phone) at the 768px breakpoint · Why: — · Where: src/shell/ <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-9 -->
