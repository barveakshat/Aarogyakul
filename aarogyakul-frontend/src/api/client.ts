import axios, { AxiosError } from 'axios'
import type { ApiErrorEnvelope } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorEnvelope>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ak_user')
      window.location.href = '/login'
    }

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  },
)
