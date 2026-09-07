import {
  asMatchId,
  asPlayerId,
  asTournamentId,
  SEEDING_MODES,
  TOURNAMENT_STATUSES,
  type Match,
  type Player,
  type SeedingMode,
  type Tournament,
  type TournamentStatus,
} from '../domain'
import { emptyData, type AppData } from './schema'

/**
 * Tolerant reader.
 *
 * Every record is spread through unchanged and only the fields this version
 * knows about are normalised on top. Two consequences we rely on:
 *   - a record written by a NEWER version keeps its unknown fields (they survive
 *     a read/write round-trip in an older tab instead of being silently dropped);
 *   - a record written by an OLDER version gains today's fields by defaulting,
 *     so adding `third_place_match_id`, `elo_before`, `group_id`, ... needs no
 *     migration of records already on disk.
 */

type Raw = Record<string, unknown>

const isObject = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const nullableStr = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const nullableNum = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback

const isoOr = (value: unknown, fallback: string): string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback

const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []

const EPOCH = new Date(0).toISOString()

function readPlayer(raw: unknown): Player | null {
  if (!isObject(raw)) return null
  const id = str(raw.id)
  const name = str(raw.name).trim()
  if (id === '' || name === '') return null
  const player: Player = {
    ...(raw as object),
    id: asPlayerId(id),
    name,
    created_at: isoOr(raw.created_at, EPOCH),
  } as Player
  const avatar = nullableStr(raw.avatar)
  if (avatar) player.avatar = avatar
  else delete player.avatar
  return player
}

function readTournament(raw: unknown): Tournament | null {
  if (!isObject(raw)) return null
  const id = str(raw.id)
  const name = str(raw.name).trim()
  if (id === '' || name === '') return null
  const champion = nullableStr(raw.champion_id)
  return {
    ...(raw as object),
    id: asTournamentId(id),
    name,
    game_type: str(raw.game_type),
    status: oneOf<TournamentStatus>(raw.status, TOURNAMENT_STATUSES, 'draft'),
    seeding_mode: oneOf<SeedingMode>(raw.seeding_mode, SEEDING_MODES, 'random'),
    created_at: isoOr(raw.created_at, EPOCH),
    champion_id: champion ? asPlayerId(champion) : null,
    player_ids: strArray(raw.player_ids).map(asPlayerId),
  } as Tournament
}

function readMatch(raw: unknown): Match | null {
  if (!isObject(raw)) return null
  const id = str(raw.id)
  const tournamentId = str(raw.tournament_id)
  if (id === '' || tournamentId === '') return null
  const playerA = nullableStr(raw.player_a)
  const playerB = nullableStr(raw.player_b)
  const winner = nullableStr(raw.winner_id)
  const next = nullableStr(raw.next_match_id)
  return {
    ...(raw as object),
    id: asMatchId(id),
    tournament_id: asTournamentId(tournamentId),
    round: num(raw.round, 1),
    position_in_round: num(raw.position_in_round, 0),
    player_a: playerA ? asPlayerId(playerA) : null,
    player_b: playerB ? asPlayerId(playerB) : null,
    score_a: nullableNum(raw.score_a),
    score_b: nullableNum(raw.score_b),
    winner_id: winner ? asPlayerId(winner) : null,
    next_match_id: next ? asMatchId(next) : null,
  } as Match
}

function readList<T>(value: unknown, read: (raw: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return []
  return value.map(read).filter((item): item is T => item !== null)
}

/** Parse a raw envelope (already migrated) into app data, dropping only unreadable records. */
export function readData(raw: unknown): AppData {
  if (!isObject(raw)) return emptyData()
  return {
    players: readList(raw.players, readPlayer),
    tournaments: readList(raw.tournaments, readTournament),
    matches: readList(raw.matches, readMatch),
  }
}
