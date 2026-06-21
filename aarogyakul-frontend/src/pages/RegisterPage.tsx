import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { createFamily, createMember } from '../api/family'
import { PhotoUpload } from '../components/PhotoUpload'
import { Alert, Button, Card, SelectField, TextField } from '../components/ui'
import { BrandMark } from '../components/BrandMark'

const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = ['', 'Female', 'Male', 'Non-binary', 'Prefer not to say']

export default function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    familyName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    profilePhotoUrl: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/app" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        password: form.password,
      })
      const family = await createFamily({ familyName: form.familyName || `${form.fullName.split(' ')[0] || 'My'} Family` })
      await createMember(family.familyId, {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
        relationshipToOwner: 'Self',
        profilePhotoUrl: form.profilePhotoUrl || undefined,
      })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <BrandMark />
          <h1 className="mt-10 max-w-xl text-5xl font-black tracking-tight text-txtP">Create your health workspace in one thoughtful step.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-txtS">
            Your account, family space, and own member profile are created together so you can upload the first report immediately.
          </p>
          <div className="mt-8 grid max-w-lg gap-3">
            {['Profile completed during signup', 'Photo upload with private local preview', 'Self added as first family member'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-bold text-pri shadow-crd">
                {item}
              </div>
            ))}
          </div>
        </div>
        <Card className="p-5 sm:p-7">
          <div className="mb-6 lg:hidden"><BrandMark /></div>
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tight text-txtP">Create your profile</h1>
            <p className="mt-2 text-sm leading-6 text-txtS">We will create your family and add you as the first member automatically.</p>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            {error ? <Alert message={error} /> : null}
            <TextField label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <TextField label="Phone number" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            <TextField label="Password" type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <TextField label="Family name" value={form.familyName} placeholder="Sharma Family" onChange={(event) => setForm({ ...form, familyName: event.target.value })} />
            <TextField label="Date of birth" type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} required />
            <SelectField label="Gender" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
              {genders.map((gender) => <option key={gender} value={gender}>{gender || 'Select gender'}</option>)}
            </SelectField>
            <SelectField label="Blood group" value={form.bloodGroup} onChange={(event) => setForm({ ...form, bloodGroup: event.target.value })}>
              {bloodGroups.map((group) => <option key={group} value={group}>{group || 'Select blood group'}</option>)}
            </SelectField>
            <div className="sm:col-span-2">
              <PhotoUpload name={form.fullName} value={form.profilePhotoUrl} onChange={(profilePhotoUrl) => setForm({ ...form, profilePhotoUrl })} />
            </div>
            <Button className="w-full sm:col-span-2" type="submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-txtS">
            Already have an account? <Link className="font-medium text-pri hover:underline" to="/login">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
