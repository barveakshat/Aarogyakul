import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  addAllergy,
  addCondition,
  deleteAllergy,
  deleteCondition,
  deleteMember,
  getMember,
  updateMember,
  uploadProfilePhoto,
} from '../api/family'
import { listDocuments } from '../api/documents'
import { DocumentList } from '../components/DocumentList'
import { MemberForm } from '../components/MemberForm'
import { Alert, Button, Card, LoadingState, PageHeader, SelectField, TextAreaField, TextField } from '../components/ui'
import type { DocumentSummaryResponse, MemberResponse } from '../types/api'
import { formatDate, initials } from '../utils/format'
import { Pencil, X, Upload, ImagePlus } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

export default function MemberProfilePage() {
  const { activeProfile, clearProfile } = useProfile()
  const memberId = activeProfile?.memberId || ''
  const navigate = useNavigate()
  const [member, setMember] = useState<MemberResponse | null>(null)
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPhotoModal, setShowPhotoModal] = useState(false)

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
    clearProfile()
    navigate('/app/profiles')
  }

  if (loading) return <LoadingState label="Loading member profile" />
  if (!member) return <Alert message={error || 'Member not found'} />

  return (
    <>
      <PageHeader
        title={member.fullName}
        description="Profile, clinical notes, and AI-generated results."
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="relative group shrink-0">
                {member.profilePhotoUrl ? (
                  <img className="h-20 w-20 rounded-full object-cover shadow-crd" src={member.profilePhotoUrl} alt={`${member.fullName} profile`} />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pri/15 to-sec/15 text-lg font-black text-pri">{initials(member.fullName)}</div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-pri text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-sec"
                  title="Change photo"
                >
                  <Pencil size={13} />
                </button>
              </div>
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

      {showPhotoModal && member && (
        <PhotoUploadModal
          memberName={member.fullName}
          memberId={memberId}
          onClose={() => setShowPhotoModal(false)}
          onUploaded={async () => {
            setShowPhotoModal(false)
            await load()
          }}
        />
      )}
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

function PhotoUploadModal({
  memberName,
  memberId,
  onClose,
  onUploaded,
}: {
  memberName: string
  memberId: string
  onClose: () => void
  onUploaded: () => Promise<void>
}) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB')
      return
    }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      await uploadProfilePhoto(memberId, file)
      await onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fdIn" onClick={onClose}>
      <div
        className="relative mx-4 w-full max-w-md rounded-crd border border-brd bg-white p-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-txtS transition-colors hover:bg-brd/50 hover:text-txtP"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-black text-txtP">Update profile photo</h3>
        <p className="mt-1 text-sm text-txtS">Upload a new photo for {memberName}</p>

        <div
          className={`mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors duration-200 ${
            dragActive
              ? 'border-pri bg-pri/5'
              : preview
                ? 'border-brd bg-white'
                : 'border-brd bg-slate-50/50 hover:border-pri/50 hover:bg-pri/[0.02]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="flex flex-col items-center gap-4">
              <img src={preview} alt="Preview" className="h-28 w-28 rounded-full object-cover shadow-crd" />
              <button
                type="button"
                className="text-sm font-semibold text-pri hover:underline"
                onClick={() => { setPreview(null); setFile(null) }}
              >
                Choose different image
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pri/10">
                <ImagePlus size={26} className="text-pri" />
              </div>
              <p className="text-sm font-semibold text-txtP">Drag & drop an image here</p>
              <p className="mt-1 text-xs text-txtS">or click to browse · JPG, PNG up to 5 MB</p>
              <button
                type="button"
                className="mt-4 rounded-btn border border-brd bg-white px-4 py-2 text-sm font-bold text-pri transition-colors hover:border-pri hover:bg-pri/5"
                onClick={() => inputRef.current?.click()}
              >
                Browse files
              </button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>

        {error && <p className="mt-3 text-sm font-medium text-crit">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={handleUpload} disabled={!file || uploading}>
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
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
