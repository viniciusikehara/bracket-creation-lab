/** Branded id types: a TournamentId can never be passed where a PlayerId is expected. */
export type PlayerId = string & { readonly __brand: 'PlayerId' }
export type TournamentId = string & { readonly __brand: 'TournamentId' }
export type MatchId = string & { readonly __brand: 'MatchId' }

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for non-secure contexts (plain http on a LAN address, older mobile browsers).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const newPlayerId = (): PlayerId => uuid() as PlayerId
export const newTournamentId = (): TournamentId => uuid() as TournamentId
export const newMatchId = (): MatchId => uuid() as MatchId

/** Cast a stored/user-supplied string back into a branded id. */
export const asPlayerId = (value: string): PlayerId => value as PlayerId
export const asTournamentId = (value: string): TournamentId => value as TournamentId
export const asMatchId = (value: string): MatchId => value as MatchId
