import { api } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api'

export async function login(payload: LoginRequest) {
  const { data } = await api.post<AuthResponse>('/api/auth/login', payload)
  return data
}

export async function register(payload: RegisterRequest) {
  const { data } = await api.post<AuthResponse>('/api/auth/register', payload)
  return data
}
