import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../context/ProfileContext'
import { listDocuments } from '../api/documents'
import { listTimeline } from '../api/documents'
import { Card, LoadingState, PageHeader } from '../components/ui'
import type { DocumentSummaryResponse, TimelineEventResponse } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime, timelineEventLabel } from '../utils/format'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Upload, FolderArchive, Plus } from 'lucide-react'

const healthTrendData = [
  { month: 'Jan', score: 72 },
  { month: 'Feb', score: 74 },
  { month: 'Mar', score: 71 },
  { month: 'Apr', score: 78 },
  { month: 'May', score: 82 },
  { month: 'Jun', score: 85 },
]

export default function DashboardPage() {
  const { activeProfile } = useProfile()
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [timeline, setTimeline] = useState<TimelineEventResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProfile) return
    setLoading(true)
    Promise.all([
      listDocuments(activeProfile.memberId),
      listTimeline(activeProfile.memberId),
    ]).then(([docs, events]) => {
      setDocuments(docs)
      setTimeline(events)
    }).finally(() => setLoading(false))
  }, [activeProfile])

  if (loading) return <LoadingState label="Loading dashboard" />
  if (!activeProfile) return null

  const recentDocs = documents.slice(0, 4)
  const recentEvents = timeline.slice(0, 5)

  return (
    <>
      <PageHeader
        title={`Welcome, ${activeProfile.fullName}`}
        description="Your personal health command center — documents, timeline, and clinical notes."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Documents" value={documents.length} />
        <StatCard label="Timeline Events" value={timeline.length} />
        <StatCard label="Allergies" value={activeProfile.allergies.length} />
        <StatCard label="Conditions" value={activeProfile.chronicConditions.length} />
      </div>

      <Card className="mb-6 p-5">
        <h2 className="mb-1 text-base font-black text-txtP">Health Score Trend</h2>
        <p className="mb-4 text-sm text-txtS">Wellness indicator over the past 6 months</p>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '8px 14px' }} labelStyle={{ color: '#94A3B8' }} />
              <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} fill="url(#healthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <QuickLink title="Upload document" text="Add a report, prescription, bill, or ID to your vault." to="/app/insights" icon={Upload} />
        <QuickLink title="Document vault" text="Browse and search all your stored documents." to="/app/vault" icon={FolderArchive} />
        <QuickLink title="Add timeline event" text="Log a doctor visit, test, or health note." to="/app/timeline" icon={Plus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-txtP">Recent Documents</h2>
            <Link to="/app/vault" className="text-sm font-bold text-pri hover:underline">View all</Link>
          </div>
          {recentDocs.length === 0 ? (
            <p className="text-sm text-txtS py-4">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <Link key={doc.documentId} to={`/app/insights?document=${doc.documentId}`} className="flex items-center justify-between rounded-xl border border-brd bg-white/70 px-3 py-2.5 hover:border-pri/30 transition-colors">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-txtP">{doc.fileName}</div>
                    <div className="text-xs text-txtS">{documentTypeLabel(doc.documentType)}</div>
                  </div>
                  <span className="shrink-0 text-xs text-txtS">{formatDateTime(doc.uploadedAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-txtP">Recent Timeline</h2>
            <Link to="/app/timeline" className="text-sm font-bold text-pri hover:underline">View all</Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-txtS py-4">No timeline events yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-xl border border-brd bg-white/70 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-txtP">{event.title}</div>
                    <div className="text-xs text-txtS">{timelineEventLabel(event.eventType)}</div>
                  </div>
                  <span className="shrink-0 text-xs text-txtS">{formatDate(event.eventDate)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="text-3xl font-black text-pri">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-txtS">{label}</div>
    </Card>
  )
}

function QuickLink({ title, text, to, icon: Icon }: { title: string; text: string; to: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link to={to} className="block rounded-crd outline-none focus:ring-4 focus:ring-pri/10">
      <Card className="h-full p-5 transition duration-200 hover:-translate-y-1 hover:shadow-glow">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-pri/10 to-sec/10">
          <Icon className="h-5 w-5 text-pri" />
        </div>
        <h2 className="text-base font-black text-txtP">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-txtS">{text}</p>
      </Card>
    </Link>
  )
}
