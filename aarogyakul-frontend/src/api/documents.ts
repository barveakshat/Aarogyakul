import { api } from './client'
import type {
  DocumentResponse,
  DocumentSummaryResponse,
  DocumentType,
  DocumentUploadResponse,
  TimelineEventResponse,
  UUID,
} from '../types/api'

export async function uploadDocument(memberId: UUID, file: File, documentType: DocumentType) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)

  const { data } = await api.post<DocumentUploadResponse>(`/api/members/${memberId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function listDocuments(memberId: UUID) {
  const { data } = await api.get<DocumentSummaryResponse[]>(`/api/members/${memberId}/documents`)
  return data
}

export async function getDocument(documentId: UUID) {
  const { data } = await api.get<DocumentResponse>(`/api/documents/${documentId}`)
  return data
}

export async function deleteDocument(documentId: UUID) {
  await api.delete(`/api/documents/${documentId}`)
}

export async function listTimeline(memberId: UUID) {
  const { data } = await api.get<TimelineEventResponse[]>(`/api/members/${memberId}/timeline`)
  return data
}
