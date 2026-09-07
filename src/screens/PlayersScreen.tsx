import { useState } from 'react'
import { playersSortedByName, useAppData, useStore } from '../store'
import { ScreenStub } from './Placeholder'

/**
 * Minimal but real: creating a player here writes through to storage, which is
 * what acceptance criterion 1 ("create, reload, still there") is checked on.
 * The full screen (avatars, editing, validation UI) comes with its own order.
 */
export function PlayersScreen() {
  const store = useStore()
  const data = useAppData()
  const [name, setName] = useState('')
  const players = playersSortedByName(data)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (name.trim() === '') return
    store.addPlayer({ name })
    setName('')
  }

  return (
    <ScreenStub title="Players" description="Everyone who can be entered into a tournament.">
      <form className="stack" onSubmit={submit}>
        <label className="field">
          <span>Player name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ana" />
        </label>
        <button type="submit" className="btn btn--primary">
          Add player
        </button>
      </form>

      {players.length === 0 ? (
        <p className="muted">No players yet.</p>
      ) : (
        <ul className="list">
          {players.map((player) => (
            <li key={player.id} className="list__row">
              <span>{player.name}</span>
              <button type="button" className="btn btn--ghost" onClick={() => store.removePlayer(player.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </ScreenStub>
  )
}
