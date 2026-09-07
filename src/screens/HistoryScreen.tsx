import { Link } from 'react-router-dom'
import { championOf, finishedTournamentsNewestFirst, tournamentsNewestFirst, useAppData } from '../store'
import { formatTournamentDate } from './formatDate'

/**
 * Finished tournaments only. A draft has no result to look back on and a
 * running one still belongs to the Bracket screen, so History stays what its
 * name promises: what is over.
 */
export function HistoryScreen() {
  const data = useAppData()
  const finished = finishedTournamentsNewestFirst(data)

  return (
    <section>
      <h1>History</h1>
      <p className="muted">Past tournaments and their champions. Open one to revisit the bracket.</p>
      <div className="card">
        {finished.length === 0 ? (
          <EmptyState hasAnyTournament={tournamentsNewestFirst(data).length > 0} />
        ) : (
          <ul className="list">
            {finished.map((tournament) => {
              const champion = championOf(data, tournament)
              return (
                <li key={tournament.id} className="list__row history-row">
                  <span className="history-row__main">
                    <Link to={`/history/${tournament.id}`} className="history-row__link">
                      {tournament.name}
                    </Link>
                    <span className="muted history-row__meta">
                      {[tournament.game_type, formatTournamentDate(tournament.created_at)]
                        .filter((part) => part !== '')
                        .join(' · ')}
                    </span>
                  </span>
                  <span className="history-row__champion">
                    <span aria-hidden="true">🏆</span>{' '}
                    {champion ? champion.name : <span className="muted">No champion recorded</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function EmptyState({ hasAnyTournament }: { hasAnyTournament: boolean }) {
  // Distinguishing the two cases matters: a board full of running tournaments
  // showing "no tournaments yet" reads as lost data.
  return hasAnyTournament ? (
    <p className="muted">No tournament has finished yet. They show up here once a champion is decided.</p>
  ) : (
    <p className="muted">No tournaments yet.</p>
  )
}
