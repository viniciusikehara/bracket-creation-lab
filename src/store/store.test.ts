import { beforeEach, describe, expect, it } from 'vitest'
import { asMatchId } from '../domain'
import { STORAGE_KEY, type StorageLike } from '../persistence'
import { matchesOfTournament, roundsOfTournament, Store, tournamentsNewestFirst } from './store'

function fakeStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

let storage: StorageLike

beforeEach(() => {
  storage = fakeStorage()
})

describe('Store persistence', () => {
  it('a second Store over the same storage sees what the first wrote (the reload case)', () => {
    const first = new Store(storage)
    const player = first.addPlayer({ name: 'Ana' })
    const tournament = first.addTournament({ name: 'Cup', game_type: 'FIFA', player_ids: [player.id] })
    const match = first.addMatch({ tournament_id: tournament.id, round: 1, position_in_round: 0, player_a: player.id })
    first.updateMatch(match.id, { score_a: 3, score_b: 1, winner_id: player.id })

    const reloaded = new Store(storage).getSnapshot()

    expect(reloaded.players).toHaveLength(1)
    expect(reloaded.players[0].name).toBe('Ana')
    expect(reloaded.tournaments[0].name).toBe('Cup')
    expect(reloaded.matches[0]).toMatchObject({ score_a: 3, score_b: 1, winner_id: player.id })
  })

  it('notifies subscribers on every mutation', () => {
    const store = new Store(storage)
    let calls = 0
    const unsubscribe = store.subscribe(() => {
      calls += 1
    })
    store.addPlayer({ name: 'Ana' })
    store.addPlayer({ name: 'Bo' })
    unsubscribe()
    store.addPlayer({ name: 'Cy' })
    expect(calls).toBe(2)
  })

  it('exposes a new snapshot object per mutation so React sees the change', () => {
    const store = new Store(storage)
    const before = store.getSnapshot()
    store.addPlayer({ name: 'Ana' })
    expect(store.getSnapshot()).not.toBe(before)
  })

  it('rejects a blank player name', () => {
    const store = new Store(storage)
    expect(() => store.addPlayer({ name: '   ' })).toThrow()
  })

  it('clears references when a player is removed', () => {
    const store = new Store(storage)
    const ana = store.addPlayer({ name: 'Ana' })
    const bo = store.addPlayer({ name: 'Bo' })
    const tournament = store.addTournament({ name: 'Cup', player_ids: [ana.id, bo.id] })
    const match = store.addMatch({
      tournament_id: tournament.id,
      round: 1,
      position_in_round: 0,
      player_a: ana.id,
      player_b: bo.id,
    })
    store.updateMatch(match.id, { winner_id: ana.id })
    store.updateTournament(tournament.id, { champion_id: ana.id, status: 'finished' })

    store.removePlayer(ana.id)
    const data = store.getSnapshot()

    expect(data.players.map((p) => p.id)).toEqual([bo.id])
    expect(data.tournaments[0].player_ids).toEqual([bo.id])
    expect(data.tournaments[0].champion_id).toBeNull()
    expect(data.matches[0].player_a).toBeNull()
    expect(data.matches[0].winner_id).toBeNull()
    expect(data.matches[0].player_b).toBe(bo.id)
  })

  it('removes a tournament together with its matches, leaving other brackets alone', () => {
    const store = new Store(storage)
    const doomed = store.addTournament({ name: 'A' })
    const kept = store.addTournament({ name: 'B' })
    store.addMatch({ tournament_id: doomed.id, round: 1, position_in_round: 0 })
    store.addMatch({ tournament_id: kept.id, round: 1, position_in_round: 0 })

    store.removeTournament(doomed.id)

    expect(store.getSnapshot().tournaments.map((t) => t.id)).toEqual([kept.id])
    expect(store.getSnapshot().matches).toHaveLength(1)
    expect(store.getSnapshot().matches[0].tournament_id).toBe(kept.id)
  })

  it('replaces a bracket in one commit without touching other tournaments', () => {
    const store = new Store(storage)
    const a = store.addTournament({ name: 'A' })
    const b = store.addTournament({ name: 'B' })
    store.addMatch({ tournament_id: a.id, round: 1, position_in_round: 0 })
    const keep = store.addMatch({ tournament_id: b.id, round: 1, position_in_round: 0 })

    store.replaceMatchesForTournament(a.id, [
      { ...keep, id: asMatchId('x1'), tournament_id: a.id, round: 1, position_in_round: 0 },
      { ...keep, id: asMatchId('x2'), tournament_id: a.id, round: 2, position_in_round: 0 },
    ])

    expect(matchesOfTournament(store.getSnapshot(), a.id).map((m) => m.id)).toEqual(['x1', 'x2'])
    expect(matchesOfTournament(store.getSnapshot(), b.id).map((m) => m.id)).toEqual([keep.id])
  })

  it('reload() picks up a write made by another tab', () => {
    const store = new Store(storage)
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schema_version: 1, players: [{ id: 'p9', name: 'Zed' }], tournaments: [], matches: [] }),
    )
    store.reload()
    expect(store.getSnapshot().players[0].name).toBe('Zed')
  })
})

describe('queries', () => {
  it('groups matches into rounds in draw order', () => {
    const store = new Store(storage)
    const t = store.addTournament({ name: 'Cup' })
    store.addMatch({ tournament_id: t.id, round: 2, position_in_round: 0 })
    store.addMatch({ tournament_id: t.id, round: 1, position_in_round: 1 })
    store.addMatch({ tournament_id: t.id, round: 1, position_in_round: 0 })

    const rounds = roundsOfTournament(store.getSnapshot(), t.id)

    expect(rounds).toHaveLength(2)
    expect(rounds[0].map((m) => m.position_in_round)).toEqual([0, 1])
    expect(rounds[1]).toHaveLength(1)
  })

  it('lists tournaments newest first', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schema_version: 1,
        players: [],
        tournaments: [
          { id: 't1', name: 'Older', created_at: '2026-01-01T00:00:00.000Z' },
          { id: 't2', name: 'Newer', created_at: '2026-09-01T00:00:00.000Z' },
        ],
        matches: [],
      }),
    )
    const store = new Store(storage)

    expect(tournamentsNewestFirst(store.getSnapshot()).map((t) => t.name)).toEqual(['Newer', 'Older'])
  })
})
