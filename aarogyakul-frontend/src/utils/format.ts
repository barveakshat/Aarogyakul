import type { DocumentType, ProcessingStatus, TimelineEventType } from '../types/api'

export function formatDate(value?: string) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function formatDateTime(value?: string) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function documentTypeLabel(type?: DocumentType) {
  const labels: Record<DocumentType, string> = {
    BLOOD_REPORT: 'Blood report',
    LAB_REPORT: 'Lab report',
    PRESCRIPTION: 'Prescription',
    DISCHARGE_SUMMARY: 'Discharge summary',
    BILL: 'Bill / Invoice',
    INSURANCE_DOC: 'Insurance document',
    MEDICAL_ID: 'Medical ID',
    OTHER: 'Other document',
  }
  return type ? labels[type] : 'Document'
}

export function statusLabel(status?: ProcessingStatus) {
  const labels: Record<ProcessingStatus, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  }
  return status ? labels[status] : 'Unknown'
}

export function timelineEventLabel(type?: TimelineEventType) {
  const labels: Record<TimelineEventType, string> = {
    DOCUMENT_UPLOAD: 'Document',
    DIAGNOSIS: 'Diagnosis',
    VACCINATION: 'Vaccination',
    DOCTOR_VISIT: 'Doctor visit',
    SURGERY: 'Surgery',
    LAB_TEST: 'Lab test',
    MEDICATION_CHANGE: 'Medication change',
    NOTE: 'Note',
  }
  return type ? labels[type] : 'Event'
}

export function initials(name?: string) {
  if (!name) return 'AK'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
