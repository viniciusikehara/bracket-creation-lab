import type { ReactNode } from 'react'
import { isPlayed, type Match, type MatchId, type PlayerId } from '../domain'
import { playerById } from '../store'
import type { AppData } from '../persistence'
import { roundLabel } from './roundLabel'
import './BracketView.css'

/**
 * The bracket, drawn as one column per round.
 *
 * Interactivity is opt-in: without `onSelectMatch` this renders plain,
 * non-focusable elements — no buttons, no inputs, nothing that could write a
 * result. That is what makes the History screen's read-only promise structural
 * rather than a matter of styling, and it is why the live bracket screen can
 * reuse this same component by passing a handler.
 */
export function BracketView({
  data,
  rounds,
  onSelectMatch,
  emptyMessage = 'This tournament has no bracket.',
}: {
  data: AppData
  rounds: Match[][]
  onSelectMatch?: (id: MatchId) => void
  emptyMessage?: string
}) {
  if (rounds.length === 0) return <p className="muted">{emptyMessage}</p>

  const readOnly = onSelectMatch === undefined

  return (
    // The bracket is the one genuinely wide thing in the app: it scrolls inside
    // its own container so a phone scrolls the bracket, never the page.
    <div className="scroll-x">
      <ol className={readOnly ? 'bracket bracket--read-only' : 'bracket'}>
        {rounds.map((matches, index) => (
          <li key={index} className="bracket__round">
            <h2 className="bracket__round-title">{roundLabel(index + 1, rounds.length)}</h2>
            <ol className="bracket__matches">
              {matches.map((match) => (
                <li key={match.id} className="bracket__match-slot">
                  <MatchCard data={data} match={match} onSelect={onSelectMatch} />
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  )
}

function MatchCard({
  data,
  match,
  onSelect,
}: {
  data: AppData
  match: Match
  onSelect?: (id: MatchId) => void
}) {
  const body: ReactNode = (
    <>
      <Side data={data} match={match} side="a" />
      <Side data={data} match={match} side="b" />
    </>
  )

  if (onSelect === undefined) {
    return <div className="match">{body}</div>
  }

  return (
    <button type="button" className="match match--actionable" onClick={() => onSelect(match.id)}>
      {body}
    </button>
  )
}

function Side({ data, match, side }: { data: AppData; match: Match; side: 'a' | 'b' }) {
  const playerId: PlayerId | null = side === 'a' ? match.player_a : match.player_b
  const score = side === 'a' ? match.score_a : match.score_b
  const other = side === 'a' ? match.player_b : match.player_a
  const player = playerById(data, playerId)
  const won = playerId !== null && match.winner_id === playerId

  // An empty slot means two different things: a bye (the opponent walked
  // through) or a place still waiting on an earlier round.
  const emptyLabel = other !== null && isPlayed(match) ? 'Bye' : 'TBD'

  return (
    <span className={won ? 'match__side match__side--winner' : 'match__side'}>
      <span className="match__name">{player?.name ?? <span className="muted">{emptyLabel}</span>}</span>
      <span className="match__score">{score ?? '–'}</span>
    </span>
  )
}
