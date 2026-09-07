# gotcha

A non-obvious pitfall or trap, learned the hard way.

## `localStorage` can throw, not just return null

**What** · Reading or writing `window.localStorage` throws outright in private-mode Safari and
wherever the origin blocks site data — the accessor itself raises, so an unguarded call breaks the
app at boot. `src/persistence/storage.ts` probes storage once, falls back to an in-memory
implementation when it is denied, and wraps every write in try/catch (quota can be exceeded or
access revoked mid-session).

**Why** · The app has no server, so a storage failure would otherwise be a white screen rather than
a degraded session. With the fallback the app still works for the current session, it just cannot
remember anything afterwards.

**Where** · `src/persistence/storage.ts`, `src/theme/ThemeProvider.tsx`.

**Learned** · 2026-09-07, work order "Application foundation: data model, persistence & shared UI shell".
