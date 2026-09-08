import { FormEvent, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { getDocument, listDocuments, uploadDocument } from '../api/documents'
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader, SelectField, StatusBadge } from '../components/ui'
import type { DocumentResponse, DocumentSummaryResponse, DocumentType, ParameterResponse } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime } from '../utils/format'
import { Plus, X } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { isDemoMode } from '../demo/demoApi'

const maxPdfSize = 15 * 1024 * 1024
const documentTypes: DocumentType[] = ['BLOOD_REPORT', 'LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'BILL', 'INSURANCE_DOC', 'MEDICAL_ID', 'OTHER']

const PIPELINE_STAGES = [
  { key: 'EXTRACTING_TEXT', label: 'Reading PDF' },
  { key: 'IDENTIFYING_PARAMETERS', label: 'Extracting lab values' },
  { key: 'COMPARING_HISTORY', label: 'Comparing history' },
  { key: 'GENERATING_SUMMARY', label: 'Generating summary' },
  { key: 'COMPLETED', label: 'Complete' },
]

export default function UploadPage() {
  const { activeProfile } = useProfile()
  const memberId = activeProfile?.memberId || ''
  const [searchParams, setSearchParams] = useSearchParams()
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('BLOOD_REPORT')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [processingStage, setProcessingStage] = useState<{ stage: string; message: string } | null>(null)

  const selectedDocumentId = searchParams.get('document')

  const load = useCallback(async () => {
    setError('')
    try {
      const result = await listDocuments(memberId)
      setDocuments(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load upload workspace')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null)
      return
    }
    void getDocument(selectedDocumentId).then(setSelectedDocument).catch((err) => setError(err instanceof Error ? err.message : 'Could not load document'))
  }, [selectedDocumentId])

  // SSE for real-time processing updates, fallback to polling
  useEffect(() => {
    const activeDoc = documents.find((doc) => doc.processingStatus === 'PENDING' || doc.processingStatus === 'PROCESSING')
    if (!activeDoc) {
      setProcessingStage(null)
      return
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    const sseUrl = `${apiBase}/api/documents/${activeDoc.documentId}/status-stream`

    let eventSource: EventSource | null = null
    let fallbackTimer: number | null = null

    try {
      eventSource = new EventSource(sseUrl, { withCredentials: true })

      eventSource.addEventListener('stage', (event) => {
        const data = JSON.parse(event.data)
        setProcessingStage(data)
        if (data.stage === 'COMPLETED' || data.stage === 'FAILED') {
          void load()
          if (selectedDocumentId === activeDoc.documentId) {
            void getDocument(activeDoc.documentId).then(setSelectedDocument)
          }
        }
      })

      eventSource.onerror = () => {
        // SSE failed — fallback to polling
        eventSource?.close()
        eventSource = null
        fallbackTimer = window.setInterval(() => void load(), 5000)
      }
    } catch {
      // EventSource not supported — fallback to polling
      fallbackTimer = window.setInterval(() => void load(), 5000)
    }

    return () => {
      eventSource?.close()
      if (fallbackTimer) window.clearInterval(fallbackTimer)
    }
  }, [documents, load, selectedDocumentId])

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    
    // DEMO GUARD: Check if running in demo mode
    if (isDemoMode()) {
      setError('You are viewing a live demo. Uploads are disabled.')
      return
    }

    if (!file) {
      setError('Choose a PDF file before uploading.')
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }
    if (file.size > maxPdfSize) {
      setError('PDF must be 15MB or smaller.')
      return
    }

    setUploading(true)
    try {
      await uploadDocument(memberId, file, documentType)
      setFile(null)
      setSearchParams({})
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingState label="Loading documents" />

  return (
    <>
      <PageHeader
        title={`AI Insights${activeProfile ? ` — ${activeProfile.fullName}` : ''}`}
        description="Upload medical documents and view AI-powered analysis. Blood and lab reports are automatically processed."
        action={
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-md bg-focus px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} /> Upload
          </button>
        }
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}

      {/* ─── PROCESSING STEPPER ─── */}
      {processingStage && processingStage.stage !== 'COMPLETED' && processingStage.stage !== 'FAILED' && (
        <div className="mb-6 rounded-md border border-focus/20 bg-focus/5 p-5">
          <h4 className="text-sm font-semibold text-deep mb-4">
            AI is analyzing your report...
          </h4>
          <div className="flex items-center gap-1">
            {PIPELINE_STAGES.map((stage, i) => {
              const currentIndex = PIPELINE_STAGES.findIndex(s => s.key === processingStage.stage)
              const isDone = i < currentIndex
              const isCurrent = i === currentIndex
              return (
                <div key={stage.key} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    isDone ? 'bg-ok' : isCurrent ? 'bg-focus' : 'bg-line'
                  }`} />
                  <span className={`text-[10px] font-medium text-center leading-tight ${
                    isCurrent ? 'text-focus font-semibold' : isDone ? 'text-ok' : 'text-mid'
                  }`}>{stage.label}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-mid">{processingStage.message}</p>
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <EmptyState title="No documents yet" description="Click the + Upload button above to upload your first medical document." />
      ) : (
        <Card className="mb-6 overflow-hidden">
          <div className="divide-y divide-line">
            {documents.map((doc) => (
              <button
                key={doc.documentId}
                onClick={() => setSearchParams({ document: doc.documentId })}
                className={`block w-full text-left p-4 transition-colors hover:bg-slate-50 focus:outline-none focus:bg-slate-50 ${
                  selectedDocumentId === doc.documentId ? 'border-l-[3px] border-focus bg-focus/[0.03]' : 'border-l-[3px] border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="truncate text-sm font-semibold text-deep">{doc.fileName}</h3>
                  <StatusBadge status={doc.processingStatus} />
                </div>
                <div className="flex items-center gap-2 text-xs text-mid">
                  <span>{documentTypeLabel(doc.documentType)}</span>
                  <span>&middot;</span>
                  <span>{formatDateTime(doc.uploadedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedDocument ? <DocumentDetail document={selectedDocument} /> : null}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep/50 animate-enter backdrop-blur-sm" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="relative mx-4 w-full max-w-md rounded-md border border-line bg-surf p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => !uploading && setShowUploadModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-mid transition-colors hover:bg-line/50 hover:text-deep"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold text-deep">Upload document</h3>
            <p className="mt-1 text-sm text-mid">PDF only, max 15 MB. Blood & lab reports trigger AI analysis.</p>
            <form className="mt-5 space-y-4" onSubmit={async (e) => { await handleUpload(e); if (!error) setShowUploadModal(false) }}>
              <SelectField label="Document type" value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)}>
                {documentTypes.map((type) => <option key={type} value={type}>{documentTypeLabel(type)}</option>)}
              </SelectField>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-deep">PDF file</span>
                <input
                  className="block w-full rounded-md border border-line bg-surf px-3 py-2 text-sm text-deep file:mr-4 file:rounded-md file:border-0 file:bg-focus file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
              <Button className="w-full !bg-focus !text-white" type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload and process'}</Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function DocumentDetail({ document }: { document: DocumentResponse }) {
  const summaryText = document.insight?.summaryText || ''
  const categorized = document.parameters.map(parameterWithStatus)

  const anomalies = categorized.filter((p) => p.status === 'low' || p.status === 'high')
  const routineParameters = categorized.filter((p) => p.status === 'normal' || p.status === 'unknown')
  const normalCount = categorized.filter((p) => p.status === 'normal').length
  const totalWithRange = categorized.filter((p) => p.status !== 'unknown').length

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-deep">{document.fileName}</h2>
          <p className="mt-1 text-sm text-mid">{documentTypeLabel(document.documentType)} · Report date {formatDate(document.reportDate)}</p>
        </div>
        <StatusBadge status={document.processingStatus} />
      </div>

      {document.processingError ? <div className="px-5 pt-4"><Alert message={document.processingError} /></div> : null}

      <div className="space-y-8 p-5 sm:p-6">
        {totalWithRange > 0 && (
          <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-deep">
                {anomalies.length === 0 ? 'All measured values are within range' : `${anomalies.length} value${anomalies.length === 1 ? '' : 's'} flagged for review`}
              </h3>
              <p className="mt-1 text-sm text-mid">
                {anomalies.length === 0 ? 'No extracted values fall outside their reported reference range.' : 'Reference ranges are provided by the report and are not a diagnosis.'}
              </p>
            </div>
            <span className="tabular-nums text-xs font-medium text-mid">{normalCount} of {totalWithRange} in range</span>
          </div>
        )}

        {anomalies.length > 0 && (
          <section aria-labelledby="flagged-values-heading">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 id="flagged-values-heading" className="text-base font-semibold text-deep">Flagged values</h3>
              <span className="text-xs text-mid">Outside the report reference range</span>
            </div>
            <div className="space-y-3">
              {anomalies.map((parameter) => <FlaggedParameter key={`${parameter.parameterName}-${parameter.unit}`} parameter={parameter} />)}
            </div>
          </section>
        )}

        {summaryText && (
          <section className="border-l-[3px] border-focus/30 py-1 pl-4" aria-labelledby="ai-summary-heading">
            <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <h3 id="ai-summary-heading" className="text-xs font-medium text-deep">AI-generated summary</h3>
              <span className="text-[11px] text-soft">Based on this report</span>
            </div>
            <p className="max-w-[72ch] whitespace-pre-line text-sm leading-6 text-deep">{summaryText}</p>
          </section>
        )}

        <section aria-labelledby="extracted-parameters-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 id="extracted-parameters-heading" className="text-base font-semibold text-deep">Extracted parameters</h3>
            {anomalies.length > 0 ? <span className="text-xs text-mid">Flagged values are shown above</span> : null}
          </div>
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="min-w-[620px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-bg">
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Parameter</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Value</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Reference range</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {routineParameters.length === 0 && anomalies.length === 0 ? (
                  <tr><td className="px-4 py-4 text-mid" colSpan={5}>No extracted parameters available yet.</td></tr>
                ) : routineParameters.length === 0 ? (
                  <tr><td className="px-4 py-4 text-mid" colSpan={5}>All extracted values are flagged above for review.</td></tr>
                ) : (
                  routineParameters.map((p) => (
                    <tr key={`${p.parameterName}-${p.unit}`}>
                      <td className="px-4 py-2.5 font-medium text-deep">{p.parameterName}</td>
                      <td className="px-4 py-2.5 font-semibold tabular-nums text-deep">
                        {p.value} <span className="text-xs font-normal text-mid">{p.unit}</span>
                      </td>
                      <td className="px-4 py-2.5 text-mid tabular-nums">
                        {p.referenceRangeLow ?? '–'} – {p.referenceRangeHigh ?? '–'}
                      </td>
                      <td className="px-4 py-2.5">
                        {p.status === 'normal' && <span className="inline-flex items-center gap-1 text-xs font-medium text-ok">✓ Normal</span>}
                        {p.status === 'unknown' && <span className="text-xs font-medium text-mid">No range reported</span>}
                      </td>
                      <td className="px-4 py-2.5"><Confidence confidence={p.confidence} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Card>
  )
}

type ParameterStatus = 'high' | 'low' | 'normal' | 'unknown'
type CategorizedParameter = ParameterResponse & { status: ParameterStatus }

function parameterWithStatus(parameter: ParameterResponse): CategorizedParameter {
  if (parameter.referenceRangeLow == null || parameter.referenceRangeHigh == null) return { ...parameter, status: 'unknown' }
  if (parameter.value < parameter.referenceRangeLow) return { ...parameter, status: 'low' }
  if (parameter.value > parameter.referenceRangeHigh) return { ...parameter, status: 'high' }
  return { ...parameter, status: 'normal' }
}

function FlaggedParameter({ parameter }: { parameter: CategorizedParameter }) {
  const isHigh = parameter.status === 'high'
  const tone = isHigh
    ? { accent: 'border-alert', background: 'bg-alert/[0.04]', text: 'text-alert', label: '↑ High' }
    : { accent: 'border-attn', background: 'bg-attn/[0.04]', text: 'text-attn', label: '↓ Low' }
  const range = rangeDisplay(parameter)

  return (
    <article className={`border-l-[3px] ${tone.accent} ${tone.background} px-4 py-4 sm:px-5`}>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className={`text-xs font-semibold ${tone.text}`}>{tone.label}</p>
          <h4 className="mt-1 text-base font-semibold text-deep">{parameter.parameterName}</h4>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`tabular-nums text-2xl font-semibold leading-none ${tone.text}`}>{parameter.value}</span>
            <span className="text-sm text-mid">{parameter.unit}</span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-mid">Reference range</p>
          <p className="mt-1 tabular-nums text-sm font-medium text-deep">{parameter.referenceRangeLow} – {parameter.referenceRangeHigh} {parameter.unit}</p>
          <div className="mt-3 sm:justify-end"><Confidence confidence={parameter.confidence} /></div>
        </div>
      </div>
      <div className="mt-5">
        <div className="relative h-2 bg-line/70" aria-label={`Value ${parameter.value}; reported reference range ${parameter.referenceRangeLow} to ${parameter.referenceRangeHigh}`}>
          <span className="absolute inset-y-0 bg-ok/15" style={{ left: `${range.referenceStart}%`, width: `${range.referenceWidth}%` }} />
          <span className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surf ${isHigh ? 'bg-alert' : 'bg-attn'}`} style={{ left: `${range.valuePosition}%` }} />
        </div>
        <div className="mt-2 flex justify-between tabular-nums text-[11px] text-mid">
          <span>{range.minimum}</span>
          <span>Ref. {parameter.referenceRangeLow} – {parameter.referenceRangeHigh}</span>
          <span>{range.maximum}</span>
        </div>
      </div>
    </article>
  )
}

function Confidence({ confidence }: { confidence?: string }) {
  if (!confidence) return <span className="text-[11px] text-mid">Confidence unavailable</span>
  const color = confidence === 'HIGH' ? 'bg-ok' : confidence === 'MEDIUM' ? 'bg-attn' : 'bg-alert'
  return (
    <span className="inline-flex items-center gap-1.5" title={`AI extraction confidence: ${confidence}. HIGH = very reliable, MEDIUM = review recommended, LOW = manual verification needed.`}>
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[11px] font-semibold text-mid">{confidence} confidence</span>
    </span>
  )
}

function rangeDisplay(parameter: CategorizedParameter) {
  const low = parameter.referenceRangeLow!
  const high = parameter.referenceRangeHigh!
  const spread = high - low || 1
  const minimum = Math.min(low - spread * 0.2, parameter.value - spread * 0.1)
  const maximum = Math.max(high + spread * 0.2, parameter.value + spread * 0.1)
  const fullSpread = maximum - minimum
  return {
    minimum: Number(minimum.toFixed(1)),
    maximum: Number(maximum.toFixed(1)),
    referenceStart: ((low - minimum) / fullSpread) * 100,
    referenceWidth: (spread / fullSpread) * 100,
    valuePosition: ((parameter.value - minimum) / fullSpread) * 100,
  }
}
