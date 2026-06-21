import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  addAllergy,
  addCondition,
  deleteAllergy,
  deleteCondition,
  deleteMember,
  getMember,
  updateMember,
} from '../api/family'
import { listDocuments } from '../api/documents'
import { DocumentList } from '../components/DocumentList'
import { MemberForm } from '../components/MemberForm'
import { Alert, Button, Card, LoadingState, PageHeader, SelectField, TextAreaField, TextField } from '../components/ui'
import type { DocumentSummaryResponse, MemberResponse } from '../types/api'
import { formatDate, initials } from '../utils/format'

export default function MemberProfilePage() {
  const { memberId = '' } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState<MemberResponse | null>(null)
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [nextMember, nextDocuments] = await Promise.all([getMember(memberId), listDocuments(memberId)])
      setMember(nextMember)
      setDocuments(nextDocuments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load member')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [memberId])

  const handleDelete = async () => {
    if (!window.confirm('Delete this member and their linked records?')) return
    await deleteMember(memberId)
    navigate('/app')
  }

  if (loading) return <LoadingState label="Loading member profile" />
  if (!member) return <Alert message={error || 'Member not found'} />

  return (
    <>
      <PageHeader
        title={member.fullName}
        description="Profile, clinical notes, reports, and AI-generated results for this family member."
        action={<Link className="inline-flex rounded-btn bg-gradient-to-r from-pri to-pri2 px-4 py-2 text-sm font-bold text-white shadow-glow" to={`/member/${memberId}/upload`}>Upload PDF</Link>}
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              {member.profilePhotoUrl ? (
                <img className="h-20 w-20 rounded-3xl object-cover shadow-crd" src={member.profilePhotoUrl} alt={`${member.fullName} profile`} />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-mint to-emerald-100 text-lg font-black text-pri">{initials(member.fullName)}</div>
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-black text-txtP">{member.fullName}</h2>
                <p className="text-sm text-txtS">{member.relationshipToOwner || 'Family member'}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <ProfileFact label="Date of birth" value={formatDate(member.dateOfBirth)} />
              <ProfileFact label="Gender" value={member.gender || 'Not set'} />
              <ProfileFact label="Blood group" value={member.bloodGroup || 'Not set'} />
              <ProfileFact label="Reports" value={String(documents.length)} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-black text-txtP">Edit profile</h2>
            <div className="mt-5">
              <MemberForm
                initial={member}
                submitLabel="Save changes"
                onSubmit={async (payload) => {
                  setMember(await updateMember(memberId, payload))
                }}
              />
            </div>
            <div className="mt-5 border-t border-brd pt-5">
              <Button variant="danger" onClick={handleDelete}>Delete member</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <ClinicalList
            title="Allergies"
            empty="No allergies recorded."
            items={member.allergies.map((item) => ({ id: item.id, title: item.allergen, meta: item.severity, notes: item.notes }))}
            onDelete={async (id) => {
              await deleteAllergy(memberId, id)
              await load()
            }}
            form={<AllergyForm memberId={memberId} onSaved={load} />}
          />
          <ClinicalList
            title="Chronic conditions"
            empty="No chronic conditions recorded."
            items={member.chronicConditions.map((item) => ({ id: item.id, title: item.conditionName, meta: formatDate(item.diagnosedDate), notes: item.notes }))}
            onDelete={async (id) => {
              await deleteCondition(memberId, id)
              await load()
            }}
            form={<ConditionForm memberId={memberId} onSaved={load} />}
          />
          <DocumentList documents={documents} memberId={memberId} />
          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-txtP">Timeline</h2>
                <p className="mt-1 text-sm text-txtS">Review document events and extracted report summaries chronologically.</p>
              </div>
              <Link className="inline-flex rounded-btn border border-brd bg-white px-4 py-2 text-sm font-bold text-pri hover:border-pri" to={`/member/${memberId}/timeline`}>Open timeline</Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-txtS">{label}</dt>
      <dd className="mt-1 font-medium text-txtP">{value}</dd>
    </div>
  )
}

function ClinicalList({
  title,
  empty,
  items,
  onDelete,
  form,
}: {
  title: string
  empty: string
  items: { id: string; title?: string; meta?: string; notes?: string }[]
  onDelete: (id: string) => Promise<void>
  form: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-black text-txtP">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="rounded-2xl bg-mint/40 px-3 py-2 text-sm text-txtS">{empty}</p> : null}
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-brd bg-white/70 px-3 py-2">
            <div>
              <div className="text-sm font-medium text-txtP">{item.title}</div>
              {item.meta ? <div className="mt-0.5 text-xs text-txtS">{item.meta}</div> : null}
              {item.notes ? <p className="mt-1 text-sm text-txtS">{item.notes}</p> : null}
            </div>
            <Button variant="ghost" className="px-2 py-1" onClick={() => void onDelete(item.id)}>Remove</Button>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-brd pt-5">{form}</div>
    </Card>
  )
}

function AllergyForm({ memberId, onSaved }: { memberId: string; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ allergen: '', severity: '', notes: '' })
  return (
    <form
      className="grid gap-3 sm:grid-cols-3"
      onSubmit={(event: FormEvent) => {
        event.preventDefault()
        void addAllergy(memberId, { allergen: form.allergen, severity: form.severity || undefined, notes: form.notes || undefined }).then(async () => {
          setForm({ allergen: '', severity: '', notes: '' })
          await onSaved()
        })
      }}
    >
      <TextField label="Allergen" value={form.allergen} onChange={(event) => setForm({ ...form, allergen: event.target.value })} required />
      <SelectField label="Severity" value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}>
        <option value="">Select</option>
        <option value="MILD">Mild</option>
        <option value="MODERATE">Moderate</option>
        <option value="SEVERE">Severe</option>
      </SelectField>
      <TextField label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      <div className="sm:col-span-3"><Button type="submit" variant="secondary">Add allergy</Button></div>
    </form>
  )
}

function ConditionForm({ memberId, onSaved }: { memberId: string; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ conditionName: '', diagnosedDate: '', notes: '' })
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event: FormEvent) => {
        event.preventDefault()
        void addCondition(memberId, {
          conditionName: form.conditionName,
          diagnosedDate: form.diagnosedDate || undefined,
          notes: form.notes || undefined,
        }).then(async () => {
          setForm({ conditionName: '', diagnosedDate: '', notes: '' })
          await onSaved()
        })
      }}
    >
      <TextField label="Condition" value={form.conditionName} onChange={(event) => setForm({ ...form, conditionName: event.target.value })} required />
      <TextField label="Diagnosed date" type="date" value={form.diagnosedDate} onChange={(event) => setForm({ ...form, diagnosedDate: event.target.value })} />
      <div className="sm:col-span-2">
        <TextAreaField label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </div>
      <div className="sm:col-span-2"><Button type="submit" variant="secondary">Add condition</Button></div>
    </form>
  )
}
