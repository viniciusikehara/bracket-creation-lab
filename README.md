# Bracket Creation Lab

A web app for running informal single-elimination tournaments (office ping-pong,
pool, FIFA, foosball). Users register players, create a tournament with 2 to 8
participants, generate a bracket, and click through matches until a champion is
crowned.

## Running it

```sh
npm install
npm run dev     # Vite dev server
npm test        # Vitest
npm run build   # typecheck + production build
```

There is no backend: players, tournaments and matches live in the browser's localStorage under a
single versioned key, so everything survives a reload on the machine that created it.

## Layout

| Path | What lives there |
| --- | --- |
| `src/domain/` | `Player`, `Tournament`, `Match` types and their factories |
| `src/persistence/` | The versioned localStorage envelope, the tolerant reader, migrations |
| `src/store/` | The write-through store, its React provider, and pure queries |
| `src/theme/` | Light / dark / system theme, applied as `data-theme` on `<html>` |
| `src/shell/` | Header, navigation and the responsive frame every screen renders in |
| `src/screens/` | Players, New tournament, Bracket, Champion, History |

Adding a field to `Match` or `Tournament` does **not** need a migration or a `SCHEMA_VERSION` bump —
add it to the interface and default it in `src/persistence/read.ts`. See `chiron-memory/` for why.
