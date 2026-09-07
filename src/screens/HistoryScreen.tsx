import { tournamentsNewestFirst, useAppData } from '../store'
import { ScreenStub } from './Placeholder'

export function HistoryScreen() {
  const tournaments = tournamentsNewestFirst(useAppData())

  return (
    <ScreenStub title="History" description="Every tournament played, newest first.">
      {tournaments.length === 0 ? (
        <p className="muted">No tournaments yet.</p>
      ) : (
        <ul className="list">
          {tournaments.map((tournament) => (
            <li key={tournament.id} className="list__row">
              <span>{tournament.name}</span>
              <span className="muted">{tournament.status}</span>
            </li>
          ))}
        </ul>
      )}
    </ScreenStub>
  )
}
