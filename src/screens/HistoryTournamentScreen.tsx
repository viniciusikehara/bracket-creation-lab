import { Link, useParams } from 'react-router-dom'
import { BracketView } from '../bracket'
import { asTournamentId, canRecordResults, type Tournament } from '../domain'
import { championOf, roundsOfTournament, tournamentById, useAppData } from '../store'
import { formatTournamentDate } from './formatDate'

/**
 * A past tournament, reopened. Read-only by construction: the bracket is
 * rendered without a select handler, so there is no control anywhere on this
 * screen that could write a result — no match panel, no score field, no button.
 */
export function HistoryTournamentScreen() {
  const data = useAppData()
  const { tournamentId = '' } = useParams()
  const tournament = tournamentById(data, asTournamentId(tournamentId))

  if (tournament === undefined) {
    return (
      <section>
        <h1>Tournament not found</h1>
        <p className="muted">It may have been deleted.</p>
        <div className="card">
          <Link to="/history">Back to History</Link>
        </div>
      </section>
    )
  }

  const champion = championOf(data, tournament)
  const rounds = roundsOfTournament(data, tournament.id)

  return (
    <section>
      <p className="backlink">
        <Link to="/history">← History</Link>
      </p>

      <h1>{tournament.name}</h1>
      <p className="muted">
        {[tournament.game_type, formatTournamentDate(tournament.created_at), entrantsLabel(tournament)]
          .filter((part) => part !== '')
          .join(' · ')}
      </p>

      <div className="card stack-cards">
        <div className="champion-banner">
          <span className="champion-banner__trophy" aria-hidden="true">
            🏆
          </span>
          <span>
            <span className="champion-banner__label">Champion</span>
            <strong className="champion-banner__name">{champion ? champion.name : 'No champion recorded'}</strong>
          </span>
          <span className="badge">Read-only</span>
        </div>

        {/*
          Defence in depth: the screen never passes a handler, and the domain
          predicate agrees that a tournament in this state is not editable. If a
          future change ever makes this screen editable by accident, this note
          is where the contradiction shows up.
        */}
        {canRecordResults(tournament) ? (
          <p className="muted">
            This tournament is still in progress — results are recorded on the Bracket screen. Shown here as it
            stands, without edits.
          </p>
        ) : null}

        <BracketView data={data} rounds={rounds} emptyMessage="No bracket was generated for this tournament." />
      </div>
    </section>
  )
}

function entrantsLabel(tournament: Tournament): string {
  const count = tournament.player_ids.length
  if (count === 0) return ''
  return `${count} player${count === 1 ? '' : 's'}`
}
