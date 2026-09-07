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

## History lists finished tournaments only; drafts and running ones never appear

**What** · `finishedTournamentsNewestFirst` (`src/store/store.ts`) filters `tournamentsNewestFirst`
by `isFinished`, and it is the only query the History screen uses. The screen shows two different
empty states: "No tournaments yet" when the store is empty, and "No tournament has finished yet"
when tournaments exist but none is over.

**Why** · A draft has no result to look back on and a running one still belongs to the Bracket
screen, so History stays what its name promises. The two empty states matter because a board full of
in-progress tournaments showing "No tournaments yet" reads as lost data, not as an empty filter.

**Where** · `src/store/store.ts`, `src/screens/HistoryScreen.tsx`; covered by
`src/store/store.test.ts` and `src/screens/HistoryScreen.test.tsx`.

**Learned** · 2026-09-07, work order "History screen".

## `canRecordResults(tournament)` is the single gate on editing a result

**What** · `src/domain/tournament.ts` exports `isFinished` (`status === 'finished'`) and
`canRecordResults` (`status === 'in_progress'`). No screen decides for itself whether results may be
written by comparing `status` inline.

**Why** · Read-only-ness has to be one rule, not one opinion per screen: a draft has no bracket to
score and a finished tournament is a record of what happened. Putting the predicate in the domain
layer means the History screen, the Bracket screen and any later screen can only disagree by
disagreeing with the domain, which is visible in review.

**Where** · `src/domain/tournament.ts`, used by `src/screens/HistoryTournamentScreen.tsx`.

**Learned** · 2026-09-07, work order "History screen".
