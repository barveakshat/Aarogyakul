import { api } from './client'
import type { AuthUserResponse, LoginRequest, RegisterRequest } from '../types/api'

export async function login(payload: LoginRequest) {
  const { data } = await api.post<AuthUserResponse>('/api/auth/login', payload)
  return data
}

export async function register(payload: RegisterRequest) {
  const { data } = await api.post<AuthUserResponse>('/api/auth/register', payload)
  return data
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}
