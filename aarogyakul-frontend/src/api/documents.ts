import { api } from './client'
import type {
  DocumentResponse,
  DocumentSummaryResponse,
  DocumentType,
  DocumentUploadResponse,
  PaginatedResponse,
  TimelineEventRequest,
  TimelineEventResponse,
  UUID,
} from '../types/api'
import * as demo from '../demo/demoApi'

export async function uploadDocument(memberId: UUID, file: File, documentType: DocumentType) {
  if (demo.isDemoMode()) return demo.demoUploadDocument()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)

  const { data } = await api.post<DocumentUploadResponse>(`/api/members/${memberId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function listDocuments(memberId: UUID, page = 0, size = 20) {
  if (demo.isDemoMode()) return demo.demoListDocuments(memberId, page, size)
  const { data } = await api.get<PaginatedResponse<DocumentSummaryResponse>>(`/api/members/${memberId}/documents`, {
    params: { page, size },
  })
  return data
}

export async function getDocument(documentId: UUID) {
  if (demo.isDemoMode()) return demo.demoGetDocument(documentId)
  const { data } = await api.get<DocumentResponse>(`/api/documents/${documentId}`)
  return data
}

export async function deleteDocument(documentId: UUID) {
  if (demo.isDemoMode()) return demo.demoDeleteDocument()
  await api.delete(`/api/documents/${documentId}`)
}

export async function retryDocument(documentId: UUID) {
  if (demo.isDemoMode()) throw new Error('Retry is not available in demo mode')
  const { data } = await api.post<DocumentUploadResponse>(`/api/documents/${documentId}/retry`)
  return data
}

export async function listTimeline(memberId: UUID, page = 0, size = 20) {
  if (demo.isDemoMode()) return demo.demoListTimeline(memberId, page, size)
  const { data } = await api.get<PaginatedResponse<TimelineEventResponse>>(`/api/members/${memberId}/timeline`, {
    params: { page, size },
  })
  return data
}

export async function createTimelineEvent(memberId: UUID, request: TimelineEventRequest) {
  if (demo.isDemoMode()) return demo.demoCreateTimelineEvent()
  const { data } = await api.post<TimelineEventResponse>(`/api/members/${memberId}/timeline`, request)
  return data
}

export async function deleteTimelineEvent(memberId: UUID, eventId: UUID) {
  if (demo.isDemoMode()) return demo.demoDeleteTimelineEvent()
  await api.delete(`/api/members/${memberId}/timeline/${eventId}`)
}
