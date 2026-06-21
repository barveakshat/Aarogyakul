import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { getDocument, listDocuments, uploadDocument } from '../api/documents'
import { getMember } from '../api/family'
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader, SelectField, StatusBadge } from '../components/ui'
import type { DocumentResponse, DocumentSummaryResponse, DocumentType, MemberResponse } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime } from '../utils/format'

const maxPdfSize = 15 * 1024 * 1024
const documentTypes: DocumentType[] = ['BLOOD_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER']

export default function UploadPage() {
  const { memberId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [member, setMember] = useState<MemberResponse | null>(null)
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('BLOOD_REPORT')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const selectedDocumentId = searchParams.get('document')

  const load = async () => {
    setError('')
    try {
      const [nextMember, nextDocuments] = await Promise.all([getMember(memberId), listDocuments(memberId)])
      setMember(nextMember)
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
        title={`Upload reports${member ? ` for ${member.fullName}` : ''}`}
        description="PDF uploads return immediately while the AI Report Reader extracts, parses, compares, summarizes, and updates the timeline asynchronously."
        action={<Link className="inline-flex rounded-btn border border-brd px-4 py-2 text-sm font-medium text-txtP hover:border-pri hover:text-pri" to={`/member/${memberId}`}>Back to profile</Link>}
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-txtP">New PDF upload</h2>
          <p className="mt-1 text-sm leading-6 text-txtS">Accepted file type is PDF only. Maximum size is 15MB.</p>
          <form className="mt-5 space-y-4" onSubmit={handleUpload}>
            <SelectField label="Document type" value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)}>
              {documentTypes.map((type) => <option key={type} value={type}>{documentTypeLabel(type)}</option>)}
            </SelectField>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-txtP">PDF file</span>
              <input
                className="block w-full rounded-btn border border-brd bg-white px-3 py-2 text-sm text-txtP file:mr-4 file:rounded-btn file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-pri"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>
            <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload and process'}</Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-brd px-5 py-4">
              <h2 className="text-base font-semibold text-txtP">Processing queue</h2>
            </div>
            {documents.length === 0 ? (
              <div className="p-5"><EmptyState title="No uploads yet" description="Uploaded PDFs will appear here with their processing status." /></div>
            ) : (
              <div className="divide-y divide-brd">
                {documents.map((doc) => (
                  <button
                    key={doc.documentId}
                    className="block w-full px-5 py-4 text-left transition-colors duration-200 hover:bg-slate-50"
                    onClick={() => setSearchParams({ document: doc.documentId })}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-txtP">{doc.fileName}</div>
                        <div className="mt-1 text-xs text-txtS">{documentTypeLabel(doc.documentType)} · Uploaded {formatDateTime(doc.uploadedAt)}</div>
                      </div>
                      <StatusBadge status={doc.processingStatus} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {selectedDocument ? <DocumentDetail document={selectedDocument} /> : null}
        </div>
      </div>
    </>
  )
}

function DocumentDetail({ document }: { document: DocumentResponse }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 border-b border-brd pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-txtP">{document.fileName}</h2>
          <p className="mt-1 text-sm text-txtS">{documentTypeLabel(document.documentType)} · Report date {formatDate(document.reportDate)}</p>
        </div>
        <StatusBadge status={document.processingStatus} />
      </div>
      {document.processingError ? <div className="mt-4"><Alert message={document.processingError} /></div> : null}
      {document.insight?.summaryText ? (
        <div className="mt-5 rounded-crd border border-blue-100 bg-blue-50 p-4">
          <div className="text-sm font-semibold text-txtP">AI summary</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{document.insight.summaryText}</p>
        </div>
      ) : null}
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-txtS">
            <tr>
              <th className="border-b border-brd px-3 py-2 font-semibold">Parameter</th>
              <th className="border-b border-brd px-3 py-2 font-semibold">Value</th>
              <th className="border-b border-brd px-3 py-2 font-semibold">Reference range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brd">
            {document.parameters.length === 0 ? (
              <tr><td className="px-3 py-4 text-txtS" colSpan={3}>No extracted parameters available yet.</td></tr>
            ) : (
              document.parameters.map((parameter) => (
                <tr key={`${parameter.parameterName}-${parameter.unit}`}>
                  <td className="px-3 py-2 font-medium text-txtP">{parameter.parameterName}</td>
                  <td className="px-3 py-2 font-semibold tabular-nums text-txtP">{parameter.value} {parameter.unit}</td>
                  <td className="px-3 py-2 text-txtS">{parameter.referenceRangeLow ?? '-'} - {parameter.referenceRangeHigh ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
