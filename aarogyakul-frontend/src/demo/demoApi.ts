/**
 * Demo API layer — drop-in replacements for real API functions.
 *
 * When demo mode is active, the real API files delegate to these functions
 * instead of hitting the backend. All data comes from demoData.ts.
 */
import type {
  DocumentResponse,
  DocumentSummaryResponse,
  FamilyResponse,
  MemberResponse,
  ParameterTrendResponse,
  PaginatedResponse,
  TimelineEventResponse,
  TrackedParametersResponse,
} from '../types/api'
import {
  demoFamily,
  getDemoDocument,
  getDemoDocumentsPaginated,
  getDemoMember,
  getDemoParameterTrend,
  getDemoTimelinePaginated,
  getDemoTrackedParameters,
} from './demoData'

const DEMO_KEY = 'ak_demo'

/** Check if the app is in demo mode */
export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_KEY) === 'true'
}

/** Error thrown when a demo visitor tries to write */
export class DemoWriteError extends Error {
  constructor() {
    super('This is a demo workspace — sign up to use this feature!')
    this.name = 'DemoWriteError'
  }
}

function rejectWrite(): never {
  throw new DemoWriteError()
}

// ─── Family API ─────────────────────────────────────────────────
export function demoGetMyFamily(): FamilyResponse {
  return demoFamily
}

export function demoCreateFamily(): never { return rejectWrite() }

export function demoListMembers(): MemberResponse[] {
  return demoFamily.members
}

export function demoGetMember(memberId: string): MemberResponse {
  const m = getDemoMember(memberId)
  if (!m) throw new Error('Member not found')
  return m
}

export function demoCreateMember(): never { return rejectWrite() }
export function demoUpdateMember(): never { return rejectWrite() }
export function demoDeleteMember(): never { return rejectWrite() }
export function demoUploadProfilePhoto(): never { return rejectWrite() }
export function demoAddAllergy(): never { return rejectWrite() }
export function demoDeleteAllergy(): never { return rejectWrite() }
export function demoAddCondition(): never { return rejectWrite() }
export function demoDeleteCondition(): never { return rejectWrite() }

// ─── Document API ───────────────────────────────────────────────
export function demoListDocuments(memberId: string, page = 0, size = 20): PaginatedResponse<DocumentSummaryResponse> {
  return getDemoDocumentsPaginated(memberId, page, size)
}

export function demoGetDocument(documentId: string): DocumentResponse {
  const doc = getDemoDocument(documentId)
  if (!doc) throw new Error('Document not found')
  return doc
}

export function demoUploadDocument(): never { return rejectWrite() }
export function demoDeleteDocument(): never { return rejectWrite() }

// ─── Timeline API ───────────────────────────────────────────────
export function demoListTimeline(memberId: string, page = 0, size = 20): PaginatedResponse<TimelineEventResponse> {
  return getDemoTimelinePaginated(memberId, page, size)
}

export function demoCreateTimelineEvent(): never { return rejectWrite() }
export function demoDeleteTimelineEvent(): never { return rejectWrite() }

// ─── Parameter API ──────────────────────────────────────────────
export function demoGetTrackedParameters(memberId: string): TrackedParametersResponse {
  return getDemoTrackedParameters(memberId)
}

export function demoGetParameterTrend(memberId: string, parameterName: string): ParameterTrendResponse {
  return getDemoParameterTrend(memberId, parameterName)
}
