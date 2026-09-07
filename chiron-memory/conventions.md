# convention

A rule the codebase follows — naming, patterns, and where things live.

## The persistence reader is tolerant — it spreads each stored record through unchanged and…

What: The persistence reader is tolerant — it spreads each stored record through unchanged and only normalises fields the current version knows about, so unknown/extra fields survive a read+write cycle and missing fields get defaults · Why: lets future work orders add fields (e.g. third_place_match_id, elo_delta) without writing a migration or bumping schema_version · Where: src/persistence/read.ts · Learned: verified end-to-end in the running app, not just unit tests — a tournament with third_place_match_id/format and a match with elo_delta survived a full read→write cycle driven by real UI actions. <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-2 -->

## src/persistence/migrations.ts exists but is intentionally left empty

What: src/persistence/migrations.ts exists but is intentionally left empty · Why: reserved only for genuinely breaking schema changes (a field renamed or repurposed), since additive changes are handled by the tolerant reader instead · Where: src/persistence/migrations.ts <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-3 -->

## Responsive layout relies on `min-width: 0` on flex/grid children, with horizontal scroll…

What: Responsive layout relies on `min-width: 0` on flex/grid children, with horizontal scroll confined to dedicated containers (e.g. the bracket view) so nothing at the app-shell level overflows · Why: — · Where: src/styles/global.css, src/shell/AppShell.tsx · Learned: verified at 320/390/768/1280px — page scrollWidth always equals viewport width with zero overflowing elements. <!-- id: 40bace98-9a0b-4921-86a5-210880b65659-8 -->
