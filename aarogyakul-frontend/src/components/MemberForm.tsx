import { FormEvent, useState } from 'react'
import type { MemberRequest, MemberResponse } from '../types/api'
import { Button, SelectField, TextField } from './ui'
import { PhotoUpload } from './PhotoUpload'

const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = ['', 'Female', 'Male', 'Non-binary', 'Prefer not to say']

export function MemberForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: MemberResponse
  submitLabel: string
  onSubmit: (payload: MemberRequest) => Promise<void>
}) {
  const [form, setForm] = useState<MemberRequest>({
    fullName: initial?.fullName || '',
    dateOfBirth: initial?.dateOfBirth || '',
    gender: initial?.gender || '',
    bloodGroup: initial?.bloodGroup || '',
    relationshipToOwner: initial?.relationshipToOwner || '',
    profilePhotoUrl: initial?.profilePhotoUrl || '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
        relationshipToOwner: form.relationshipToOwner || undefined,
        profilePhotoUrl: form.profilePhotoUrl || undefined,
      })
      if (!initial) {
        setForm({ fullName: '', dateOfBirth: '', gender: '', bloodGroup: '', relationshipToOwner: '', profilePhotoUrl: '' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
      <div className="sm:col-span-2">
        <TextField label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
      </div>
      <TextField label="Date of birth" type="date" value={form.dateOfBirth || ''} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} />
      <SelectField label="Gender" value={form.gender || ''} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
        {genders.map((gender) => <option key={gender} value={gender}>{gender || 'Select gender'}</option>)}
      </SelectField>
      <SelectField label="Blood group" value={form.bloodGroup || ''} onChange={(event) => setForm({ ...form, bloodGroup: event.target.value })}>
        {bloodGroups.map((group) => <option key={group} value={group}>{group || 'Select blood group'}</option>)}
      </SelectField>
      <TextField label="Relationship" value={form.relationshipToOwner || ''} placeholder="Self, mother, child" onChange={(event) => setForm({ ...form, relationshipToOwner: event.target.value })} />
      <div className="sm:col-span-2">
        <PhotoUpload name={form.fullName} value={form.profilePhotoUrl || ''} onChange={(profilePhotoUrl) => setForm({ ...form, profilePhotoUrl })} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  )
}
