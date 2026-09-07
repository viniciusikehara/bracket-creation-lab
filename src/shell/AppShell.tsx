import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from './routes'
import { ThemeToggle } from './ThemeToggle'
import './AppShell.css'

/**
 * The frame every screen renders inside: header (brand + desktop nav + theme
 * toggle), a width-capped content column, and a bottom nav that takes over on
 * phones. Screens render into <Outlet />.
 */
export function AppShell() {
  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__header-inner">
          <span className="shell__brand">
            <span aria-hidden="true">🏆</span> Bracketeer
          </span>

          <nav className="shell__nav shell__nav--top" aria-label="Main">
            {ROUTES.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) => (isActive ? 'shell__link active' : 'shell__link')}
              >
                {route.label}
              </NavLink>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className="shell__main">
        <div className="shell__content">
          <Outlet />
        </div>
      </main>

      <nav className="shell__nav shell__nav--bottom" aria-label="Main">
        {ROUTES.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) => (isActive ? 'shell__tab active' : 'shell__tab')}
          >
            <span className="shell__tab-icon" aria-hidden="true">
              {route.icon}
            </span>
            <span className="shell__tab-label">{route.shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
