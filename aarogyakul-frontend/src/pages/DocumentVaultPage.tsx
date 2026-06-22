import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../context/ProfileContext'
import { listDocuments } from '../api/documents'
import { Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../components/ui'
import type { DocumentSummaryResponse, DocumentType } from '../types/api'
import { documentTypeLabel, formatDateTime } from '../utils/format'
import { FolderArchive, Upload, FileText, Receipt, Shield, CreditCard, FlaskConical } from 'lucide-react'

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
  const [activeCategory, setActiveCategory] = useState<DocumentType | 'ALL'>('ALL')

  useEffect(() => {
    if (!activeProfile) return
    setLoading(true)
    listDocuments(activeProfile.memberId)
      .then(setDocuments)
      .finally(() => setLoading(false))
  }, [activeProfile])

  const filtered = useMemo(
    () => activeCategory === 'ALL' ? documents : documents.filter((d) => d.documentType === activeCategory),
    [documents, activeCategory],
  )

  if (loading) return <LoadingState label="Loading vault" />

  return (
    <>
      <PageHeader
        title="Document Vault"
        description="Store and organize all your medical documents — reports, prescriptions, bills, insurance, and IDs."
        action={<Link className="inline-flex items-center gap-2 rounded-btn bg-gradient-to-r from-pri to-sec px-4 py-2 text-sm font-bold text-white shadow-glow" to="/app/upload"><Upload size={16} />Upload</Link>}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const count = cat.key === 'ALL' ? documents.length : documents.filter((d) => d.documentType === cat.key).length
          if (cat.key !== 'ALL' && count === 0) return null
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.key
                  ? 'bg-pri text-white shadow-lg'
                  : 'bg-white border border-brd text-txtS hover:border-pri/40 hover:text-pri'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                activeCategory === cat.key ? 'bg-white/20' : 'bg-brd/60'
              }`}>{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No documents yet" description="Upload your first document to start building your vault." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <Link key={doc.documentId} to={`/app/upload?document=${doc.documentId}`} className="block focus:outline-none focus:ring-4 focus:ring-pri/10 rounded-crd">
              <Card className="h-full p-5 transition duration-200 hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-txtP">{doc.fileName}</h3>
                    <p className="mt-1 text-xs text-txtS">{formatDateTime(doc.uploadedAt)}</p>
                  </div>
                  <StatusBadge status={doc.processingStatus} />
                </div>
                <div className="mt-3">
                  <span className="inline-flex rounded-full bg-pri/10 px-2.5 py-0.5 text-xs font-bold text-pri">
                    {documentTypeLabel(doc.documentType)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
