# config

Setup and configuration — env vars, flags, how to run the project.

## Running and checking the app

**What** · `npm run dev` (Vite dev server), `npm test` (Vitest, jsdom), `npm run build`
(`tsc -b` then `vite build`). No env vars and no backend — everything persists in the browser.

**Why** · The app is client-only by design: an office bracket tool with no accounts and no server,
so localStorage is the whole persistence story and the test suite can run entirely in jsdom.

**Where** · `package.json`, `vite.config.ts` (Vitest config lives inside it, hence the
`vitest/config` import rather than `vite`).

**Learned** · 2026-09-07, work order "Application foundation: data model, persistence & shared UI shell".
