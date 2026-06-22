import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../context/ProfileContext'
import { initials } from '../utils/format'
import { LayoutDashboard, FolderArchive, Sparkles, Activity, Stethoscope, LogOut, ArrowLeftRight, UserCog } from 'lucide-react'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/vault', label: 'Document Vault', icon: FolderArchive },
  { to: '/app/insights', label: 'AI Insights', icon: Sparkles },
  { to: '/app/timeline', label: 'Timeline', icon: Activity },
  { to: '/app/clinical', label: 'Clinical Notes', icon: Stethoscope },
]

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

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSwitchProfile = () => {
    clearProfile()
    navigate('/app/profiles', { replace: true })
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-bg text-txtP">
      <aside className="w-64 flex-shrink-0 bg-sbBg flex flex-col">
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

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 flex items-center justify-between border-b border-brd bg-bg shrink-0">
          <h2 className="text-lg font-bold text-txtP tracking-tight">{pageTitle}</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
