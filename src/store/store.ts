import {
  createMatch,
  createPlayer,
  createTournament,
  isFinished,
  type Match,
  type MatchId,
  type NewMatch,
  type NewPlayer,
  type NewTournament,
  type Player,
  type PlayerId,
  type Tournament,
  type TournamentId,
} from '../domain'
import { defaultStorage, load, save, type AppData, type StorageLike } from '../persistence'

type Listener = () => void

/**
 * A tiny external store: one immutable AppData snapshot, written through to
 * storage on every mutation. React subscribes via useSyncExternalStore, so a
 * reload simply re-reads the same snapshot from disk.
 */
export class Store {
  private data: AppData
  private listeners = new Set<Listener>()

  constructor(private readonly storage: StorageLike = defaultStorage()) {
    this.data = load(storage)
  }

  getSnapshot = (): AppData => this.data

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => void this.listeners.delete(listener)
  }

  private commit(next: AppData): void {
    this.data = next
    save(this.storage, next)
    this.listeners.forEach((listener) => listener())
  }

  /** Re-read from storage — used when another tab writes to the same key. */
  reload = (): void => {
    this.data = load(this.storage)
    this.listeners.forEach((listener) => listener())
  }

  // --- players -----------------------------------------------------------

  addPlayer = (input: NewPlayer): Player => {
    const player = createPlayer(input)
    this.commit({ ...this.data, players: [...this.data.players, player] })
    return player
  }

  updatePlayer = (id: PlayerId, patch: Partial<Omit<Player, 'id' | 'created_at'>>): void => {
    this.commit({
      ...this.data,
      players: this.data.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })
  }

  /** Removes the player and clears every reference to them, so no screen renders a ghost. */
  removePlayer = (id: PlayerId): void => {
    this.commit({
      players: this.data.players.filter((p) => p.id !== id),
      tournaments: this.data.tournaments.map((t) =>
        t.player_ids.includes(id) || t.champion_id === id
          ? {
              ...t,
              player_ids: t.player_ids.filter((pid) => pid !== id),
              champion_id: t.champion_id === id ? null : t.champion_id,
            }
          : t,
      ),
      matches: this.data.matches.map((m) =>
        m.player_a === id || m.player_b === id || m.winner_id === id
          ? {
              ...m,
              player_a: m.player_a === id ? null : m.player_a,
              player_b: m.player_b === id ? null : m.player_b,
              winner_id: m.winner_id === id ? null : m.winner_id,
            }
          : m,
      ),
    })
  }

  // --- tournaments -------------------------------------------------------

  addTournament = (input: NewTournament): Tournament => {
    const tournament = createTournament(input)
    this.commit({ ...this.data, tournaments: [...this.data.tournaments, tournament] })
    return tournament
  }

  updateTournament = (id: TournamentId, patch: Partial<Omit<Tournament, 'id' | 'created_at'>>): void => {
    this.commit({
      ...this.data,
      tournaments: this.data.tournaments.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })
  }

  /** Drops the tournament together with its matches — matches never outlive their bracket. */
  removeTournament = (id: TournamentId): void => {
    this.commit({
      ...this.data,
      tournaments: this.data.tournaments.filter((t) => t.id !== id),
      matches: this.data.matches.filter((m) => m.tournament_id !== id),
    })
  }

  // --- matches -----------------------------------------------------------

  addMatch = (input: NewMatch): Match => {
    const match = createMatch(input)
    this.commit({ ...this.data, matches: [...this.data.matches, match] })
    return match
  }

  /** Writes a whole generated bracket in one commit (one storage write, one render). */
  replaceMatchesForTournament = (tournamentId: TournamentId, matches: Match[]): void => {
    this.commit({
      ...this.data,
      matches: [...this.data.matches.filter((m) => m.tournament_id !== tournamentId), ...matches],
    })
  }

  updateMatch = (id: MatchId, patch: Partial<Omit<Match, 'id' | 'tournament_id'>>): void => {
    this.commit({
      ...this.data,
      matches: this.data.matches.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })
  }
}

// --- queries (pure, so screens and tests share them) ----------------------

export const playerById = (data: AppData, id: PlayerId | null): Player | undefined =>
  id === null ? undefined : data.players.find((p) => p.id === id)

export const tournamentById = (data: AppData, id: TournamentId | null): Tournament | undefined =>
  id === null ? undefined : data.tournaments.find((t) => t.id === id)

export const matchesOfTournament = (data: AppData, id: TournamentId): Match[] =>
  data.matches
    .filter((m) => m.tournament_id === id)
    .sort((a, b) => a.round - b.round || a.position_in_round - b.position_in_round)

/** Matches grouped by round, ascending — the shape the bracket view will draw. */
export const roundsOfTournament = (data: AppData, id: TournamentId): Match[][] => {
  const byRound = new Map<number, Match[]>()
  for (const match of matchesOfTournament(data, id)) {
    const round = byRound.get(match.round) ?? []
    round.push(match)
    byRound.set(match.round, round)
  }
  return [...byRound.keys()].sort((a, b) => a - b).map((round) => byRound.get(round) as Match[])
}

export const playersSortedByName = (data: AppData): Player[] =>
  [...data.players].sort((a, b) => a.name.localeCompare(b.name))

export const tournamentsNewestFirst = (data: AppData): Tournament[] =>
  [...data.tournaments].sort((a, b) => b.created_at.localeCompare(a.created_at))

/**
 * What the History screen lists: finished tournaments only, newest first.
 * Drafts and running tournaments are deliberately absent — they belong to the
 * creation and bracket screens, and History is a record of what is over.
 */
export const finishedTournamentsNewestFirst = (data: AppData): Tournament[] =>
  tournamentsNewestFirst(data).filter(isFinished)

/** The champion as a player record, or undefined if none is set (or they were deleted). */
export const championOf = (data: AppData, tournament: Tournament): Player | undefined =>
  playerById(data, tournament.champion_id)
