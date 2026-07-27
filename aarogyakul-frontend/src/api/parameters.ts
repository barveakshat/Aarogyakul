import { api } from './client'
import type { ParameterTrendResponse, TrackedParametersResponse, UUID } from '../types/api'

export async function getTrackedParameters(memberId: UUID) {
  const { data } = await api.get<TrackedParametersResponse>(`/api/members/${memberId}/parameters/tracked`)
  return data
}

export async function getParameterTrend(memberId: UUID, parameterName: string) {
  const { data } = await api.get<ParameterTrendResponse>(`/api/members/${memberId}/parameters/trend`, {
    params: { parameterName },
  })
  return data
}
