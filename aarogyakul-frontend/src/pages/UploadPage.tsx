import { FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getDocument, listDocuments, uploadDocument } from '../api/documents'
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader, SelectField, StatusBadge } from '../components/ui'
import type { DocumentResponse, DocumentSummaryResponse, DocumentType } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime } from '../utils/format'
import { Sparkles, Plus, X } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

const maxPdfSize = 15 * 1024 * 1024
const documentTypes: DocumentType[] = ['BLOOD_REPORT', 'LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'BILL', 'INSURANCE_DOC', 'MEDICAL_ID', 'OTHER']

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

  const selectedDocumentId = searchParams.get('document')

  const load = async () => {
    setError('')
    try {
      const nextDocuments = await listDocuments(memberId)
      setDocuments(nextDocuments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load upload workspace')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [memberId])

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null)
      return
    }
    void getDocument(selectedDocumentId).then(setSelectedDocument).catch((err) => setError(err instanceof Error ? err.message : 'Could not load document'))
  }, [selectedDocumentId])

  useEffect(() => {
    const hasActive = documents.some((doc) => doc.processingStatus === 'PENDING' || doc.processingStatus === 'PROCESSING')
    if (!hasActive) return
    const timer = window.setInterval(() => void load(), 5000)
    return () => window.clearInterval(timer)
  }, [documents])

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
            className="inline-flex items-center gap-2 rounded-btn bg-gradient-to-r from-pri to-sec px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            <Plus size={16} /> Upload
          </button>
        }
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}

      {/* Document cards grid */}
      {documents.length === 0 ? (
        <EmptyState title="No documents yet" description="Click the + Upload button above to upload your first medical document." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
          {documents.map((doc) => (
            <button
              key={doc.documentId}
              onClick={() => setSearchParams({ document: doc.documentId })}
              className={`block w-full text-left rounded-crd border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus:outline-none focus:ring-4 focus:ring-pri/10 ${
                selectedDocumentId === doc.documentId ? 'border-pri shadow-glow' : 'border-brd shadow-crd'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="truncate text-sm font-bold text-txtP">{doc.fileName}</h3>
                <StatusBadge status={doc.processingStatus} />
              </div>
              <p className="text-xs text-txtS">{documentTypeLabel(doc.documentType)}</p>
              <p className="mt-1 text-xs text-txtS">{formatDateTime(doc.uploadedAt)}</p>
            </button>
          ))}
        </div>
      )}

      {/* Selected document detail */}
      {selectedDocument ? <DocumentDetail document={selectedDocument} /> : null}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fdIn" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="relative mx-4 w-full max-w-md rounded-crd border border-brd bg-white p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => !uploading && setShowUploadModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-txtS transition-colors hover:bg-brd/50 hover:text-txtP"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-txtP">Upload document</h3>
            <p className="mt-1 text-sm text-txtS">PDF only, max 15 MB. Blood & lab reports trigger AI analysis.</p>
            <form className="mt-5 space-y-4" onSubmit={async (e) => { await handleUpload(e); if (!error) setShowUploadModal(false) }}>
              <SelectField label="Document type" value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)}>
                {documentTypes.map((type) => <option key={type} value={type}>{documentTypeLabel(type)}</option>)}
              </SelectField>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-txtP">PDF file</span>
                <input
                  className="block w-full rounded-2xl border border-brd bg-white/85 px-3 py-2 text-sm text-txtP file:mr-4 file:rounded-btn file:border-0 file:bg-gradient-to-r file:from-pri file:to-pri2 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
              <Button className="w-full" type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload and process'}</Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function DocumentDetail({ document }: { document: DocumentResponse }) {
  const [showRawSummary, setShowRawSummary] = useState(false)

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
    'all-ok': { bg: 'bg-norm/8', border: 'border-norm/20', icon: '✓', iconBg: 'bg-norm', title: 'All parameters within normal range', subtitle: 'No anomalies detected. Keep up the good work!', textColor: 'text-norm' },
    'attention': { bg: 'bg-warn/8', border: 'border-warn/20', icon: '!', iconBg: 'bg-warn', title: `${anomalies.length} parameter${anomalies.length > 1 ? 's' : ''} need${anomalies.length === 1 ? 's' : ''} attention`, subtitle: 'Some values are outside the reference range. Consider discussing with your doctor at your next visit.', textColor: 'text-warn' },
    'concerning': { bg: 'bg-crit/8', border: 'border-crit/20', icon: '!!', iconBg: 'bg-crit', title: `${anomalies.length} parameters outside normal range`, subtitle: 'Multiple values need attention. We recommend scheduling a consultation with your doctor.', textColor: 'text-crit' },
  }

  const status = statusConfig[overallStatus]

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-brd px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-black text-txtP">{document.fileName}</h2>
          <p className="mt-1 text-sm text-txtS">{documentTypeLabel(document.documentType)} · Report date {formatDate(document.reportDate)}</p>
        </div>
        <StatusBadge status={document.processingStatus} />
      </div>

      {document.processingError ? <div className="px-5 pt-4"><Alert message={document.processingError} /></div> : null}

      <div className="p-5 space-y-5">
        {/* ─── OVERALL STATUS BANNER ─── */}
        {totalWithRange > 0 && (
          <div className={`rounded-2xl border ${status.border} ${status.bg} p-4`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${status.iconBg} text-white text-sm font-black`}>
                {status.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm font-black ${status.textColor}`}>{status.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-txtS">{status.subtitle}</p>
                <div className="mt-2 text-xs font-medium text-txtS">
                  {normalCount}/{totalWithRange} parameters normal
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── ANOMALY ALERTS ─── */}
        {anomalies.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-txtS mb-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-warn/10 text-warn text-[10px] font-black">!</span>
              Flagged values
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {anomalies.map((p) => {
                const isHigh = p.status === 'high'
                return (
                  <div key={`${p.parameterName}-${p.unit}`} className={`rounded-xl border px-4 py-3 ${isHigh ? 'border-crit/20 bg-crit/[0.03]' : 'border-warn/20 bg-warn/[0.03]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-txtP">{p.parameterName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${isHigh ? 'bg-crit/10 text-crit' : 'bg-warn/10 text-warn'}`}>
                        {isHigh ? '↑ High' : '↓ Low'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className={`text-xl font-black tabular-nums ${isHigh ? 'text-crit' : 'text-warn'}`}>{p.value}</span>
                      <span className="text-xs text-txtS">{p.unit}</span>
                    </div>
                    <div className="mt-1 text-xs text-txtS">
                      Normal range: {p.referenceRangeLow} – {p.referenceRangeHigh} {p.unit}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── AI RAW SUMMARY (collapsible) ─── */}
        {summaryText && (
          <div>
            <button
              onClick={() => setShowRawSummary(!showRawSummary)}
              className="flex items-center gap-2 text-xs font-bold text-pri hover:underline transition-colors"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-pri/10">
                <Sparkles size={11} className="text-pri" />
              </div>
              {showRawSummary ? 'Hide detailed AI analysis' : 'View detailed AI analysis'}
              <span className="text-txtS">{showRawSummary ? '▲' : '▼'}</span>
            </button>
            {showRawSummary && (
              <div className="mt-3 rounded-xl border border-brd bg-slate-50/70 p-4">
                <p className="text-sm leading-7 text-txtS whitespace-pre-line">{summaryText}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── PARAMETERS TABLE ─── */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-txtS mb-3">All extracted parameters</h3>
          <div className="rounded-xl border border-brd overflow-hidden">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-txtS">Parameter</th>
                  <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-txtS">Value</th>
                  <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-txtS">Ref. Range</th>
                  <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-txtS">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brd/60">
                {categorized.length === 0 ? (
                  <tr><td className="px-4 py-4 text-txtS" colSpan={4}>No extracted parameters available yet.</td></tr>
                ) : (
                  categorized.map((p) => (
                    <tr key={`${p.parameterName}-${p.unit}`} className={p.status === 'high' || p.status === 'low' ? 'bg-crit/[0.02]' : ''}>
                      <td className="px-4 py-2.5 font-medium text-txtP">{p.parameterName}</td>
                      <td className={`px-4 py-2.5 font-bold tabular-nums ${
                        p.status === 'high' || p.status === 'low' ? 'text-crit' : 'text-txtP'
                      }`}>
                        {p.value} <span className="text-xs font-normal text-txtS">{p.unit}</span>
                      </td>
                      <td className="px-4 py-2.5 text-txtS tabular-nums">
                        {p.referenceRangeLow ?? '–'} – {p.referenceRangeHigh ?? '–'}
                      </td>
                      <td className="px-4 py-2.5">
                        {p.status === 'normal' && <span className="inline-flex items-center gap-1 rounded-full bg-norm/10 px-2 py-0.5 text-[10px] font-bold text-norm">✓ Normal</span>}
                        {p.status === 'high' && <span className="inline-flex items-center gap-1 rounded-full bg-crit/10 px-2 py-0.5 text-[10px] font-bold text-crit">↑ High</span>}
                        {p.status === 'low' && <span className="inline-flex items-center gap-1 rounded-full bg-warn/10 px-2 py-0.5 text-[10px] font-bold text-warn">↓ Low</span>}
                        {p.status === 'unknown' && <span className="inline-flex rounded-full bg-brd/50 px-2 py-0.5 text-[10px] font-bold text-txtS">—</span>}
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

