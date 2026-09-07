# convention

A rule the codebase follows — naming, patterns, and where things live.

## Storage reads are tolerant: unknown fields survive, missing fields default

**What** · `src/persistence/read.ts` spreads every stored record through unchanged and only
normalises the fields this version knows about on top. A record written by a newer version keeps its
unknown fields across a read/write cycle; a record written by an older version gains today's fields
by defaulting. Records are dropped only when they have no usable identity (missing `id`, blank name).

**Why** · The data model has to absorb double elimination, group stages, a third-place match and Elo
ranking later "without migrating away existing records". Because reads are tolerant, an ADDITIVE
field needs no migration and no `SCHEMA_VERSION` bump — just add it to the interface and default it
in the reader. `src/persistence/migrations.ts` is reserved for genuinely breaking changes (a field
renamed or repurposed) and is empty by design.

**Where** · `src/persistence/read.ts`, `src/persistence/migrations.ts`; covered by
`src/persistence/read.test.ts`.

**Learned** · 2026-09-07, work order "Application foundation: data model, persistence & shared UI shell".

## Only `.scroll-x` containers scroll sideways; the page never does

**What** · `body` carries `overflow-x: hidden`, layout children that can hold long content carry
`min-width: 0`, and text containers carry `overflow-wrap: anywhere`. Anything genuinely wider than a
phone — the bracket above all — goes inside a `.scroll-x` element that scrolls on its own.

**Why** · "The bracket must remain readable and scrollable on a phone" without the whole shell
sliding around. Flex/grid children default to `min-width: auto`, which is what silently pushes a
phone layout wide; setting `min-width: 0` is what actually prevents it, not the `overflow-x` alone.

**Where** · `src/styles/global.css`, `src/shell/AppShell.css`, `src/screens/BracketScreen.tsx`.

**Learned** · 2026-09-07, verified at 320/390/768/1280 px — page stayed at viewport width while the
bracket box scrolled its 640 px content.

## Detail routes live outside `ROUTES`; the route table is exported as `AppRoutes`

**What** · `ROUTES` (`src/shell/routes.ts`) is the NAV, not the router: it holds only the five
top-level screens. A detail route such as `/history/:tournamentId` is declared in `AppRoutes`
(`src/App.tsx`) and reached by opening a row, never by a nav item. `AppRoutes` is exported separately
from `App` so tests mount the real route table under a `MemoryRouter` at any path.

**Why** · `NavLink` matches nested paths by default, so History stays highlighted on
`/history/t1` without extra work — adding the detail route to `ROUTES` would instead put a
parameterised path in the tab bar. Exporting the route table keeps screen tests navigating through
the same routes the app uses rather than rendering a screen component in isolation with a hand-made
`useParams`.

**Where** · `src/App.tsx`, `src/shell/routes.ts`; used by `src/screens/HistoryScreen.test.tsx`.

**Learned** · 2026-09-07, work order "History screen".
