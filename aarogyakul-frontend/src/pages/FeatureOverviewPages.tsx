import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getMyFamily } from '../api/family'
import { listDocuments } from '../api/documents'
import { Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../components/ui'
import type { DocumentSummaryResponse, FamilyResponse, MemberResponse } from '../types/api'
import { documentTypeLabel, formatDateTime } from '../utils/format'

type MemberDocuments = { member: MemberResponse; documents: DocumentSummaryResponse[] }

function useFamilyDocuments() {
  const [family, setFamily] = useState<FamilyResponse | null>(null)
  const [rows, setRows] = useState<MemberDocuments[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const nextFamily = await getMyFamily()
        const nextRows = await Promise.all(
          nextFamily.members.map(async (member) => ({ member, documents: await listDocuments(member.memberId) })),
        )
        setFamily(nextFamily)
        setRows(nextRows)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return { family, rows, loading }
}

export function ReportsPage() {
  const { rows, loading } = useFamilyDocuments()
  const documents = useMemo(
    () => rows.flatMap(({ member, documents }) => documents.map((document) => ({ member, document }))),
    [rows],
  )

  if (loading) return <LoadingState label="Loading reports" />

  return (
    <>
      <PageHeader title="Reports" description="All uploaded medical PDFs across your family workspace, grouped into a processing-friendly view." />
      {documents.length === 0 ? (
        <EmptyState title="No reports yet" description="Open a member profile to upload the first PDF report." />
      ) : (
        <div className="grid gap-4">
          {documents.map(({ member, document }) => (
            <Card key={document.documentId} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-black text-txtP">{document.fileName}</div>
                  <p className="mt-1 text-sm text-txtS">{member.fullName} · {documentTypeLabel(document.documentType)} · {formatDateTime(document.uploadedAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={document.processingStatus} />
                  <Link className="rounded-btn border border-brd bg-white px-4 py-2 text-sm font-bold text-pri hover:border-pri" to={`/member/${member.memberId}/upload?document=${document.documentId}`}>
                    Open
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export function InsightsPage() {
  const { rows, loading } = useFamilyDocuments()
  const completed = rows.flatMap(({ member, documents }) =>
    documents.filter((document) => document.processingStatus === 'COMPLETED').map((document) => ({ member, document })),
  )

  if (loading) return <LoadingState label="Loading insights" />

  return (
    <>
      <PageHeader title="AI insights" description="A focused queue of completed reports that are ready for extracted parameters and summaries." />
      {completed.length === 0 ? (
        <EmptyState title="No AI insights yet" description="Completed report summaries will appear here after processing finishes." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {completed.map(({ member, document }) => (
            <Card key={document.documentId} className="p-5">
              <div className="mb-4 h-2 rounded-full bg-gradient-to-r from-pri via-aqua to-pri2" />
              <h2 className="text-base font-black text-txtP">{document.fileName}</h2>
              <p className="mt-2 text-sm leading-6 text-txtS">{member.fullName} · {documentTypeLabel(document.documentType)}</p>
              <Link className="mt-5 inline-flex rounded-btn bg-gradient-to-r from-pri to-pri2 px-4 py-2 text-sm font-bold text-white" to={`/member/${member.memberId}/upload?document=${document.documentId}`}>
                Review insight
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export function TimelinesPage() {
  const { family, loading } = useFamilyDocuments()
  if (loading) return <LoadingState label="Loading timeline shortcuts" />

  return (
    <>
      <PageHeader title="Timelines" description="Jump into each member's chronological health story from report uploads and generated events." />
      {!family?.members.length ? (
        <EmptyState title="No members yet" description="Add a member to unlock timeline navigation." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {family.members.map((member) => (
            <Card key={member.memberId} className="p-5">
              <h2 className="text-lg font-black text-txtP">{member.fullName}</h2>
              <p className="mt-1 text-sm text-txtS">{member.relationshipToOwner || 'Family member'}</p>
              <Link className="mt-5 inline-flex rounded-btn border border-brd bg-white px-4 py-2 text-sm font-bold text-pri hover:border-pri" to={`/member/${member.memberId}/timeline`}>
                Open timeline
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export function ClinicalPage() {
  const { family, loading } = useFamilyDocuments()
  if (loading) return <LoadingState label="Loading clinical notes" />

  return (
    <>
      <PageHeader title="Clinical notes" description="Allergies, chronic conditions, and profile details stay organized per family member." />
      {!family?.members.length ? (
        <EmptyState title="No clinical profiles yet" description="Add a member to start recording allergies and chronic conditions." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {family.members.map((member) => (
            <Card key={member.memberId} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-txtP">{member.fullName}</h2>
                  <p className="mt-1 text-sm text-txtS">{member.bloodGroup || 'Blood group not set'} · {member.gender || 'Gender not set'}</p>
                </div>
                <Link className="rounded-btn bg-mint px-4 py-2 text-sm font-bold text-pri" to={`/member/${member.memberId}`}>Edit</Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Allergies" value={member.allergies.length} />
                <Metric label="Conditions" value={member.chronicConditions.length} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-brd bg-white/70 p-4">
      <div className="text-2xl font-black text-pri">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wide text-txtS">{label}</div>
    </div>
  )
}
