import axios, { AxiosError } from 'axios'
import type { ApiErrorEnvelope } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
    if (error.response?.status === 401) {
      localStorage.removeItem('ak_token')
      localStorage.removeItem('ak_user')
    }

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  },
)
