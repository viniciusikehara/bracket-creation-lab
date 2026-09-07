# decision

A choice made and the reasoning behind it — the path taken over the alternatives.

## Persistence is a single versioned localStorage envelope

**What** · All app data lives under one localStorage key, `bracketeer.store`, holding
`{ schema_version, players, tournaments, matches }` (`src/persistence/schema.ts`). Entities are
three flat collections, not nested inside each other: matches reference `tournament_id`, tournaments
reference `player_ids`.

**Why** · One key means one atomic write per mutation, so a reload can never observe a half-written
state where a match exists but its tournament does not. Flat collections keep the bracket queryable
by round (`roundsOfTournament`) and let a single match result be updated without rewriting the whole
tournament record. Player identity stays in one place, so renaming a player is consistent on every
screen and in every past tournament.

**Where** · `src/persistence/schema.ts`, `src/persistence/storage.ts`, `src/store/store.ts`.

**Learned** · 2026-09-07, work order "Application foundation: data model, persistence & shared UI shell".

## Theme is one `data-theme` attribute on `<html>`, never per-component

**What** · `ThemeProvider` (`src/theme/ThemeProvider.tsx`) resolves the preference
(`light | dark | system`, stored under `bracketeer.theme`) and writes `data-theme` plus
`color-scheme` onto `document.documentElement`. Components only ever read CSS custom properties
(`var(--surface)`, `var(--text)`, …) defined in `src/styles/tokens.css`.

**Why** · A single attribute makes the theme apply to every screen at once, including anything
rendered outside React's tree, and a new component gets the theme right without knowing which one is
active. The default is `system`, so the app matches the OS until the user says otherwise.

**Where** · `src/theme/ThemeProvider.tsx`, `src/styles/tokens.css`.

**Learned** · 2026-09-07, work order "Application foundation: data model, persistence & shared UI shell".
