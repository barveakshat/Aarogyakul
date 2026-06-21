import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { initials } from '../utils/format'
import { Button } from './ui'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/app', label: 'Dashboard' },
  ]

  return (
    <div className="min-h-screen bg-bg text-txtP">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-brd bg-surf lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-brd px-6 py-5">
            <div className="text-lg font-semibold text-txtP">AarogyaKul</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-txtS">Family health records</div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-btn px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'bg-blue-50 text-pri' : 'text-txtS hover:bg-slate-100 hover:text-txtP'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-brd p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-pri">
                {initials(user?.fullName)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-txtP">{user?.fullName}</div>
                <div className="truncate text-xs text-txtS">{user?.email}</div>
              </div>
            </div>
            <Button className="w-full" variant="secondary" onClick={handleLogout}>Sign out</Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-brd bg-surf/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <NavLink to="/app" className="text-base font-semibold text-txtP">AarogyaKul</NavLink>
          <Button variant="ghost" onClick={handleLogout}>Sign out</Button>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
