import { describe, expect, it } from 'vitest'
import { readData } from './read'

describe('tolerant reader', () => {
  it('keeps fields written by a newer version of the app', () => {
    // A future release adds third_place_match_id / elo_before. Today's code must not eat them.
    const data = readData({
      tournaments: [
        { id: 't1', name: 'Cup', third_place_match_id: 'm9', format: 'double_elimination' },
      ],
      matches: [{ id: 'm1', tournament_id: 't1', round: 1, position_in_round: 0, elo_before: 1200 }],
    })

    expect(data.tournaments[0]).toMatchObject({ third_place_match_id: 'm9', format: 'double_elimination' })
    expect(data.matches[0]).toMatchObject({ elo_before: 1200 })
  })

  it('defaults fields missing from records written by an older version', () => {
    // A record from before seeding_mode / player_ids / champion_id existed.
    const data = readData({ tournaments: [{ id: 't1', name: 'Old Cup', created_at: '2026-01-01T00:00:00.000Z' }] })

    expect(data.tournaments[0]).toMatchObject({
      id: 't1',
      name: 'Old Cup',
      game_type: '',
      status: 'draft',
      seeding_mode: 'random',
      champion_id: null,
      player_ids: [],
    })
  })

  it('defaults match scores and links that were never set', () => {
    const data = readData({ matches: [{ id: 'm1', tournament_id: 't1' }] })
    expect(data.matches[0]).toMatchObject({
      round: 1,
      position_in_round: 0,
      player_a: null,
      player_b: null,
      score_a: null,
      score_b: null,
      winner_id: null,
      next_match_id: null,
    })
  })

  it('falls back to a valid value when an enum is unrecognised', () => {
    const data = readData({ tournaments: [{ id: 't1', name: 'X', status: 'group_stage', seeding_mode: 'snake' }] })
    expect(data.tournaments[0].status).toBe('draft')
    expect(data.tournaments[0].seeding_mode).toBe('random')
  })

  it('drops only the records that have no usable identity', () => {
    const data = readData({
      players: [{ id: 'p1', name: 'Ana' }, { name: 'no id' }, { id: 'p3', name: '   ' }, null, 'junk'],
    })
    expect(data.players.map((p) => p.id)).toEqual(['p1'])
  })

  it('keeps a zero score rather than treating it as missing', () => {
    const data = readData({ matches: [{ id: 'm1', tournament_id: 't1', score_a: 0, score_b: 3 }] })
    expect(data.matches[0].score_a).toBe(0)
    expect(data.matches[0].score_b).toBe(3)
  })
})
