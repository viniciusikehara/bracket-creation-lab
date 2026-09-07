import { newTournamentId, type PlayerId, type TournamentId } from './ids'

export const TOURNAMENT_STATUSES = ['draft', 'in_progress', 'finished'] as const
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number]

export const SEEDING_MODES = ['random', 'manual'] as const
export type SeedingMode = (typeof SEEDING_MODES)[number]

export interface Tournament {
  id: TournamentId
  name: string
  /** Free text: "Ping-pong", "FIFA", "Foosball", whatever the office plays. */
  game_type: string
  status: TournamentStatus
  seeding_mode: SeedingMode
  created_at: string
  /** Set only once the final match resolves. */
  champion_id: PlayerId | null
  /**
   * Players entered into this tournament, in seed order (seed 1 first).
   * Ids reference the shared player store, so a rename stays consistent everywhere.
   */
  player_ids: PlayerId[]
}

export interface NewTournament {
  name: string
  game_type?: string
  seeding_mode?: SeedingMode
  player_ids?: PlayerId[]
}

export function createTournament(input: NewTournament, now: Date = new Date()): Tournament {
  const name = input.name.trim()
  if (name === '') throw new Error('Tournament name is required')
  return {
    id: newTournamentId(),
    name,
    game_type: (input.game_type ?? '').trim(),
    status: 'draft',
    seeding_mode: input.seeding_mode ?? 'random',
    created_at: now.toISOString(),
    champion_id: null,
    player_ids: input.player_ids ?? [],
  }
}
