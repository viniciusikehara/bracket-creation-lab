import { newPlayerId, type PlayerId } from './ids'

export interface Player {
  id: PlayerId
  /** Required, trimmed, non-empty. */
  name: string
  /** Optional: a URL or a data: URI. */
  avatar?: string
  /** ISO-8601 timestamp. */
  created_at: string
}

export interface NewPlayer {
  name: string
  avatar?: string
}

export function createPlayer(input: NewPlayer, now: Date = new Date()): Player {
  const name = input.name.trim()
  if (name === '') throw new Error('Player name is required')
  const player: Player = {
    id: newPlayerId(),
    name,
    created_at: now.toISOString(),
  }
  if (input.avatar) player.avatar = input.avatar
  return player
}
