import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { ROUTES } from './shell'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  // jsdom has no matchMedia; the theme provider asks it for the OS preference.
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

describe('app shell', () => {
  it('links to all five screens', () => {
    render(<App />)
    for (const route of ROUTES) {
      expect(screen.getAllByRole('link', { name: new RegExp(route.shortLabel, 'i') }).length).toBeGreaterThan(0)
    }
  })

  it('lands on Players by default', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Players')
  })

  it('keeps a created player across a full remount (the reload case)', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await user.type(screen.getByPlaceholderText('e.g. Ana'), 'Ana')
    await user.click(screen.getByRole('button', { name: /add player/i }))
    expect(screen.getByText('Ana')).toBeDefined()

    first.unmount()
    render(<App />) // a fresh app over the same localStorage: what a reload does

    expect(screen.getByText('Ana')).toBeDefined()
  })

  it('applies the theme on <html> so it reaches every screen, and remembers it', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    expect(document.documentElement.dataset.theme).toBe('light')

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))
    expect(document.documentElement.dataset.theme).toBe('dark')

    // Navigating does not reset it...
    await user.click(screen.getAllByRole('link', { name: /history/i })[0])
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('History')
    expect(document.documentElement.dataset.theme).toBe('dark')

    // ...and neither does a reload.
    first.unmount()
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
