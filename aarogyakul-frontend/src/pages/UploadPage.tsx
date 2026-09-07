import { FormEvent, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { getDocument, listDocuments, uploadDocument } from '../api/documents'
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader, SelectField, StatusBadge } from '../components/ui'
import type { DocumentResponse, DocumentSummaryResponse, DocumentType } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime } from '../utils/format'
import { Plus, X } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

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
      const uploaded = await uploadDocument(memberId, file, documentType)
      setFile(null)
      setSearchParams({ document: uploaded.documentId })
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

      {/* Selected document detail */}
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

  // Categorize parameters by status
  const categorized = document.parameters.map((p) => {
    const hasRange = p.referenceRangeLow != null && p.referenceRangeHigh != null
    if (!hasRange) return { ...p, status: 'unknown' as const }
    if (p.value < p.referenceRangeLow!) return { ...p, status: 'low' as const }
    if (p.value > p.referenceRangeHigh!) return { ...p, status: 'high' as const }
    return { ...p, status: 'normal' as const }
  })

  const anomalies = categorized.filter((p) => p.status === 'low' || p.status === 'high')
  const normalCount = categorized.filter((p) => p.status === 'normal').length
  const totalWithRange = categorized.filter((p) => p.status !== 'unknown').length

  // Overall status
  const overallStatus: 'all-ok' | 'attention' | 'concerning' =
    anomalies.length === 0 ? 'all-ok' :
    anomalies.length <= 2 ? 'attention' : 'concerning'

  const statusConfig = {
    'all-ok': { bg: 'bg-ok/8', border: 'border-ok/20', icon: '✓', iconBg: 'bg-ok', title: 'All parameters within normal range', subtitle: 'No anomalies detected. Keep up the good work!', textColor: 'text-ok' },
    'attention': { bg: 'bg-attn/8', border: 'border-attn/20', icon: '!', iconBg: 'bg-attn', title: `${anomalies.length} parameter${anomalies.length > 1 ? 's' : ''} need${anomalies.length === 1 ? 's' : ''} attention`, subtitle: 'Some values are outside the reference range. Consider discussing with your doctor at your next visit.', textColor: 'text-attn' },
    'concerning': { bg: 'bg-alert/8', border: 'border-alert/20', icon: '!!', iconBg: 'bg-alert', title: `${anomalies.length} parameters outside normal range`, subtitle: 'Multiple values need attention. We recommend scheduling a consultation with your doctor.', textColor: 'text-alert' },
  }

  const status = statusConfig[overallStatus]

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-deep">{document.fileName}</h2>
          <p className="mt-1 text-sm text-mid">{documentTypeLabel(document.documentType)} · Report date {formatDate(document.reportDate)}</p>
        </div>
        <StatusBadge status={document.processingStatus} />
      </div>

      {document.processingError ? <div className="px-5 pt-4"><Alert message={document.processingError} /></div> : null}

      <div className="p-5 space-y-5">
        {/* ─── OVERALL STATUS BANNER ─── */}
        {totalWithRange > 0 && (
          <div className={`rounded-2xl border ${status.border} ${status.bg} p-4`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${status.iconBg} text-white text-sm font-semibold`}>
                {status.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm font-semibold ${status.textColor}`}>{status.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mid">{status.subtitle}</p>
                <div className="mt-2 text-xs font-medium text-mid">
                  {normalCount}/{totalWithRange} parameters normal
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── ANOMALY ALERTS ─── */}
        {anomalies.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-mid mb-3">
              Flagged values
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {anomalies.map((p) => {
                const isHigh = p.status === 'high'
                const borderClass = isHigh ? 'border-alert' : 'border-attn'
                const bgClass = isHigh ? 'bg-alert/[0.04]' : 'bg-attn/[0.04]'
                const textClass = isHigh ? 'text-alert' : 'text-attn'
                
                return (
                  <div key={`${p.parameterName}-${p.unit}`} className={`border-l-[3px] p-4 ${bgClass} ${borderClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-deep">{p.parameterName}</span>
                      <span className={`text-[10px] font-bold uppercase ${textClass}`}>
                        {isHigh ? '↑ High' : '↓ Low'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className={`text-2xl font-semibold tabular-nums ${textClass}`}>{p.value}</span>
                      <span className="text-sm text-mid">{p.unit}</span>
                    </div>
                    <div className="text-xs text-mid flex items-center gap-2">
                      <span>Ref: {p.referenceRangeLow} – {p.referenceRangeHigh}</span>
                      <div className="h-1 w-16 bg-line/50 rounded-full overflow-hidden flex ml-auto">
                        {isHigh ? (
                          <>
                            <div className="h-full w-2/3 bg-ok/40" />
                            <div className="h-full w-1/3 bg-alert" />
                          </>
                        ) : (
                          <>
                            <div className="h-full w-1/3 bg-attn" />
                            <div className="h-full w-2/3 bg-ok/40" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── AI SUMMARY ─── */}
        {summaryText && (
          <div className="border-l-[3px] border-focus/30 pl-4 py-1">
            <h4 className="text-xs font-medium text-mid mb-2">AI-generated summary</h4>
            <p className="text-sm text-deep whitespace-pre-line leading-relaxed">{summaryText}</p>
          </div>
        )}

        {/* ─── PARAMETERS TABLE ─── */}
        <div>
          <h3 className="text-xs font-medium text-mid mb-3">All extracted parameters</h3>
          <div className="rounded-xl border border-line overflow-hidden">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Parameter</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Value</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Reference range</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-mid">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {categorized.length === 0 ? (
                  <tr><td className="px-4 py-4 text-mid" colSpan={5}>No extracted parameters available yet.</td></tr>
                ) : (
                  categorized.map((p) => (
                    <tr key={`${p.parameterName}-${p.unit}`} className={p.status === 'high' || p.status === 'low' ? 'bg-alert/[0.02]' : ''}>
                      <td className="px-4 py-2.5 font-medium text-deep">{p.parameterName}</td>
                      <td className={`px-4 py-2.5 font-semibold tabular-nums ${
                        p.status === 'high' || p.status === 'low' ? 'text-alert' : 'text-deep'
                      }`}>
                        {p.value} <span className="text-xs font-normal text-mid">{p.unit}</span>
                      </td>
                      <td className="px-4 py-2.5 text-mid tabular-nums">
                        {p.referenceRangeLow ?? '–'} – {p.referenceRangeHigh ?? '–'}
                      </td>
                      <td className="px-4 py-2.5">
                        {p.status === 'normal' && <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-semibold text-ok">✓ Normal</span>}
                        {p.status === 'high' && <span className="inline-flex items-center gap-1 rounded-full bg-alert/10 px-2 py-0.5 text-[10px] font-semibold text-alert">↑ High</span>}
                        {p.status === 'low' && <span className="inline-flex items-center gap-1 rounded-full bg-attn/10 px-2 py-0.5 text-[10px] font-semibold text-attn">↓ Low</span>}
                        {p.status === 'unknown' && <span className="inline-flex rounded-full bg-line/50 px-2 py-0.5 text-[10px] font-semibold text-mid">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        {p.confidence ? (
                          <span
                            className="inline-flex items-center gap-1.5"
                            title={`AI extraction confidence: ${p.confidence}. HIGH = very reliable, MEDIUM = review recommended, LOW = manual verification needed.`}
                          >
                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                              p.confidence === 'HIGH' ? 'bg-ok' :
                              p.confidence === 'MEDIUM' ? 'bg-attn' : 'bg-alert'
                            }`} />
                            <span className="text-[10px] font-semibold text-mid">{p.confidence}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-mid">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  )
}
