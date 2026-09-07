import { tournamentsNewestFirst, useAppData } from '../store'
import { ScreenStub } from './Placeholder'

export function NewTournamentScreen() {
  const data = useAppData()
  const count = tournamentsNewestFirst(data).length

  return (
    <ScreenStub
      title="New tournament"
      description="Pick the players, choose seeding, and generate the bracket."
    >
      <p className="muted">
        The creation form arrives with the tournament work order. {count} tournament{count === 1 ? '' : 's'} stored so
        far.
      </p>
    </ScreenStub>
  )
}
