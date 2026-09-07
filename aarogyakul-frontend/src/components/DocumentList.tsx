import { Link } from 'react-router'
import type { DocumentSummaryResponse } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime } from '../utils/format'
import { Card, EmptyState, StatusBadge } from './ui'

export function DocumentList({ documents, memberId }: { documents: DocumentSummaryResponse[]; memberId: string }) {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="Upload a PDF report to start the AI Report Reader pipeline and build this member's medical timeline."
        action={<Link className="inline-flex rounded-md bg-focus px-4 py-2 text-sm font-semibold text-white" to={`/member/${memberId}/upload`}>Upload report</Link>}
      />
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-display text-base font-semibold text-deep">Documents</h2>
      </div>
      <div className="divide-y divide-line">
        {documents.map((doc) => (
          <Link key={doc.documentId} to={`/member/${memberId}/upload?document=${doc.documentId}`} className="block px-5 py-4 transition-colors duration-150 hover:bg-bg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-deep">{doc.fileName}</div>
                <div className="mt-1 text-xs text-mid">{documentTypeLabel(doc.documentType)}, report date {formatDate(doc.reportDate)}</div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-mid">{formatDateTime(doc.uploadedAt)}</span>
                <StatusBadge status={doc.processingStatus} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
