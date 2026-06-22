import { FormEvent, useEffect, useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { createTimelineEvent, deleteTimelineEvent, listTimeline } from '../api/documents'
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader, SelectField, TextAreaField, TextField } from '../components/ui'
import type { TimelineEventResponse, TimelineEventType } from '../types/api'
import { formatDate, timelineEventLabel } from '../utils/format'
import { Plus, Trash2, Stethoscope, FlaskConical, Syringe, Pill, FileText, Scissors, StickyNote, X } from 'lucide-react'

const eventTypeIcons: Record<TimelineEventType, React.ComponentType<{className?: string; size?: number}>> = {
  DOCUMENT_UPLOAD: FileText,
  DIAGNOSIS: Stethoscope,
  VACCINATION: Syringe,
  DOCTOR_VISIT: Stethoscope,
  SURGERY: Scissors,
  LAB_TEST: FlaskConical,
  MEDICATION_CHANGE: Pill,
  NOTE: StickyNote,
}

const manualEventTypes: { value: TimelineEventType; label: string }[] = [
  { value: 'DOCTOR_VISIT', label: 'Doctor Visit' },
  { value: 'LAB_TEST', label: 'Lab Test' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'DIAGNOSIS', label: 'Diagnosis' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'MEDICATION_CHANGE', label: 'Medication Change' },
  { value: 'NOTE', label: 'General Note' },
]

export default function TimelinePage() {
  const { activeProfile } = useProfile()
  const memberId = activeProfile?.memberId || ''
  const [events, setEvents] = useState<TimelineEventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const load = async () => {
    if (!memberId) return
    setError('')
    try {
      setEvents(await listTimeline(memberId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load timeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [memberId])

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Delete this timeline entry?')) return
    try {
      await deleteTimelineEvent(memberId, eventId)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete event')
    }
  }

  if (loading) return <LoadingState label="Loading timeline" />

  return (
    <>
      <PageHeader
        title={`${activeProfile?.fullName || ''} Timeline`}
        description="A chronological view of medical events — doctor visits, tests, uploads, and notes."
        action={
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-btn bg-gradient-to-r from-pri to-sec px-4 py-2 text-sm font-bold text-white shadow-glow">
            <Plus size={16} />Add Event
          </button>
        }
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}
      {events.length === 0 ? (
        <EmptyState title="Timeline is empty" description="Add your first event or upload a document to start building your health timeline." />
      ) : (
        <Card className="p-5">
          <div className="relative space-y-6 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-gradient-to-b before:from-pri before:to-sec">
            {events.map((event) => {
              const Icon = eventTypeIcons[event.eventType] || FileText
              return (
                <div key={event.id} className="relative flex gap-4">
                  <div className="z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pri to-sec text-white shadow-glow">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1 rounded-crd border border-brd bg-white/80 p-4 shadow-crd">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-txtS">{timelineEventLabel(event.eventType)}</div>
                        <h2 className="mt-1 text-base font-semibold text-txtP">{event.title}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <time className="text-sm font-medium text-txtS">{formatDate(event.eventDate)}</time>
                        {event.isManual && (
                          <button onClick={() => handleDelete(event.id)} className="rounded-full p-1.5 text-txtS hover:text-crit hover:bg-crit/10 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    {event.description ? <p className="mt-2 text-sm leading-6 text-txtS">{event.description}</p> : null}
                    {event.relatedDocumentId ? (
                      <a className="mt-3 inline-flex text-sm font-medium text-pri hover:underline" href={`/app/insights?document=${event.relatedDocumentId}`}>View related document</a>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {showAddModal && (
        <AddEventModal
          memberId={memberId}
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); void load() }}
        />
      )}
    </>
  )
}

function AddEventModal({ memberId, onClose, onCreated }: { memberId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', eventType: 'DOCTOR_VISIT' as TimelineEventType, eventDate: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createTimelineEvent(memberId, {
        title: form.title,
        eventType: form.eventType,
        eventDate: form.eventDate,
        description: form.description || undefined,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fdIn" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-md rounded-crd border border-brd bg-white p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-txtS transition-colors hover:bg-brd/50 hover:text-txtP">
          <X size={18} />
        </button>
        <h3 className="text-lg font-black text-txtP">Add timeline event</h3>
        <p className="mt-1 text-sm text-txtS">Record a doctor visit, test, vaccination, or note.</p>
        {error && <p className="mt-3 text-sm font-medium text-crit">{error}</p>}
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Annual check-up with Dr. Sharma" />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Event type" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value as TimelineEventType })}>
              {manualEventTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </SelectField>
            <TextField label="Date" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
          </div>
          <TextAreaField label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button className="w-full" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Event'}</Button>
        </form>
      </div>
    </div>
  )
}
