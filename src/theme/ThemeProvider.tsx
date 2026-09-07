import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]
export type ResolvedTheme = 'light' | 'dark'

const THEME_KEY = 'bracketeer.theme'

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored !== null && (THEME_PREFERENCES as readonly string[]).includes(stored)) {
      return stored as ThemePreference
    }
  } catch {
    // storage denied: fall through to the OS preference
  }
  return 'system'
}

const systemTheme = (): ResolvedTheme =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

interface ThemeContextValue {
  preference: ThemePreference
  theme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  /** Flips to the opposite of what is on screen right now. */
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference)
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)

  // Follow the OS while the preference is "system".
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const theme: ResolvedTheme = preference === 'system' ? system : preference

  // One attribute on <html> drives every token, so the choice lands on every screen at once.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
  }, [theme])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    try {
      window.localStorage.setItem(THEME_KEY, next)
    } catch {
      // storage denied: the choice still applies for this session
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      theme,
      setPreference,
      toggle: () => setPreference(theme === 'dark' ? 'light' : 'dark'),
    }),
    [preference, theme, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (value === null) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
