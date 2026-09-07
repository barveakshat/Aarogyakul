import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../context/ProfileContext'
import { listDocuments } from '../api/documents'
import { listTimeline } from '../api/documents'
import { getTrackedParameters, getParameterTrend } from '../api/parameters'
import { Card, LoadingState, PageHeader } from '../components/ui'
import type { DocumentSummaryResponse, ParameterTrendResponse, TimelineEventResponse } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime, timelineEventLabel } from '../utils/format'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Upload, FolderArchive, Plus, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { activeProfile } = useProfile()
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [timeline, setTimeline] = useState<TimelineEventResponse[]>([])
  const [trend, setTrend] = useState<ParameterTrendResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProfile) return
    setLoading(true)
    Promise.all([
      listDocuments(activeProfile.memberId),
      listTimeline(activeProfile.memberId),
      getTrackedParameters(activeProfile.memberId),
    ]).then(async ([docsResult, eventsResult, tracked]) => {
      setDocuments(docsResult.data)
      setTimeline(eventsResult.data)
      // Load trend for first tracked parameter (if any)
      if (tracked.parameterNames.length > 0) {
        const trendData = await getParameterTrend(activeProfile.memberId, tracked.parameterNames[0])
        setTrend(trendData)
      }
    }).finally(() => setLoading(false))
  }, [activeProfile])

  if (loading) return <LoadingState label="Loading dashboard" />
  if (!activeProfile) return null

  const recentDocs = documents.slice(0, 4)
  const recentEvents = timeline.slice(0, 5)

  const chartData = trend?.dataPoints.map(dp => ({
    date: dp.date,
    value: dp.value,
  })) ?? []

  return (
    <>
      <PageHeader
        title={`Welcome, ${activeProfile.fullName}`}
        description="Your personal health command center — documents, timeline, and clinical notes."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Documents" value={documents.length} />
        <StatCard label="Timeline events" value={timeline.length} />
        <StatCard label="Allergies" value={activeProfile.allergies.length} />
        <StatCard label="Conditions" value={activeProfile.chronicConditions.length} />
      </div>

      {chartData.length >= 2 && trend && (
        <Card className="mb-6 p-5">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-deep">{trend.parameterName} Trend</h2>
              <p className="text-sm text-mid">Your latest tracked parameter over time</p>
            </div>
            <Link to="/app/trends" className="inline-flex items-center gap-1.5 text-sm font-semibold text-focus hover:underline">
              <TrendingUp size={14} />View all trends
            </Link>
          </div>
          <div className="mt-4 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '8px 14px' }}
                  labelStyle={{ color: '#94A3B8' }}
                  formatter={(value: number) => [`${value} ${trend.unit}`, trend.parameterName]}
                />
                <Area type="monotone" dataKey="value" stroke="#3B5FCC" strokeWidth={2.5} fill="#3B5FCC" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <QuickLink title="Upload document" text="Add a report, prescription, bill, or ID to your vault." to="/app/insights" icon={Upload} />
        <QuickLink title="Document vault" text="Browse and search all your stored documents." to="/app/vault" icon={FolderArchive} />
        <QuickLink title="Add timeline event" text="Log a doctor visit, test, or health note." to="/app/timeline" icon={Plus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-deep">Recent Documents</h2>
            <Link to="/app/vault" className="text-sm font-semibold text-focus hover:underline">View all</Link>
          </div>
          {recentDocs.length === 0 ? (
            <p className="text-sm text-mid py-4">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <Link key={doc.documentId} to={`/app/insights?document=${doc.documentId}`} className="flex items-center justify-between rounded-md border border-line bg-white/70 px-3 py-2.5 hover:border-focus/30 transition-colors">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-deep">{doc.fileName}</div>
                    <div className="text-xs text-mid">{documentTypeLabel(doc.documentType)}</div>
                  </div>
                  <span className="shrink-0 text-xs text-mid">{formatDateTime(doc.uploadedAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-deep">Recent Timeline</h2>
            <Link to="/app/timeline" className="text-sm font-semibold text-focus hover:underline">View all</Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-mid py-4">No timeline events yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-md border border-line bg-white/70 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-deep">{event.title}</div>
                    <div className="text-xs text-mid">{timelineEventLabel(event.eventType)}</div>
                  </div>
                  <span className="shrink-0 text-xs text-mid">{formatDate(event.eventDate)}</span>
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
      <div className="text-3xl font-bold text-focus">{value}</div>
      <div className="mt-1 text-xs font-semibold text-mid">{label}</div>
    </Card>
  )
}

function QuickLink({ title, text, to, icon: Icon }: { title: string; text: string; to: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link to={to} className="block rounded-md outline-none focus:ring-4 focus:ring-focus/8">
      <Card className="h-full p-5 transition duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-focus/8">
          <Icon className="h-5 w-5 text-focus" />
        </div>
        <h2 className="font-display text-base font-semibold text-deep">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-mid">{text}</p>
      </Card>
    </Link>
  )
}
