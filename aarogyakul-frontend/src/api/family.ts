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
import * as demo from '../demo/demoApi'

export async function getMyFamily() {
  if (demo.isDemoMode()) return demo.demoGetMyFamily()
  const { data } = await api.get<FamilyResponse>('/api/families/me')
  return data
}

export async function createFamily(payload: CreateFamilyRequest) {
  if (demo.isDemoMode()) return demo.demoCreateFamily()
  const { data } = await api.post<FamilyResponse>('/api/families', payload)
  return data
}

export async function listMembers(familyId: UUID) {
  if (demo.isDemoMode()) return demo.demoListMembers()
  const { data } = await api.get<MemberResponse[]>(`/api/families/${familyId}/members`)
  return data
}

export async function createMember(familyId: UUID, payload: MemberRequest) {
  if (demo.isDemoMode()) return demo.demoCreateMember()
  const { data } = await api.post<MemberResponse>(`/api/families/${familyId}/members`, payload)
  return data
}

export async function getMember(memberId: UUID) {
  if (demo.isDemoMode()) return demo.demoGetMember(memberId)
  const { data } = await api.get<MemberResponse>(`/api/members/${memberId}`)
  return data
}

export async function updateMember(memberId: UUID, payload: MemberRequest) {
  if (demo.isDemoMode()) return demo.demoUpdateMember()
  const { data } = await api.put<MemberResponse>(`/api/members/${memberId}`, payload)
  return data
}

export async function deleteMember(memberId: UUID) {
  if (demo.isDemoMode()) return demo.demoDeleteMember()
  await api.delete(`/api/members/${memberId}`)
}

export async function addAllergy(memberId: UUID, payload: AllergyRequest) {
  if (demo.isDemoMode()) return demo.demoAddAllergy()
  const { data } = await api.post<AllergyResponse>(`/api/members/${memberId}/allergies`, payload)
  return data
}

export async function deleteAllergy(memberId: UUID, allergyId: UUID) {
  if (demo.isDemoMode()) return demo.demoDeleteAllergy()
  await api.delete(`/api/members/${memberId}/allergies/${allergyId}`)
}

export async function addCondition(memberId: UUID, payload: ChronicConditionRequest) {
  if (demo.isDemoMode()) return demo.demoAddCondition()
  const { data } = await api.post<ChronicConditionResponse>(`/api/members/${memberId}/conditions`, payload)
  return data
}

export async function deleteCondition(memberId: UUID, conditionId: UUID) {
  if (demo.isDemoMode()) return demo.demoDeleteCondition()
  await api.delete(`/api/members/${memberId}/conditions/${conditionId}`)
}

export async function uploadProfilePhoto(memberId: UUID, file: File) {
  if (demo.isDemoMode()) return demo.demoUploadProfilePhoto()
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<MemberResponse>(`/api/members/${memberId}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
