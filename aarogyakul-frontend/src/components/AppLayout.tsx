import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { initials } from '../utils/format'
import { Button } from './ui'
import { BrandMark } from './BrandMark'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: '01', end: true },
    { to: '/app/reports', label: 'Reports', icon: '02' },
    { to: '/app/insights', label: 'AI insights', icon: '03' },
    { to: '/app/timelines', label: 'Timelines', icon: '04' },
    { to: '/app/clinical', label: 'Clinical notes', icon: '05' },
  ]

  return (
    <div className="min-h-screen bg-bg text-txtP">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/70 bg-white/72 shadow-crd backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-brd/70 px-6 py-5">
            <BrandMark />
          </div>
          <nav className="flex-1 space-y-2 px-4 py-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition duration-200 ${
                    isActive ? 'bg-gradient-to-r from-pri to-pri2 text-white shadow-glow' : 'text-txtS hover:bg-white hover:text-pri'
                  }`
                }
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-xs">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mx-4 mb-4 rounded-crd border border-emerald-100 bg-gradient-to-br from-mint/70 to-white p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-pri">AI pipeline</div>
            <p className="mt-2 text-sm leading-6 text-txtS">Upload PDF reports and let AarogyaKul turn them into parameters, trends, and timeline events.</p>
          </div>
          <div className="border-t border-brd/70 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-emerald-100 text-sm font-black text-pri">
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

      <header className="sticky top-0 z-10 border-b border-brd bg-white/85 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandMark compact />
          <Button variant="ghost" onClick={handleLogout}>Sign out</Button>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-2 text-xs font-bold ${isActive ? 'bg-pri text-white' : 'bg-white text-txtS'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
