import type { Match, Player, Tournament } from '../domain'

/**
 * Bump only for a change existing records cannot survive by defaulting alone
 * (a renamed or repurposed field). Purely additive fields do NOT need a bump:
 * the tolerant reader in `read.ts` defaults them in and keeps unknown fields.
 */
export const SCHEMA_VERSION = 1

export const STORAGE_KEY = 'bracketeer.store'

/** What actually sits in localStorage. */
export interface StoredEnvelope {
  schema_version: number
  players: Player[]
  tournaments: Tournament[]
  matches: Match[]
}

export interface AppData {
  players: Player[]
  tournaments: Tournament[]
  matches: Match[]
}

export const emptyData = (): AppData => ({ players: [], tournaments: [], matches: [] })
