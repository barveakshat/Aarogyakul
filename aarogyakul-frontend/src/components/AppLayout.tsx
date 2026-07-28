import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../context/ProfileContext'
import { initials } from '../utils/format'
import { LayoutDashboard, FolderArchive, Sparkles, Activity, TrendingUp, Stethoscope, Settings, LogOut, ArrowLeftRight, UserCog, Menu, X } from 'lucide-react'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/vault', label: 'Document Vault', icon: FolderArchive },
  { to: '/app/insights', label: 'AI Insights', icon: Sparkles },
  { to: '/app/timeline', label: 'Timeline', icon: Activity },
  { to: '/app/trends', label: 'Trends', icon: TrendingUp },
  { to: '/app/clinical', label: 'Clinical Notes', icon: Stethoscope },
  { to: '/app/settings', label: 'Settings', icon: Settings },
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
  const { logout } = useAuth()
  const { activeProfile, clearProfile } = useProfile()
  const navigate = useNavigate()
  const pageTitle = usePageTitle()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSwitchProfile = () => {
    clearProfile()
    navigate('/app/profiles', { replace: true })
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-bg text-txtP">
      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-sbBg flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AarogyaKul" className="h-8 w-8 shrink-0 rounded-xl object-contain" />
            <span className="min-w-0">
              <span className="block text-base font-black tracking-tight text-white">AarogyaKul</span>
            </span>
          </div>
        </div>

        {activeProfile && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              {activeProfile.profilePhotoUrl ? (
                <img src={activeProfile.profilePhotoUrl} alt={activeProfile.fullName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pri/30 to-sec/30 text-sm font-bold text-white">
                  {initials(activeProfile.fullName)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{activeProfile.fullName}</div>
                <div className="truncate text-xs text-sbT">{activeProfile.relationshipToOwner || 'Member'}</div>
              </div>
            </div>
            <button
              onClick={handleSwitchProfile}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-sbT hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <ArrowLeftRight size={14} />
              Switch Profile
            </button>
          </div>
        )}
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-pri/20 to-transparent border-l-4 border-pri shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' 
                      : 'text-sbT hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/5 p-4 space-y-2">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive ? 'text-white bg-white/10' : 'text-sbT hover:text-white hover:bg-white/5'
              }`
            }
          >
            <UserCog className="w-5 h-5" />
            <span>Edit Profile</span>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium text-sbT hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 px-4 md:px-8 flex items-center justify-between border-b border-brd bg-bg shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <img src="/logo.svg" alt="AarogyaKul" className="h-7 w-7 rounded-lg object-contain" />
            <h2 className="text-base font-bold text-txtP tracking-tight">{pageTitle}</h2>
          </div>
          <h2 className="text-lg font-bold text-txtP tracking-tight hidden md:block">{pageTitle}</h2>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-txtS hover:bg-brd/30 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* ─── MOBILE SLIDE-DOWN MENU ─── */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-sbBg border-b border-white/10 animate-fdIn">
            <div className="p-4 space-y-2">
              {activeProfile && (
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                  {activeProfile.profilePhotoUrl ? (
                    <img src={activeProfile.profilePhotoUrl} alt={activeProfile.fullName} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pri/30 to-sec/30 text-xs font-bold text-white">
                      {initials(activeProfile.fullName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{activeProfile.fullName}</div>
                  </div>
                </div>
              )}
              <NavLink to="/app/clinical" onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'text-white bg-white/10' : 'text-sbT hover:text-white'}`}
              >
                <Stethoscope className="w-5 h-5" /> Clinical Notes
              </NavLink>
              <NavLink to="/app/profile" onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'text-white bg-white/10' : 'text-sbT hover:text-white'}`}
              >
                <UserCog className="w-5 h-5" /> Edit Profile
              </NavLink>
              <button onClick={() => { handleSwitchProfile(); setMobileMenuOpen(false) }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sbT hover:text-white"
              >
                <ArrowLeftRight className="w-5 h-5" /> Switch Profile
              </button>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sbT hover:text-white"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 relative">
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ─── MOBILE BOTTOM NAVIGATION (hidden on desktop) ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-sbBg border-t border-white/10 z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-pri' : 'text-sbT hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
