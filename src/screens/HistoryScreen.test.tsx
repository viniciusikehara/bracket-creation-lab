import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../App'
import type { StorageLike } from '../persistence'
import { Store, StoreProvider } from '../store'
import { ThemeProvider } from '../theme'

function fakeStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

/**
 * One finished tournament with a real two-round bracket, plus a draft and an
 * in-progress one that History must ignore.
 */
function seed() {
  const store = new Store(fakeStorage())
  const ana = store.addPlayer({ name: 'Ana' })
  const bruno = store.addPlayer({ name: 'Bruno' })
  const carla = store.addPlayer({ name: 'Carla' })

  const finished = store.addTournament({
    name: 'Spring Cup',
    game_type: 'Ping-pong',
    player_ids: [ana.id, bruno.id, carla.id],
  })
  const final = store.addMatch({ tournament_id: finished.id, round: 2, position_in_round: 0 })
  const semiA = store.addMatch({
    tournament_id: finished.id,
    round: 1,
    position_in_round: 0,
    player_a: bruno.id,
    player_b: carla.id,
    next_match_id: final.id,
  })
  store.updateMatch(semiA.id, { score_a: 3, score_b: 1, winner_id: bruno.id })
  // Ana is the top seed and got the bye, so her semi has one side only.
  const semiB = store.addMatch({
    tournament_id: finished.id,
    round: 1,
    position_in_round: 1,
    player_a: ana.id,
    next_match_id: final.id,
  })
  store.updateMatch(semiB.id, { score_a: 1, score_b: null, winner_id: ana.id })
  store.updateMatch(final.id, { player_a: bruno.id, player_b: ana.id, score_a: 2, score_b: 3, winner_id: ana.id })
  store.updateTournament(finished.id, { status: 'finished', champion_id: ana.id })

  store.addTournament({ name: 'Autumn Sketch', player_ids: [ana.id] })
  const running = store.addTournament({ name: 'Office League', player_ids: [ana.id, bruno.id] })
  store.updateTournament(running.id, { status: 'in_progress' })

  return { store, finished, ana, bruno, carla }
}

function renderAt(store: Store, path: string) {
  return render(
    <ThemeProvider>
      <StoreProvider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </StoreProvider>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('History list', () => {
  it('lists a finished tournament with its champion', () => {
    const { store } = seed()
    renderAt(store, '/history')

    const row = screen.getByRole('link', { name: 'Spring Cup' }).closest('li') as HTMLElement
    expect(within(row).getByText(/Ana/)).toBeDefined()
    expect(within(row).getByText(/Ping-pong/)).toBeDefined()
  })

  it('leaves draft and in-progress tournaments out', () => {
    const { store } = seed()
    renderAt(store, '/history')

    expect(screen.queryByText('Autumn Sketch')).toBeNull()
    expect(screen.queryByText('Office League')).toBeNull()
  })

  it('says nothing has finished yet rather than that there is nothing at all', () => {
    const store = new Store(fakeStorage())
    const ana = store.addPlayer({ name: 'Ana' })
    const running = store.addTournament({ name: 'Office League', player_ids: [ana.id] })
    store.updateTournament(running.id, { status: 'in_progress' })

    renderAt(store, '/history')

    expect(screen.getByText(/no tournament has finished yet/i)).toBeDefined()
  })

  it('opens a tournament from the list', async () => {
    const user = userEvent.setup()
    const { store } = seed()
    renderAt(store, '/history')

    await user.click(screen.getByRole('link', { name: 'Spring Cup' }))

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Spring Cup')
  })
})

describe('History detail, read-only', () => {
  it('renders the full bracket with its results', () => {
    const { store, finished } = seed()
    renderAt(store, `/history/${finished.id}`)

    // Both rounds, named the way people talk about them.
    expect(screen.getByRole('heading', { name: 'Semi-finals' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Final' })).toBeDefined()

    // The final: Bruno 2 – Ana 3, and the winner is the one emphasised.
    const finalMatch = screen.getByRole('heading', { name: 'Final' }).parentElement as HTMLElement
    expect(within(finalMatch).getByText('Bruno')).toBeDefined()
    expect(within(finalMatch).getByText('2')).toBeDefined()
    expect(within(finalMatch).getByText('3')).toBeDefined()
    const winnerSide = within(finalMatch).getByText('Ana').closest('.match__side') as HTMLElement
    expect(winnerSide.className).toContain('match__side--winner')
  })

  it('shows the champion and marks the screen read-only', () => {
    const { store, finished } = seed()
    const { container } = renderAt(store, `/history/${finished.id}`)

    // Scoped to the banner: 'Champion' is also a nav label and 'Ana' also
    // appears inside the bracket.
    const banner = within(container.querySelector('.champion-banner') as HTMLElement)
    expect(banner.getByText('Champion')).toBeDefined()
    expect(banner.getByText('Ana')).toBeDefined()
    expect(banner.getByText('Read-only')).toBeDefined()
  })

  it('offers no way to edit a result: no match action, no score field', () => {
    const { store, finished } = seed()
    const { container } = renderAt(store, `/history/${finished.id}`)

    const bracket = container.querySelector('.bracket') as HTMLElement
    expect(bracket).not.toBeNull()
    expect(bracket.querySelectorAll('button, input, select, textarea, a, [contenteditable]')).toHaveLength(0)
    expect(bracket.className).toContain('bracket--read-only')

    // And nothing outside the bracket smuggles an action in either: the only
    // buttons on the screen belong to the shell (the theme toggle).
    const main = container.querySelector('.shell__main') as HTMLElement
    expect(within(main).queryAllByRole('button')).toHaveLength(0)
  })

  it('a bye slot reads as a bye, not as a missing player', () => {
    const { store, finished } = seed()
    renderAt(store, `/history/${finished.id}`)

    expect(screen.getByText('Bye')).toBeDefined()
  })

  it('says so when the tournament is gone', () => {
    const { store } = seed()
    renderAt(store, '/history/does-not-exist')

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Tournament not found')
    expect(screen.getByRole('link', { name: /back to history/i })).toBeDefined()
  })
})
