/**
 * Migrations exist for the rare BREAKING change (a field renamed or repurposed).
 * Additive fields must never go here — the tolerant reader already handles them.
 *
 * Each entry upgrades a raw envelope from `version` to `version + 1`.
 */
export interface Migration {
  from: number
  migrate: (raw: Record<string, unknown>) => Record<string, unknown>
}

export const migrations: Migration[] = []

export function runMigrations(raw: Record<string, unknown>, from: number, to: number): Record<string, unknown> {
  let current = raw
  let version = from
  while (version < to) {
    const step = migrations.find((m) => m.from === version)
    if (!step) break // nothing registered: the tolerant reader takes it from here
    current = step.migrate(current)
    version += 1
  }
  return current
}
