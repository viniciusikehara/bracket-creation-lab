import { newMatchId, type MatchId, type PlayerId, type TournamentId } from './ids'

export interface Match {
  id: MatchId
  tournament_id: TournamentId
  /** 1 = first round; the final has the highest round number. */
  round: number
  /** 0-based slot within the round, top to bottom as drawn. */
  position_in_round: number
  /** null while the slot is still waiting on an earlier match, or on a bye. */
  player_a: PlayerId | null
  player_b: PlayerId | null
  score_a: number | null
  score_b: number | null
  winner_id: PlayerId | null
  /** Where the winner advances to; null for the final. */
  next_match_id: MatchId | null
}

export interface NewMatch {
  tournament_id: TournamentId
  round: number
  position_in_round: number
  player_a?: PlayerId | null
  player_b?: PlayerId | null
  next_match_id?: MatchId | null
}

export function createMatch(input: NewMatch): Match {
  return {
    id: newMatchId(),
    tournament_id: input.tournament_id,
    round: input.round,
    position_in_round: input.position_in_round,
    player_a: input.player_a ?? null,
    player_b: input.player_b ?? null,
    score_a: null,
    score_b: null,
    winner_id: null,
    next_match_id: input.next_match_id ?? null,
  }
}

/** True once the match has a decided winner. */
export const isPlayed = (match: Match): boolean => match.winner_id !== null
