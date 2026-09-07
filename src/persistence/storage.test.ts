import { describe, expect, it } from 'vitest'
import { createMatch, createPlayer, createTournament } from '../domain'
import { load, save, type StorageLike } from './storage'
import { SCHEMA_VERSION, STORAGE_KEY } from './schema'

function fakeStorage(seed?: string): StorageLike {
  const map = new Map<string, string>()
  if (seed !== undefined) map.set(STORAGE_KEY, seed)
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

describe('load / save', () => {
  it('round-trips players, tournaments and matches', () => {
    const storage = fakeStorage()
    const player = createPlayer({ name: 'Ana' })
    const tournament = createTournament({ name: 'Friday Ping-Pong', game_type: 'Ping-pong', player_ids: [player.id] })
    const match = createMatch({ tournament_id: tournament.id, round: 1, position_in_round: 0, player_a: player.id })

    save(storage, { players: [player], tournaments: [tournament], matches: [match] })
    const loaded = load(storage)

    expect(loaded.players).toEqual([player])
    expect(loaded.tournaments).toEqual([tournament])
    expect(loaded.matches).toEqual([match])
  })

  it('writes a versioned envelope', () => {
    const storage = fakeStorage()
    save(storage, { players: [], tournaments: [], matches: [] })
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) as string)
    expect(raw.schema_version).toBe(SCHEMA_VERSION)
  })

  it('returns empty data when nothing is stored', () => {
    expect(load(fakeStorage())).toEqual({ players: [], tournaments: [], matches: [] })
  })

  it('returns empty data instead of throwing on corrupt JSON', () => {
    expect(load(fakeStorage('{not json'))).toEqual({ players: [], tournaments: [], matches: [] })
  })

  it('survives an envelope whose collections are the wrong shape', () => {
    const storage = fakeStorage(JSON.stringify({ schema_version: 1, players: 'nope', tournaments: null }))
    expect(load(storage)).toEqual({ players: [], tournaments: [], matches: [] })
  })

  it('does not throw when the underlying storage refuses to write', () => {
    const readOnly: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    }
    expect(() => save(readOnly, { players: [], tournaments: [], matches: [] })).not.toThrow()
  })
})
