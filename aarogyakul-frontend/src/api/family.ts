import { api } from './client'
import type {
  AllergyRequest,
  AllergyResponse,
  ChronicConditionRequest,
  ChronicConditionResponse,
  CreateFamilyRequest,
  FamilyResponse,
  MemberRequest,
  MemberResponse,
  UUID,
} from '../types/api'

export async function getMyFamily() {
  const { data } = await api.get<FamilyResponse>('/api/families/me')
  return data
}

export async function createFamily(payload: CreateFamilyRequest) {
  const { data } = await api.post<FamilyResponse>('/api/families', payload)
  return data
}

export async function listMembers(familyId: UUID) {
  const { data } = await api.get<MemberResponse[]>(`/api/families/${familyId}/members`)
  return data
}

export async function createMember(familyId: UUID, payload: MemberRequest) {
  const { data } = await api.post<MemberResponse>(`/api/families/${familyId}/members`, payload)
  return data
}

export async function getMember(memberId: UUID) {
  const { data } = await api.get<MemberResponse>(`/api/members/${memberId}`)
  return data
}

export async function updateMember(memberId: UUID, payload: MemberRequest) {
  const { data } = await api.put<MemberResponse>(`/api/members/${memberId}`, payload)
  return data
}

export async function deleteMember(memberId: UUID) {
  await api.delete(`/api/members/${memberId}`)
}

export async function addAllergy(memberId: UUID, payload: AllergyRequest) {
  const { data } = await api.post<AllergyResponse>(`/api/members/${memberId}/allergies`, payload)
  return data
}

export async function deleteAllergy(memberId: UUID, allergyId: UUID) {
  await api.delete(`/api/members/${memberId}/allergies/${allergyId}`)
}

export async function addCondition(memberId: UUID, payload: ChronicConditionRequest) {
  const { data } = await api.post<ChronicConditionResponse>(`/api/members/${memberId}/conditions`, payload)
  return data
}

export async function deleteCondition(memberId: UUID, conditionId: UUID) {
  await api.delete(`/api/members/${memberId}/conditions/${conditionId}`)
}
