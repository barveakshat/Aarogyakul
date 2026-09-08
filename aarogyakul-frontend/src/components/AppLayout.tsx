import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'

import { House, FolderArchive, FileText, Activity, TrendingUp, Stethoscope, Settings, LogOut, Menu, X, Sparkles } from 'lucide-react'


const navItems = [
  { to: '/app', label: 'Home', icon: House, end: true },
  { to: '/app/vault', label: 'Document Vault', icon: FolderArchive },
  { to: '/app/insights', label: 'AI Insights', icon: FileText },
  { to: '/app/timeline', label: 'Timeline', icon: Activity },
  { to: '/app/trends', label: 'Health trends', icon: TrendingUp },
  { to: '/app/clinical', label: 'Clinical Notes', icon: Stethoscope },
]

/** Bottom nav items — subset of navItems for mobile tab bar */
const bottomNavItems = navItems.slice(0, 4)

function usePageTitle() {
  const { pathname } = useLocation()
  const match = navItems.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )
  if (match) return match.label
  if (pathname.includes('/profile')) return 'Edit Profile'
  return 'AarogyaKul'
}

export function AppLayout() {
  const { logout, isDemo } = useAuth()

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pageTitle = usePageTitle()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isDashboard = pathname === '/app'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-bg text-deep">
      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─── */}
      <aside className="hidden md:flex w-[246px] flex-shrink-0 bg-sbBg flex-col">
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AarogyaKul" className="h-12 w-12 shrink-0 object-contain" />
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">AarogyaKul</span>
              <p className="mt-1 text-xs leading-4 text-sbTxt">Health records for<br />every generation</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto pt-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-150 ${
                    isActive 
                      ? 'text-white bg-sbAct border-l-[3px] border-focus pl-[21px]'
                      : 'text-sbTxt hover:text-white hover:bg-sbHov'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 px-4 py-4 space-y-1">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                isActive ? 'text-white bg-sbHov' : 'text-sbTxt hover:text-white hover:bg-sbHov'
              }`
            }
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Settings</span>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sbTxt hover:text-white hover:bg-sbHov transition-colors duration-150"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className={`h-12 md:h-14 px-4 md:px-8 flex items-center justify-between border-b border-line bg-surf shrink-0 ${isDashboard ? 'md:hidden' : ''}`}>
          <div className="flex items-center gap-2.5 md:hidden">
            <img src="/logo.svg" alt="AarogyaKul" className="h-6 w-6 rounded-md object-contain" />
            <h2 className="text-sm font-semibold text-deep">{pageTitle}</h2>
          </div>
          <h2 className="text-sm font-semibold text-deep hidden md:block">{pageTitle}</h2>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-mid hover:bg-bg transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {isDemo && (
          <div className="bg-focus/10 border-b border-focus/20 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm text-focus font-medium">
              <Sparkles size={16} />
              <span>You are viewing a live demo with sample data. Changes will not be saved.</span>
            </div>
            <button
              onClick={() => {
                logout()
                window.location.href = '/'
              }}
              className="text-xs font-semibold text-focus hover:text-focus/80 transition-colors"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* ─── MOBILE SLIDE-DOWN MENU ─── */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-sbBg border-b border-white/10 animate-enter">
            <div className="p-4 space-y-1">
              <NavLink to="/app/clinical" onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-white bg-sbAct' : 'text-sbTxt hover:text-white hover:bg-sbHov'}`}
              >
                <Stethoscope className="w-[18px] h-[18px]" /> Clinical Notes
              </NavLink>
              <NavLink to="/app/settings" onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-white bg-sbAct' : 'text-sbTxt hover:text-white hover:bg-sbHov'}`}
              >
                <Settings className="w-[18px] h-[18px]" /> Settings
              </NavLink>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sbTxt hover:text-white hover:bg-sbHov"
              >
                <LogOut className="w-[18px] h-[18px]" /> Sign out
              </button>
            </div>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto pb-20 md:pb-8 relative ${isDashboard ? '' : 'p-4 md:p-8'}`}>
          <div className={`mx-auto w-full ${isDashboard ? '' : 'max-w-4xl'}`}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* ─── MOBILE BOTTOM NAVIGATION (hidden on desktop) ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-sbBg border-t border-white/10 z-40">
        <div className="flex items-center justify-around h-14 px-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-md transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-sbTxt hover:text-white'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
