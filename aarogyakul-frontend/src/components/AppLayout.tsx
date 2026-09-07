import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../context/ProfileContext'
import { LayoutDashboard, FolderArchive, Sparkles, Activity, TrendingUp, Stethoscope, Settings, LogOut, ArrowLeftRight, UserCog, Menu, X } from 'lucide-react'
import { Avatar } from './Avatar'

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
  const { logout, isDemo } = useAuth()
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
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-bg text-deep">
      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-sbBg flex-col">
        <div className="h-14 flex items-center px-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="AarogyaKul" className="h-7 w-7 shrink-0 rounded-md object-contain" />
            <span className="text-sm font-bold tracking-tight text-white">AarogyaKul</span>
          </div>
        </div>

        {activeProfile && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Avatar name={activeProfile.fullName} photoUrl={activeProfile.profilePhotoUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">{activeProfile.fullName}</div>
                <div className="truncate text-xs text-sbTxt">{activeProfile.relationshipToOwner || 'Member'}</div>
              </div>
              <button
                onClick={handleSwitchProfile}
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-sbTxt hover:text-white hover:bg-sbHov transition-colors duration-150"
                title="Switch profile"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>
          </div>
        )}
        
        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive 
                      ? 'text-white bg-sbAct border-l-[3px] border-focus' 
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

        <div className="border-t border-white/10 p-3 space-y-0.5">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                isActive ? 'text-white bg-sbHov' : 'text-sbTxt hover:text-white hover:bg-sbHov'
              }`
            }
          >
            <UserCog className="w-[18px] h-[18px]" />
            <span>Edit profile</span>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-medium text-sbTxt hover:text-white hover:bg-sbHov transition-colors duration-150"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 md:h-14 px-4 md:px-8 flex items-center justify-between border-b border-line bg-surf shrink-0">
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
              {activeProfile && (
                <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/10">
                  <Avatar name={activeProfile.fullName} photoUrl={activeProfile.profilePhotoUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-white">{activeProfile.fullName}</div>
                  </div>
                  <button onClick={() => { handleSwitchProfile(); setMobileMenuOpen(false) }}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-sbTxt hover:text-white hover:bg-sbHov"
                    title="Switch profile"
                  >
                    <ArrowLeftRight size={14} />
                  </button>
                </div>
              )}
              <NavLink to="/app/clinical" onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-white bg-sbAct' : 'text-sbTxt hover:text-white hover:bg-sbHov'}`}
              >
                <Stethoscope className="w-[18px] h-[18px]" /> Clinical Notes
              </NavLink>
              <NavLink to="/app/profile" onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-white bg-sbAct' : 'text-sbTxt hover:text-white hover:bg-sbHov'}`}
              >
                <UserCog className="w-[18px] h-[18px]" /> Edit profile
              </NavLink>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sbTxt hover:text-white hover:bg-sbHov"
              >
                <LogOut className="w-[18px] h-[18px]" /> Sign out
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 relative">
          <div className="max-w-4xl mx-auto w-full">
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
