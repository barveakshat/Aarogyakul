import { useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../context/ProfileContext'
import { listDocuments } from '../api/documents'
import { Card, EmptyState, LoadingState, PageHeader } from '../components/ui'
import type { DocumentSummaryResponse } from '../types/api'
import { documentTypeLabel, formatDate } from '../utils/format'
import { useEffect } from 'react'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function InsightsPage() {
  const { activeProfile } = useProfile()
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProfile) return
    setLoading(true)
    listDocuments(activeProfile.memberId)
      .then(result => setDocuments(result.data))
      .finally(() => setLoading(false))
  }, [activeProfile])

  const completed = documents.filter((d) => d.processingStatus === 'COMPLETED')

  if (loading) return <LoadingState label="Loading insights" />

  return (
    <>
      <PageHeader title="AI Insights" description="Completed reports with extracted parameters and AI-generated summaries." />
      {completed.length === 0 ? (
        <EmptyState title="No AI insights yet" description="Upload a blood or lab report to generate AI-powered health insights." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {completed.map((doc) => (
            <Card key={doc.documentId} className="p-5">
              <div className="mb-4 h-1.5 rounded-full bg-focus" />
              <h2 className="font-display text-base font-semibold text-deep">{doc.fileName}</h2>
              <p className="mt-2 text-sm leading-6 text-mid">{documentTypeLabel(doc.documentType)} · {formatDate(doc.reportDate)}</p>
              <Link className="mt-5 inline-flex rounded-md bg-focus px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-focus/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2" to={`/app/insights?document=${doc.documentId}`}>
                Review insight
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export function ClinicalPage() {
  const { activeProfile } = useProfile()

  if (!activeProfile) return null

  const member = activeProfile

  return (
    <>
      <PageHeader title="Clinical Notes" description={`Allergies and chronic conditions for ${member.fullName}.`} />
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-mid mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-attn/10 text-attn text-xs font-bold">!</span>
            Allergies
            <span className="ml-auto rounded-full bg-line/60 px-2 py-0.5 text-xs tabular-nums text-mid">{member.allergies.length}</span>
          </h3>
          {member.allergies.length === 0 ? (
            <p className="rounded-md bg-bg px-3 py-2.5 text-sm text-mid">No allergies recorded</p>
          ) : (
            <ul className="space-y-2">
              {member.allergies.map((a) => (
                <li key={a.id} className="rounded-md border border-line bg-surf px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-deep">{a.allergen}</span>
                    {a.severity && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        a.severity === 'SEVERE' ? 'bg-alert/10 text-alert' :
                        a.severity === 'MODERATE' ? 'bg-attn/10 text-attn' :
                        'bg-ok/10 text-ok'
                      }`}>
                        {a.severity === 'SEVERE' ? <AlertTriangle size={12} strokeWidth={3} /> :
                         a.severity === 'MODERATE' ? <AlertCircle size={12} strokeWidth={3} /> :
                         <Info size={12} strokeWidth={3} />}
                        {a.severity.charAt(0) + a.severity.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                  {a.notes && <p className="mt-1 text-xs leading-relaxed text-mid">{a.notes}</p>}
                </li>
              ))}
            </ul>
          )}
          <Link to="/app/profile" className="mt-4 inline-flex text-sm font-semibold text-focus hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm">Manage in profile →</Link>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-mid mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-focus/8 text-focus text-xs font-bold">♥</span>
            Chronic Conditions
            <span className="ml-auto rounded-full bg-line/60 px-2 py-0.5 text-xs tabular-nums text-mid">{member.chronicConditions.length}</span>
          </h3>
          {member.chronicConditions.length === 0 ? (
            <p className="rounded-md bg-bg px-3 py-2.5 text-sm text-mid">No chronic conditions recorded</p>
          ) : (
            <ul className="space-y-2">
              {member.chronicConditions.map((c) => (
                <li key={c.id} className="rounded-md border border-line bg-surf px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-deep">{c.conditionName}</span>
                    {c.diagnosedDate && <span className="text-xs text-mid">Since {formatDate(c.diagnosedDate)}</span>}
                  </div>
                  {c.notes && <p className="mt-1 text-xs leading-relaxed text-mid">{c.notes}</p>}
                </li>
              ))}
            </ul>
          )}
          <Link to="/app/profile" className="mt-4 inline-flex text-sm font-semibold text-focus hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm">Manage in profile →</Link>
        </Card>
      </div>
    </>
  )
}
