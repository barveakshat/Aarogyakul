export type UUID = string

export type DocumentType = 'BLOOD_REPORT' | 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'BILL' | 'INSURANCE_DOC' | 'MEDICAL_ID' | 'OTHER'
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type TimelineEventType = 'DOCUMENT_UPLOAD' | 'DIAGNOSIS' | 'VACCINATION' | 'DOCTOR_VISIT' | 'SURGERY' | 'LAB_TEST' | 'MEDICATION_CHANGE' | 'NOTE'

export interface ApiErrorEnvelope {
  error?: {
    code?: string
    message?: string
  }
  message?: string
}

export interface User {
  id: UUID
  email: string
  fullName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  fullName: string
  phoneNumber?: string
}

export interface AuthResponse {
  userId: UUID
  email: string
  fullName: string
  accessToken: string
}

export interface CreateFamilyRequest {
  familyName: string
}

export interface FamilyResponse {
  familyId: UUID
  familyName: string
  ownerId: UUID
  createdAt: string
  members: MemberResponse[]
}

export interface MemberRequest {
  fullName: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  relationshipToOwner?: string
  profilePhotoUrl?: string
}

export interface MemberResponse extends MemberRequest {
  memberId: UUID
  familyId: UUID
  allergies: AllergyResponse[]
  chronicConditions: ChronicConditionResponse[]
}

export interface AllergyRequest {
  allergen: string
  severity?: string
  notes?: string
}

export interface AllergyResponse extends AllergyRequest {
  id: UUID
}

export interface ChronicConditionRequest {
  conditionName: string
  diagnosedDate?: string
  notes?: string
}

export interface ChronicConditionResponse extends ChronicConditionRequest {
  id: UUID
}

export interface DocumentUploadResponse {
  documentId: UUID
  fileName: string
  documentType: DocumentType
  processingStatus: ProcessingStatus
  uploadedAt: string
}

export interface DocumentSummaryResponse extends DocumentUploadResponse {
  reportDate?: string
}

export interface ParameterResponse {
  parameterName: string
  value: number
  unit?: string
  referenceRangeLow?: number
  referenceRangeHigh?: number
}

export interface InsightResponse {
  summaryText?: string
  comparisonJson?: Record<string, unknown>
}

export interface DocumentResponse extends DocumentSummaryResponse {
  processingError?: string
  parameters: ParameterResponse[]
  insight?: InsightResponse
}

export interface TimelineEventRequest {
  title: string
  eventType: TimelineEventType
  eventDate: string
  description?: string
}

export interface TimelineEventResponse {
  id: UUID
  eventType: TimelineEventType
  eventDate: string
  title: string
  description?: string
  relatedDocumentId?: UUID
  isManual: boolean
}
