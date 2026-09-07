import { runMigrations } from './migrations'
import { readData } from './read'
import { emptyData, SCHEMA_VERSION, STORAGE_KEY, type AppData, type StoredEnvelope } from './schema'

/** The slice of the Storage API we need — swappable in tests and safe when unavailable. */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** localStorage throws in private-mode Safari and when the origin blocks storage. */
function safeLocalStorage(): StorageLike | null {
  try {
    const probe = '__bracketeer_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

/** In-memory stand-in so the app still runs (for this session) when storage is denied. */
function memoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

export function load(storage: StorageLike): AppData {
  let parsed: unknown
  try {
    const rawText = storage.getItem(STORAGE_KEY)
    if (rawText === null) return emptyData()
    parsed = JSON.parse(rawText)
  } catch {
    // Corrupt JSON: start clean rather than crashing the app on boot.
    return emptyData()
  }
  if (typeof parsed !== 'object' || parsed === null) return emptyData()
  const envelope = parsed as Record<string, unknown>
  const version = typeof envelope.schema_version === 'number' ? envelope.schema_version : 0
  const migrated = version < SCHEMA_VERSION ? runMigrations(envelope, version, SCHEMA_VERSION) : envelope
  return readData(migrated)
}

export function save(storage: StorageLike, data: AppData): void {
  const envelope: StoredEnvelope = {
    schema_version: SCHEMA_VERSION,
    players: data.players,
    tournaments: data.tournaments,
    matches: data.matches,
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Quota exceeded or storage revoked mid-session: keep the in-memory state usable.
  }
}

export const defaultStorage = (): StorageLike =>
  (typeof window !== 'undefined' ? safeLocalStorage() : null) ?? memoryStorage()
