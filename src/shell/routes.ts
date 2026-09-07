/** The five screens of the app, in the order they appear in the nav. */
export interface RouteDef {
  path: string
  label: string
  /** Short label for the phone nav, where horizontal room is scarce. */
  shortLabel: string
  icon: string
}

export const ROUTES: RouteDef[] = [
  { path: '/players', label: 'Players', shortLabel: 'Players', icon: '👤' },
  { path: '/tournaments/new', label: 'New tournament', shortLabel: 'New', icon: '➕' },
  { path: '/bracket', label: 'Bracket', shortLabel: 'Bracket', icon: '🏓' },
  { path: '/champion', label: 'Champion', shortLabel: 'Champion', icon: '🏆' },
  { path: '/history', label: 'History', shortLabel: 'History', icon: '🕑' },
]

export const DEFAULT_ROUTE = '/players'
