/**
 * Static demo data — The Sharma Family
 *
 * All IDs are deterministic UUIDs so cross-references (document → parameters,
 * timeline → document) stay consistent. This file is the single source of truth
 * for the demo workspace.
 */
import type {
  FamilyResponse,
  MemberResponse,
  DocumentSummaryResponse,
  DocumentResponse,
  ParameterResponse,
  InsightResponse,
  TimelineEventResponse,
  TrackedParametersResponse,
  ParameterTrendResponse,
  PaginatedResponse,
} from '../types/api'

// ─── IDs ────────────────────────────────────────────────────────
export const DEMO_USER_ID = 'demo-0000-0000-0000-000000000001'
export const DEMO_FAMILY_ID = 'demo-0000-0000-0000-000000000010'

export const MEMBER_RAJESH_ID = 'demo-0000-0000-0000-000000000100'
export const MEMBER_PRIYA_ID = 'demo-0000-0000-0000-000000000200'
export const MEMBER_ANANYA_ID = 'demo-0000-0000-0000-000000000300'

const DOC1_ID = 'demo-0000-0000-0000-000000001001'
const DOC2_ID = 'demo-0000-0000-0000-000000001002'
const DOC3_ID = 'demo-0000-0000-0000-000000001003'
const DOC4_ID = 'demo-0000-0000-0000-000000001004'

// ─── MEMBERS ────────────────────────────────────────────────────
const rajesh: MemberResponse = {
  memberId: MEMBER_RAJESH_ID,
  familyId: DEMO_FAMILY_ID,
  fullName: 'Rajesh Sharma',
  dateOfBirth: '1975-03-15',
  gender: 'Male',
  bloodGroup: 'B+',
  relationshipToOwner: 'Self',
  allergies: [
    { id: 'demo-allergy-001', allergen: 'Penicillin', severity: 'Severe', notes: 'Causes rash and swelling' },
    { id: 'demo-allergy-002', allergen: 'Dust mites', severity: 'Mild', notes: 'Seasonal sneezing' },
  ],
  chronicConditions: [
    { id: 'demo-cond-001', conditionName: 'Type 2 Diabetes', diagnosedDate: '2019-06-10', notes: 'Managed with Metformin' },
    { id: 'demo-cond-002', conditionName: 'Hypertension', diagnosedDate: '2021-01-15', notes: 'On Amlodipine 5mg' },
  ],
}

const priya: MemberResponse = {
  memberId: MEMBER_PRIYA_ID,
  familyId: DEMO_FAMILY_ID,
  fullName: 'Priya Sharma',
  dateOfBirth: '1978-08-22',
  gender: 'Female',
  bloodGroup: 'A+',
  relationshipToOwner: 'Spouse',
  allergies: [
    { id: 'demo-allergy-003', allergen: 'Shellfish', severity: 'Moderate', notes: 'Causes stomach cramps' },
  ],
  chronicConditions: [
    { id: 'demo-cond-003', conditionName: 'Hypothyroidism', diagnosedDate: '2020-03-01', notes: 'Thyronorm 50mcg daily' },
  ],
}

const ananya: MemberResponse = {
  memberId: MEMBER_ANANYA_ID,
  familyId: DEMO_FAMILY_ID,
  fullName: 'Ananya Sharma',
  dateOfBirth: '2005-11-30',
  gender: 'Female',
  bloodGroup: 'B+',
  relationshipToOwner: 'Daughter',
  allergies: [],
  chronicConditions: [],
}

// ─── FAMILY ─────────────────────────────────────────────────────
export const demoFamily: FamilyResponse = {
  familyId: DEMO_FAMILY_ID,
  familyName: 'Sharma Family',
  ownerId: DEMO_USER_ID,
  createdAt: '2025-01-15T10:30:00+05:30',
  members: [rajesh, priya, ananya],
}

// ─── DOCUMENTS (summaries) ──────────────────────────────────────
export const demoDocumentSummaries: DocumentSummaryResponse[] = [
  {
    documentId: DOC4_ID,
    fileName: 'Latest_Report_Mar2026.pdf',
    documentType: 'BLOOD_REPORT',
    processingStatus: 'COMPLETED',
    uploadedAt: '2026-03-12T09:15:00+05:30',
    reportDate: '2026-03-12',
  },
  {
    documentId: DOC3_ID,
    fileName: 'Quarterly_Checkup_Nov2025.pdf',
    documentType: 'BLOOD_REPORT',
    processingStatus: 'COMPLETED',
    uploadedAt: '2025-11-05T14:30:00+05:30',
    reportDate: '2025-11-05',
  },
  {
    documentId: DOC2_ID,
    fileName: 'Blood_Work_Jul2025.pdf',
    documentType: 'BLOOD_REPORT',
    processingStatus: 'COMPLETED',
    uploadedAt: '2025-07-18T11:00:00+05:30',
    reportDate: '2025-07-18',
  },
  {
    documentId: DOC1_ID,
    fileName: 'Complete_Blood_Panel_Mar2025.pdf',
    documentType: 'BLOOD_REPORT',
    processingStatus: 'COMPLETED',
    uploadedAt: '2025-03-10T08:45:00+05:30',
    reportDate: '2025-03-10',
  },
]

// ─── PARAMETERS per document ────────────────────────────────────
const doc1Params: ParameterResponse[] = [
  { parameterName: 'HbA1c', value: 7.2, unit: '%', referenceRangeLow: 4.0, referenceRangeHigh: 5.7, confidence: 'HIGH' },
  { parameterName: 'Fasting Blood Sugar', value: 142, unit: 'mg/dL', referenceRangeLow: 70, referenceRangeHigh: 110, confidence: 'HIGH' },
  { parameterName: 'Vitamin D', value: 14, unit: 'ng/mL', referenceRangeLow: 30, referenceRangeHigh: 100, confidence: 'HIGH' },
  { parameterName: 'LDL Cholesterol', value: 158, unit: 'mg/dL', referenceRangeLow: 0, referenceRangeHigh: 130, confidence: 'HIGH' },
  { parameterName: 'HDL Cholesterol', value: 38, unit: 'mg/dL', referenceRangeLow: 40, referenceRangeHigh: 60, confidence: 'HIGH' },
  { parameterName: 'Hemoglobin', value: 13.8, unit: 'g/dL', referenceRangeLow: 13.0, referenceRangeHigh: 17.0, confidence: 'HIGH' },
  { parameterName: 'Creatinine', value: 1.1, unit: 'mg/dL', referenceRangeLow: 0.7, referenceRangeHigh: 1.3, confidence: 'MEDIUM' },
]

const doc2Params: ParameterResponse[] = [
  { parameterName: 'HbA1c', value: 6.8, unit: '%', referenceRangeLow: 4.0, referenceRangeHigh: 5.7, confidence: 'HIGH' },
  { parameterName: 'Fasting Blood Sugar', value: 128, unit: 'mg/dL', referenceRangeLow: 70, referenceRangeHigh: 110, confidence: 'HIGH' },
  { parameterName: 'Vitamin D', value: 22, unit: 'ng/mL', referenceRangeLow: 30, referenceRangeHigh: 100, confidence: 'HIGH' },
  { parameterName: 'LDL Cholesterol', value: 145, unit: 'mg/dL', referenceRangeLow: 0, referenceRangeHigh: 130, confidence: 'HIGH' },
  { parameterName: 'HDL Cholesterol', value: 42, unit: 'mg/dL', referenceRangeLow: 40, referenceRangeHigh: 60, confidence: 'HIGH' },
  { parameterName: 'Hemoglobin', value: 14.1, unit: 'g/dL', referenceRangeLow: 13.0, referenceRangeHigh: 17.0, confidence: 'HIGH' },
  { parameterName: 'Creatinine', value: 1.0, unit: 'mg/dL', referenceRangeLow: 0.7, referenceRangeHigh: 1.3, confidence: 'MEDIUM' },
]

const doc3Params: ParameterResponse[] = [
  { parameterName: 'HbA1c', value: 6.4, unit: '%', referenceRangeLow: 4.0, referenceRangeHigh: 5.7, confidence: 'HIGH' },
  { parameterName: 'Fasting Blood Sugar', value: 118, unit: 'mg/dL', referenceRangeLow: 70, referenceRangeHigh: 110, confidence: 'HIGH' },
  { parameterName: 'Vitamin D', value: 28, unit: 'ng/mL', referenceRangeLow: 30, referenceRangeHigh: 100, confidence: 'MEDIUM' },
  { parameterName: 'LDL Cholesterol', value: 132, unit: 'mg/dL', referenceRangeLow: 0, referenceRangeHigh: 130, confidence: 'HIGH' },
  { parameterName: 'HDL Cholesterol', value: 45, unit: 'mg/dL', referenceRangeLow: 40, referenceRangeHigh: 60, confidence: 'HIGH' },
  { parameterName: 'Hemoglobin', value: 13.9, unit: 'g/dL', referenceRangeLow: 13.0, referenceRangeHigh: 17.0, confidence: 'HIGH' },
  { parameterName: 'Creatinine', value: 1.05, unit: 'mg/dL', referenceRangeLow: 0.7, referenceRangeHigh: 1.3, confidence: 'MEDIUM' },
]

const doc4Params: ParameterResponse[] = [
  { parameterName: 'HbA1c', value: 6.1, unit: '%', referenceRangeLow: 4.0, referenceRangeHigh: 5.7, confidence: 'HIGH' },
  { parameterName: 'Fasting Blood Sugar', value: 108, unit: 'mg/dL', referenceRangeLow: 70, referenceRangeHigh: 110, confidence: 'HIGH' },
  { parameterName: 'Vitamin D', value: 18, unit: 'ng/mL', referenceRangeLow: 30, referenceRangeHigh: 100, confidence: 'HIGH' },
  { parameterName: 'LDL Cholesterol', value: 142, unit: 'mg/dL', referenceRangeLow: 0, referenceRangeHigh: 130, confidence: 'HIGH' },
  { parameterName: 'HDL Cholesterol', value: 44, unit: 'mg/dL', referenceRangeLow: 40, referenceRangeHigh: 60, confidence: 'HIGH' },
  { parameterName: 'Hemoglobin', value: 14.2, unit: 'g/dL', referenceRangeLow: 13.0, referenceRangeHigh: 17.0, confidence: 'HIGH' },
  { parameterName: 'Creatinine', value: 0.98, unit: 'mg/dL', referenceRangeLow: 0.7, referenceRangeHigh: 1.3, confidence: 'HIGH' },
]

// ─── AI INSIGHTS per document ───────────────────────────────────
const doc1Insight: InsightResponse = {
  summaryText: `HbA1c is elevated at 7.2%, indicating suboptimal blood sugar control. Fasting blood sugar at 142 mg/dL is above the normal range. Vitamin D is critically low at 14 ng/mL — supplementation is strongly recommended. LDL cholesterol at 158 mg/dL and HDL at 38 mg/dL suggest an unfavorable lipid profile. Hemoglobin and creatinine are within normal limits.

This is an AI-generated summary for informational purposes only. It does not constitute medical advice. Please consult your healthcare provider for diagnosis and treatment.`,
}

const doc2Insight: InsightResponse = {
  summaryText: `HbA1c has improved from 7.2% to 6.8%, showing progress in glycemic control. Fasting blood sugar remains elevated at 128 mg/dL. Vitamin D has improved slightly to 22 ng/mL but is still below the reference range of 30–100. LDL cholesterol at 145 mg/dL continues to be above normal. HDL has improved to 42 mg/dL, now within the normal range. All other parameters are normal.

This is an AI-generated summary for informational purposes only. It does not constitute medical advice. Please consult your healthcare provider for diagnosis and treatment.`,
}

const doc3Insight: InsightResponse = {
  summaryText: `Excellent progress: HbA1c continues to decline, now at 6.4%. Fasting blood sugar at 118 mg/dL is approaching normal levels. Vitamin D at 28 ng/mL is borderline — just below the reference range of 30. LDL cholesterol at 132 mg/dL is marginally above the 130 cutoff. HDL at 45 mg/dL is healthy. Overall trend is very encouraging — the current management plan appears to be working well.

This is an AI-generated summary for informational purposes only. It does not constitute medical advice. Please consult your healthcare provider for diagnosis and treatment.`,
}

const doc4Insight: InsightResponse = {
  summaryText: `HbA1c has shown excellent improvement over the past year, dropping from 7.2% to 6.1%, though still slightly above the normal range of 4.0–5.7%. Fasting blood sugar has normalized at 108 mg/dL. However, Vitamin D remains critically low at 18 ng/mL (reference: 30–100 ng/mL) — supplementation should continue. LDL cholesterol at 142 mg/dL is above the recommended range of less than 130 mg/dL. Consider dietary adjustments and discuss statin therapy with your physician.

This is an AI-generated summary for informational purposes only. It does not constitute medical advice. Please consult your healthcare provider for diagnosis and treatment.`,
}

// ─── FULL DOCUMENTS (with parameters & insights) ────────────────
const documentDetails: Record<string, DocumentResponse> = {
  [DOC1_ID]: {
    ...demoDocumentSummaries[3],
    parameters: doc1Params,
    insight: doc1Insight,
  },
  [DOC2_ID]: {
    ...demoDocumentSummaries[2],
    parameters: doc2Params,
    insight: doc2Insight,
  },
  [DOC3_ID]: {
    ...demoDocumentSummaries[1],
    parameters: doc3Params,
    insight: doc3Insight,
  },
  [DOC4_ID]: {
    ...demoDocumentSummaries[0],
    parameters: doc4Params,
    insight: doc4Insight,
  },
}

export function getDemoDocument(documentId: string): DocumentResponse | null {
  return documentDetails[documentId] ?? null
}

export function getDemoDocumentsPaginated(memberId: string, page: number, size: number): PaginatedResponse<DocumentSummaryResponse> {
  if (memberId !== MEMBER_RAJESH_ID) {
    return { data: [], page: 0, totalPages: 0, totalElements: 0, hasMore: false }
  }
  const start = page * size
  const slice = demoDocumentSummaries.slice(start, start + size)
  return {
    data: slice,
    page,
    totalPages: Math.ceil(demoDocumentSummaries.length / size),
    totalElements: demoDocumentSummaries.length,
    hasMore: start + size < demoDocumentSummaries.length,
  }
}

// ─── TIMELINE ───────────────────────────────────────────────────
const rajeshTimeline: TimelineEventResponse[] = [
  { id: 'demo-tl-008', eventType: 'DOCUMENT_UPLOAD', eventDate: '2026-03-12', title: 'Blood report uploaded — Latest Report Mar 2026', description: 'Latest comprehensive blood panel for annual review.', relatedDocumentId: DOC4_ID, isManual: false },
  { id: 'demo-tl-007', eventType: 'MEDICATION_CHANGE', eventDate: '2026-02-10', title: 'Metformin dosage reduced to 500mg', description: 'Endocrinologist reduced Metformin from 1000mg to 500mg based on improving HbA1c levels.', isManual: true },
  { id: 'demo-tl-006', eventType: 'VACCINATION', eventDate: '2025-12-20', title: 'Influenza vaccination', description: 'Annual flu shot administered at Apollo Clinic.', isManual: true },
  { id: 'demo-tl-005', eventType: 'DOCUMENT_UPLOAD', eventDate: '2025-11-05', title: 'Quarterly checkup report uploaded', description: 'November quarterly blood work results.', relatedDocumentId: DOC3_ID, isManual: false },
  { id: 'demo-tl-004', eventType: 'DOCTOR_VISIT', eventDate: '2025-08-15', title: 'Annual physical exam', description: 'Complete physical at Fortis Hospital. All vitals stable. BMI 26.4.', isManual: true },
  { id: 'demo-tl-003', eventType: 'DOCUMENT_UPLOAD', eventDate: '2025-07-18', title: 'Blood work report uploaded', description: 'Mid-year blood work follow-up.', relatedDocumentId: DOC2_ID, isManual: false },
  { id: 'demo-tl-002', eventType: 'DOCTOR_VISIT', eventDate: '2025-04-02', title: 'Endocrinologist visit — dosage adjustment', description: 'Dr. Mehta increased Metformin to 1000mg and started Vitamin D3 60K weekly.', isManual: true },
  { id: 'demo-tl-001', eventType: 'DOCUMENT_UPLOAD', eventDate: '2025-03-10', title: 'Complete blood panel uploaded', description: 'First comprehensive panel uploaded to AarogyaKul.', relatedDocumentId: DOC1_ID, isManual: false },
]

export function getDemoTimelinePaginated(memberId: string, page: number, size: number): PaginatedResponse<TimelineEventResponse> {
  if (memberId !== MEMBER_RAJESH_ID) {
    return { data: [], page: 0, totalPages: 0, totalElements: 0, hasMore: false }
  }
  const start = page * size
  const slice = rajeshTimeline.slice(start, start + size)
  return {
    data: slice,
    page,
    totalPages: Math.ceil(rajeshTimeline.length / size),
    totalElements: rajeshTimeline.length,
    hasMore: start + size < rajeshTimeline.length,
  }
}

// ─── PARAMETER TRENDS ───────────────────────────────────────────
const trackedParameterNames = [
  'HbA1c', 'Fasting Blood Sugar', 'Vitamin D', 'LDL Cholesterol',
  'HDL Cholesterol', 'Hemoglobin', 'Creatinine',
]

export function getDemoTrackedParameters(memberId: string): TrackedParametersResponse {
  if (memberId !== MEMBER_RAJESH_ID) return { parameterNames: [] }
  return { parameterNames: trackedParameterNames }
}

const trendData: Record<string, ParameterTrendResponse> = {
  'HbA1c': {
    parameterName: 'HbA1c',
    unit: '%',
    dataPoints: [
      { date: '2025-03-10', value: 7.2, referenceRangeLow: 4.0, referenceRangeHigh: 5.7 },
      { date: '2025-07-18', value: 6.8, referenceRangeLow: 4.0, referenceRangeHigh: 5.7 },
      { date: '2025-11-05', value: 6.4, referenceRangeLow: 4.0, referenceRangeHigh: 5.7 },
      { date: '2026-03-12', value: 6.1, referenceRangeLow: 4.0, referenceRangeHigh: 5.7 },
    ],
  },
  'Fasting Blood Sugar': {
    parameterName: 'Fasting Blood Sugar',
    unit: 'mg/dL',
    dataPoints: [
      { date: '2025-03-10', value: 142, referenceRangeLow: 70, referenceRangeHigh: 110 },
      { date: '2025-07-18', value: 128, referenceRangeLow: 70, referenceRangeHigh: 110 },
      { date: '2025-11-05', value: 118, referenceRangeLow: 70, referenceRangeHigh: 110 },
      { date: '2026-03-12', value: 108, referenceRangeLow: 70, referenceRangeHigh: 110 },
    ],
  },
  'Vitamin D': {
    parameterName: 'Vitamin D',
    unit: 'ng/mL',
    dataPoints: [
      { date: '2025-03-10', value: 14, referenceRangeLow: 30, referenceRangeHigh: 100 },
      { date: '2025-07-18', value: 22, referenceRangeLow: 30, referenceRangeHigh: 100 },
      { date: '2025-11-05', value: 28, referenceRangeLow: 30, referenceRangeHigh: 100 },
      { date: '2026-03-12', value: 18, referenceRangeLow: 30, referenceRangeHigh: 100 },
    ],
  },
  'LDL Cholesterol': {
    parameterName: 'LDL Cholesterol',
    unit: 'mg/dL',
    dataPoints: [
      { date: '2025-03-10', value: 158, referenceRangeLow: 0, referenceRangeHigh: 130 },
      { date: '2025-07-18', value: 145, referenceRangeLow: 0, referenceRangeHigh: 130 },
      { date: '2025-11-05', value: 132, referenceRangeLow: 0, referenceRangeHigh: 130 },
      { date: '2026-03-12', value: 142, referenceRangeLow: 0, referenceRangeHigh: 130 },
    ],
  },
  'HDL Cholesterol': {
    parameterName: 'HDL Cholesterol',
    unit: 'mg/dL',
    dataPoints: [
      { date: '2025-03-10', value: 38, referenceRangeLow: 40, referenceRangeHigh: 60 },
      { date: '2025-07-18', value: 42, referenceRangeLow: 40, referenceRangeHigh: 60 },
      { date: '2025-11-05', value: 45, referenceRangeLow: 40, referenceRangeHigh: 60 },
      { date: '2026-03-12', value: 44, referenceRangeLow: 40, referenceRangeHigh: 60 },
    ],
  },
  'Hemoglobin': {
    parameterName: 'Hemoglobin',
    unit: 'g/dL',
    dataPoints: [
      { date: '2025-03-10', value: 13.8, referenceRangeLow: 13.0, referenceRangeHigh: 17.0 },
      { date: '2025-07-18', value: 14.1, referenceRangeLow: 13.0, referenceRangeHigh: 17.0 },
      { date: '2025-11-05', value: 13.9, referenceRangeLow: 13.0, referenceRangeHigh: 17.0 },
      { date: '2026-03-12', value: 14.2, referenceRangeLow: 13.0, referenceRangeHigh: 17.0 },
    ],
  },
  'Creatinine': {
    parameterName: 'Creatinine',
    unit: 'mg/dL',
    dataPoints: [
      { date: '2025-03-10', value: 1.1, referenceRangeLow: 0.7, referenceRangeHigh: 1.3 },
      { date: '2025-07-18', value: 1.0, referenceRangeLow: 0.7, referenceRangeHigh: 1.3 },
      { date: '2025-11-05', value: 1.05, referenceRangeLow: 0.7, referenceRangeHigh: 1.3 },
      { date: '2026-03-12', value: 0.98, referenceRangeLow: 0.7, referenceRangeHigh: 1.3 },
    ],
  },
}

export function getDemoParameterTrend(memberId: string, parameterName: string): ParameterTrendResponse {
  if (memberId !== MEMBER_RAJESH_ID || !trendData[parameterName]) {
    return { parameterName, unit: '', dataPoints: [] }
  }
  return trendData[parameterName]
}

// ─── MEMBER LOOKUP ──────────────────────────────────────────────
export function getDemoMember(memberId: string): MemberResponse | null {
  return demoFamily.members.find(m => m.memberId === memberId) ?? null
}
