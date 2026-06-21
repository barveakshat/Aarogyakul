import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Alert, Button, Card, TextField } from '../components/ui'

export default function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' })
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
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-crd border border-brd bg-white text-sm font-semibold text-pri shadow-crd">
            AK
          </div>
          <h1 className="text-2xl font-semibold text-txtP">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-txtS">Start with one family workspace for reports, timelines, and AI insights.</p>
        </div>
        <Card className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error ? <Alert message={error} /> : null}
            <TextField label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <TextField label="Phone number" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            <TextField label="Password" type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <Button className="w-full" type="submit" disabled={submitting}>
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
