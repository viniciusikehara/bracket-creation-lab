import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell, DEFAULT_ROUTE } from './shell'
import {
  BracketScreen,
  ChampionScreen,
  HistoryScreen,
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
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
              <Route path="/players" element={<PlayersScreen />} />
              <Route path="/tournaments/new" element={<NewTournamentScreen />} />
              <Route path="/bracket" element={<BracketScreen />} />
              <Route path="/champion" element={<ChampionScreen />} />
              <Route path="/history" element={<HistoryScreen />} />
              <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  )
}
