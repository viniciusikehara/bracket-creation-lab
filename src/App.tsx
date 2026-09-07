import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell, DEFAULT_ROUTE } from './shell'
import {
  BracketScreen,
  ChampionScreen,
  HistoryScreen,
  HistoryTournamentScreen,
  NewTournamentScreen,
  PlayersScreen,
} from './screens'
import { StoreProvider } from './store'
import { ThemeProvider } from './theme'

export function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  )
}

/**
 * The route table, separate from the router so tests can mount it under a
 * MemoryRouter at any path instead of driving the URL bar.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
        <Route path="/players" element={<PlayersScreen />} />
        <Route path="/tournaments/new" element={<NewTournamentScreen />} />
        <Route path="/bracket" element={<BracketScreen />} />
        <Route path="/champion" element={<ChampionScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        {/* Not in the nav: reached by opening a row in the History list. */}
        <Route path="/history/:tournamentId" element={<HistoryTournamentScreen />} />
        <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
      </Route>
    </Routes>
  )
}
