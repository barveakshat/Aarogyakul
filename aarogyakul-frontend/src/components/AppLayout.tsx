import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../context/ProfileContext'
import { House, FolderArchive, FileText, Activity, TrendingUp, Stethoscope, Settings, LogOut, Menu, X, Sparkles, Plus, ChevronDown, User } from 'lucide-react'
import { Avatar } from './Avatar'

const navItems = [
  { to: '/app', label: 'Home', icon: House, end: true },
  { to: '/app/vault', label: 'Document Vault', icon: FolderArchive },
  { to: '/app/insights', label: 'AI Insights', icon: FileText },
  { to: '/app/timeline', label: 'Timeline', icon: Activity },
  { to: '/app/trends', label: 'Health trends', icon: TrendingUp },
  { to: '/app/clinical', label: 'Clinical Notes', icon: Stethoscope },
]

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

function age(value: string) { 
  const birth = new Date(`${value}T00:00:00`), now = new Date()
  return now.getFullYear() - birth.getFullYear() - Number(now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) 
}

function first(name: string) { return name.split(' ')[0] || name }

export function AppLayout() {
  const { logout, isDemo } = useAuth()
  const { activeProfile, family, setActiveProfile } = useProfile()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pageTitle = usePageTitle()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const isDashboard = pathname === '/app'
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-bg text-deep">
      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─── */}
      <aside className="hidden md:flex w-[246px] flex-shrink-0 bg-sbBg flex-col z-20">
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
        
        <div className="px-6 py-4 border-t border-white/5 mt-auto">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sbTxt hover:text-alert hover:bg-alert/10 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg">
        {/* TOP BAR */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-line bg-surf shrink-0 z-10">
          {/* Left: Mobile menu & Logo */}
          <div className="flex items-center gap-2.5 md:w-[200px]">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-mid hover:bg-bg transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center gap-2.5 md:hidden">
              <img src="/logo.svg" alt="AarogyaKul" className="h-6 w-6 rounded-md object-contain" />
              <h2 className="text-sm font-semibold text-deep">{pageTitle}</h2>
            </div>
          </div>

          {/* Center: Family Members */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-2 overflow-x-auto px-4 no-scrollbar">
            {activeProfile && family?.members.map(member => {
              const isActive = member.memberId === activeProfile.memberId;
              return (
                <button 
                  key={member.memberId} 
                  onClick={() => setActiveProfile(member)} 
                  className={`flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 ${isActive ? 'bg-focus/10 border border-focus/20' : 'hover:bg-bg'}`}
                >
                  <Avatar name={member.fullName} photoUrl={member.profilePhotoUrl} size="sm" />
                  <div className="text-left leading-tight hidden xl:block pr-1">
                    <span className="block text-sm font-semibold text-deep">{first(member.fullName)}</span>
                    <span className="block text-[10px] text-mid">{member.dateOfBirth ? `${age(member.dateOfBirth)} yrs` : 'Member'}</span>
                  </div>
                  {isActive && <ChevronDown size={14} className="text-focus hidden xl:block" />}
                </button>
              )
            })}
            {activeProfile && (
              <button 
                onClick={() => navigate('/app/profiles')} 
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-deep hover:bg-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-focus/10 text-focus">
                  <Plus size={16} strokeWidth={2.5} />
                </div>
                <span className="hidden xl:inline pr-2">Add Member</span>
              </button>
            )}
          </div>

          {/* Right: Profile Dropdown */}
          <div className="flex items-center justify-end gap-3 md:w-[200px]" ref={dropdownRef}>
            {activeProfile && (
              <div className="relative flex items-center gap-3">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-full hover:ring-2 hover:ring-focus/30 transition-shadow focus:outline-none bg-focus/10 text-focus"
                >
                  <Avatar name={activeProfile.fullName} photoUrl={activeProfile.profilePhotoUrl} size="md" className="cursor-pointer" />
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-12 w-48 rounded-md border border-line bg-surf py-1 shadow-lg z-50">
                    <Link to="/app/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-deep hover:bg-bg">
                      <User size={16} /> Edit Profile
                    </Link>
                    <Link to="/app/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-deep hover:bg-bg">
                      <Settings size={16} /> Settings
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
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
          <div className="w-full">
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
