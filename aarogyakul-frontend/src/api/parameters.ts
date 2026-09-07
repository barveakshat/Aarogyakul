import { api } from './client'
import type { ParameterTrendResponse, TrackedParametersResponse, UUID } from '../types/api'
import * as demo from '../demo/demoApi'

export async function getTrackedParameters(memberId: UUID) {
  if (demo.isDemoMode()) return demo.demoGetTrackedParameters(memberId)
  const { data } = await api.get<TrackedParametersResponse>(`/api/members/${memberId}/parameters/tracked`)
  return data
}

export async function getParameterTrend(memberId: UUID, parameterName: string) {
  if (demo.isDemoMode()) return demo.demoGetParameterTrend(memberId, parameterName)
  const { data } = await api.get<ParameterTrendResponse>(`/api/members/${memberId}/parameters/trend`, {
    params: { parameterName },
  })
  return data
}
