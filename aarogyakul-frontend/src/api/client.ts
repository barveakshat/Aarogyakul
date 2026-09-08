import axios, { AxiosError } from 'axios'
import type { ApiErrorEnvelope } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ak_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorEnvelope>) => {
    const isAuthenticationRequest = error.config?.url?.startsWith('/api/auth/login') || error.config?.url?.startsWith('/api/auth/register')
    if (error.response?.status === 401 && !isAuthenticationRequest) {
      localStorage.removeItem('ak_user')
      localStorage.removeItem('ak_token')
      localStorage.removeItem('aarogyakul_active_profile_id')
      window.location.href = '/login?reason=session-expired'
    }

    const apiError = error.response?.data?.error
    const message =
      apiError?.message ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new ApiRequestError(message, error.response?.status, apiError?.code))
  },
)
