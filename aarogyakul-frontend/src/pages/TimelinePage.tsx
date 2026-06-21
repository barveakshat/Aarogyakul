import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { listTimeline } from '../api/documents'
import { getMember } from '../api/family'
import { Alert, Card, EmptyState, LoadingState, PageHeader } from '../components/ui'
import type { MemberResponse, TimelineEventResponse } from '../types/api'
import { formatDate, timelineEventLabel } from '../utils/format'

export default function TimelinePage() {
  const { memberId = '' } = useParams()
  const [member, setMember] = useState<MemberResponse | null>(null)
  const [events, setEvents] = useState<TimelineEventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      try {
        const [nextMember, nextEvents] = await Promise.all([getMember(memberId), listTimeline(memberId)])
        setMember(nextMember)
        setEvents(nextEvents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load timeline')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [memberId])

  if (loading) return <LoadingState label="Loading timeline" />

  return (
    <>
      <PageHeader
        title={`${member?.fullName || 'Member'} timeline`}
        description="A chronological view of report uploads and medical events created by the AI processing pipeline."
        action={<Link className="inline-flex rounded-btn border border-brd bg-white px-4 py-2 text-sm font-bold text-pri hover:border-pri" to={`/member/${memberId}`}>Back to profile</Link>}
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}
      {events.length === 0 ? (
        <EmptyState title="Timeline is empty" description="Upload a report to create the first timeline event for this member." />
      ) : (
        <Card className="p-5">
          <div className="relative space-y-6 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-gradient-to-b before:from-pri before:to-pri2">
            {events.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                <div className="z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pri to-pri2 text-xs font-black text-white shadow-glow">
                  {timelineEventLabel(event.eventType).slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1 rounded-crd border border-brd bg-white/80 p-4 shadow-crd">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-txtS">{timelineEventLabel(event.eventType)}</div>
                      <h2 className="mt-1 text-base font-semibold text-txtP">{event.title}</h2>
                    </div>
                    <time className="text-sm font-medium text-txtS">{formatDate(event.eventDate)}</time>
                  </div>
                  {event.description ? <p className="mt-2 text-sm leading-6 text-txtS">{event.description}</p> : null}
                  {event.relatedDocumentId ? (
                    <Link className="mt-3 inline-flex text-sm font-medium text-pri hover:underline" to={`/member/${memberId}/upload?document=${event.relatedDocumentId}`}>View related document</Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
