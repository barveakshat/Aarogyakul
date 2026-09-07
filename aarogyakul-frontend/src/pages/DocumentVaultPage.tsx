import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../context/ProfileContext'
import { listDocuments, uploadDocument } from '../api/documents'
import { Card, EmptyState, LoadingState, PageHeader, SelectField, StatusBadge } from '../components/ui'
import { useToast } from '../components/Toast'
import type { DocumentSummaryResponse, DocumentType } from '../types/api'
import { documentTypeLabel, formatDateTime } from '../utils/format'
import { FolderArchive, Upload, FileText, Receipt, Shield, CreditCard, FlaskConical, Loader2, X } from 'lucide-react'

const PAGE_SIZE = 20

const categories: { key: DocumentType | 'ALL'; label: string; icon: React.ComponentType<{className?: string}> }[] = [
  { key: 'ALL', label: 'All', icon: FolderArchive },
  { key: 'BLOOD_REPORT', label: 'Blood Reports', icon: FlaskConical },
  { key: 'LAB_REPORT', label: 'Lab Reports', icon: FlaskConical },
  { key: 'PRESCRIPTION', label: 'Prescriptions', icon: FileText },
  { key: 'BILL', label: 'Bills', icon: Receipt },
  { key: 'INSURANCE_DOC', label: 'Insurance', icon: Shield },
  { key: 'MEDICAL_ID', label: 'Medical IDs', icon: CreditCard },
  { key: 'DISCHARGE_SUMMARY', label: 'Discharge', icon: FileText },
  { key: 'OTHER', label: 'Other', icon: FileText },
]

export default function DocumentVaultPage() {
  const { activeProfile } = useProfile()
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)
  const [activeCategory, setActiveCategory] = useState<DocumentType | 'ALL'>('ALL')

  const loadPage = useCallback(async (pageNum: number, append: boolean) => {
    if (!activeProfile) return
    append ? setLoadingMore(true) : setLoading(true)
    try {
      const result = await listDocuments(activeProfile.memberId, pageNum, PAGE_SIZE)
      setDocuments(prev => append ? [...prev, ...result.data] : result.data)
      setHasMore(result.hasMore)
      setPage(pageNum)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeProfile])

  useEffect(() => {
    setDocuments([])
    setPage(0)
    void loadPage(0, false)
  }, [activeProfile, loadPage])

  const filtered = useMemo(
    () => activeCategory === 'ALL' ? documents : documents.filter((d) => d.documentType === activeCategory),
    [documents, activeCategory],
  )

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<DocumentType>('BLOOD_REPORT')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const documentTypes: DocumentType[] = ['BLOOD_REPORT', 'LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'BILL', 'INSURANCE_DOC', 'MEDICAL_ID', 'OTHER']

  const handleUpload = async () => {
    if (!uploadFile || !activeProfile) return
    setUploading(true)
    try {
      await uploadDocument(activeProfile.memberId, uploadFile, uploadType)
      toast('Document uploaded', 'success')
      setShowUploadModal(false)
      setUploadFile(null)
      void loadPage(0, false)
    } catch (err: any) {
      toast(err.message || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingState label="Loading vault" />

  return (
    <>
      <PageHeader
        title="Document Vault"
        description="Store and organize all your medical documents — reports, prescriptions, bills, insurance, and IDs."
        action={<button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 rounded-md bg-focus px-4 py-2 text-sm font-semibold text-white shadow-md"><Upload size={16} />Upload</button>}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const count = cat.key === 'ALL' ? documents.length : documents.filter((d) => d.documentType === cat.key).length
          if (cat.key !== 'ALL' && count === 0) return null
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.key
                  ? 'bg-focus text-white shadow-md'
                  : 'bg-white border border-line text-mid hover:border-focus/40 hover:text-focus'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                activeCategory === cat.key ? 'bg-white/20' : 'bg-line/60'
              }`}>{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload your first document to start building your vault."
          action={<button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 rounded-md bg-focus px-4 py-2 text-sm font-semibold text-white shadow-md"><Upload size={16} />Upload Document</button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-line">
            {filtered.map((doc) => (
              <Link key={doc.documentId} to={`/app/insights?document=${doc.documentId}`} className="block focus:outline-none focus:bg-focus/8 hover:bg-focus/8 transition-colors p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-deep">{doc.fileName}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-focus/8 px-2.5 py-0.5 text-xs font-semibold text-focus">
                        {documentTypeLabel(doc.documentType)}
                      </span>
                      <span className="text-xs text-mid">{formatDateTime(doc.uploadedAt)}</span>
                    </div>
                  </div>
                  <StatusBadge status={doc.processingStatus} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => void loadPage(page + 1, true)}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-6 py-2.5 text-sm font-medium text-deep shadow-sm transition-all hover:border-focus/40 hover:shadow-md disabled:opacity-60"
          >
            {loadingMore ? (
              <><Loader2 size={16} className="animate-spin" />Loading...</>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-enter" onClick={() => setShowUploadModal(false)}>
          <div className="relative mx-4 w-full max-w-sm rounded-md border border-line bg-white p-6 shadow-md" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowUploadModal(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-mid hover:bg-line/50 hover:text-deep"><X size={18} /></button>
            <h3 className="font-display text-base font-semibold text-deep">Upload Document</h3>
            <p className="mt-1 text-sm text-mid">Select a file and document type.</p>
            <div className="mt-5 space-y-4">
              <SelectField label="Document type" value={uploadType} onChange={e => setUploadType(e.target.value as DocumentType)}>
                {documentTypes.map(t => <option key={t} value={t}>{documentTypeLabel(t)}</option>)}
              </SelectField>
              <div>
                <label className="block text-xs font-semibold text-mid mb-1.5">File (PDF, max 15 MB)</label>
                <input ref={fileRef} type="file" accept=".pdf" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="block w-full text-sm text-mid file:mr-3 file:rounded-md file:border-0 file:bg-focus/8 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-focus hover:file:bg-focus/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUploadModal(false)} className="flex-1 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-deep hover:bg-line/30">Cancel</button>
                <button onClick={handleUpload} disabled={!uploadFile || uploading} className="flex-1 rounded-md bg-focus px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
