import { useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../context/ProfileContext'
import { listDocuments } from '../api/documents'
import { Card, EmptyState, LoadingState, PageHeader } from '../components/ui'
import type { DocumentSummaryResponse } from '../types/api'
import { documentTypeLabel, formatDate } from '../utils/format'
import { useEffect } from 'react'

export function InsightsPage() {
  const { activeProfile } = useProfile()
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProfile) return
    setLoading(true)
    listDocuments(activeProfile.memberId)
      .then(setDocuments)
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
              <div className="mb-4 h-2 rounded-full bg-gradient-to-r from-pri via-aqua to-sec" />
              <h2 className="text-base font-black text-txtP">{doc.fileName}</h2>
              <p className="mt-2 text-sm leading-6 text-txtS">{documentTypeLabel(doc.documentType)} · {formatDate(doc.reportDate)}</p>
              <Link className="mt-5 inline-flex rounded-btn bg-gradient-to-r from-pri to-sec px-4 py-2 text-sm font-bold text-white" to={`/app/upload?document=${doc.documentId}`}>
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
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-txtS mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-warn/10 text-warn text-xs">!</span>
            Allergies
            <span className="ml-auto rounded-full bg-brd/60 px-2 py-0.5 text-xs tabular-nums">{member.allergies.length}</span>
          </h3>
          {member.allergies.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-txtS">No allergies recorded</p>
          ) : (
            <ul className="space-y-2">
              {member.allergies.map((a) => (
                <li key={a.id} className="rounded-xl border border-brd bg-white/70 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-txtP">{a.allergen}</span>
                    {a.severity && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        a.severity === 'SEVERE' ? 'bg-crit/10 text-crit' :
                        a.severity === 'MODERATE' ? 'bg-warn/10 text-warn' :
                        'bg-norm/10 text-norm'
                      }`}>{a.severity.charAt(0) + a.severity.slice(1).toLowerCase()}</span>
                    )}
                  </div>
                  {a.notes && <p className="mt-1 text-xs leading-relaxed text-txtS">{a.notes}</p>}
                </li>
              ))}
            </ul>
          )}
          <Link to="/app/profile" className="mt-4 inline-flex text-sm font-bold text-pri hover:underline">Manage in profile →</Link>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-txtS mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-pri/10 text-pri text-xs">♥</span>
            Chronic Conditions
            <span className="ml-auto rounded-full bg-brd/60 px-2 py-0.5 text-xs tabular-nums">{member.chronicConditions.length}</span>
          </h3>
          {member.chronicConditions.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-txtS">No chronic conditions recorded</p>
          ) : (
            <ul className="space-y-2">
              {member.chronicConditions.map((c) => (
                <li key={c.id} className="rounded-xl border border-brd bg-white/70 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-txtP">{c.conditionName}</span>
                    {c.diagnosedDate && <span className="text-xs text-txtS">Since {formatDate(c.diagnosedDate)}</span>}
                  </div>
                  {c.notes && <p className="mt-1 text-xs leading-relaxed text-txtS">{c.notes}</p>}
                </li>
              ))}
            </ul>
          )}
          <Link to="/app/profile" className="mt-4 inline-flex text-sm font-bold text-pri hover:underline">Manage in profile →</Link>
        </Card>
      </div>
    </>
  )
}
