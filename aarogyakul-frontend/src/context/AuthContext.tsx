import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthResponse } from '../types/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error?.message || 'Login failed')
    }
    
    const data: AuthResponse = await res.json()
    localStorage.setItem('token', data.accessToken)
    setToken(data.accessToken)
    setUser({ 
      id: data.userId, 
      email: data.email, 
      fullName: data.fullName 
    })
  }

  const register = async (data: RegisterRequest) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error?.message || 'Registration failed')
    }
    
    const response: AuthResponse = await res.json()
    localStorage.setItem('token', response.accessToken)
    setToken(response.accessToken)
    setUser({ 
      id: response.userId, 
      email: response.email, 
      fullName: response.fullName 
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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