import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { RegisterRequest, User } from '../types/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  setSession: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const USER_KEY = 'ak_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('ak_token', data.accessToken)
    setSession({
      id: data.userId, 
      email: data.email, 
      fullName: data.fullName 
    })
  }

  const register = async (payload: RegisterRequest) => {
    const response = await authApi.register(payload)
    localStorage.setItem('ak_token', response.accessToken)
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

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Server may be unreachable — clear local state anyway
    }
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('ak_token')
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setSession }),
    [user, loading],
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
