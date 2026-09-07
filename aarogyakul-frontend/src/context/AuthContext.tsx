import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { RegisterRequest, User } from '../types/api'
import { DEMO_USER_ID } from '../demo/demoData'

interface AuthContextType {
  user: User | null
  loading: boolean
  isDemo: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  setSession: (user: User) => void
  enterDemo: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const USER_KEY = 'ak_user'
const DEMO_KEY = 'ak_demo'

const DEMO_USER: User = {
  id: DEMO_USER_ID,
  email: 'demo@aarogyakul.app',
  fullName: 'Rajesh Sharma',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(() => localStorage.getItem(DEMO_KEY) === 'true')

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('ak_token', data.accessToken)
    localStorage.removeItem(DEMO_KEY)
    setIsDemo(false)
    setSession({
      id: data.userId, 
      email: data.email, 
      fullName: data.fullName 
    })
  }

  const register = async (payload: RegisterRequest) => {
    const response = await authApi.register(payload)
    localStorage.setItem('ak_token', response.accessToken)
    localStorage.removeItem(DEMO_KEY)
    setIsDemo(false)
    setSession({
      id: response.userId, 
      email: response.email, 
      fullName: response.fullName 
    })
  }

  const setSession = (nextUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const enterDemo = useCallback(() => {
    localStorage.setItem(DEMO_KEY, 'true')
    localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER))
    setIsDemo(true)
    setUser(DEMO_USER)
  }, [])

  const logout = async () => {
    if (!isDemo) {
      try {
        await authApi.logout()
      } catch {
        // Server may be unreachable — clear local state anyway
      }
    }
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('ak_token')
    localStorage.removeItem(DEMO_KEY)
    localStorage.removeItem('aarogyakul_active_profile_id')
    setIsDemo(false)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, isDemo, login, register, logout, setSession, enterDemo }),
    [user, loading, isDemo, enterDemo],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
