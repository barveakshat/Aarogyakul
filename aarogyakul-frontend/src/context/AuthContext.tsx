import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { RegisterRequest, User } from '../types/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  setSession: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const TOKEN_KEY = 'ak_token'
const USER_KEY = 'ak_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setSession(data.accessToken, {
      id: data.userId, 
      email: data.email, 
      fullName: data.fullName 
    })
  }

  const register = async (payload: RegisterRequest) => {
    const response = await authApi.register(payload)
    setSession(response.accessToken, {
      id: response.userId, 
      email: response.email, 
      fullName: response.fullName 
    })
  }

  const setSession = (nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, setSession }),
    [user, token, loading],
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
