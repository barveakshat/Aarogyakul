import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Alert, Button, Card, PasswordField, TextField } from '../components/ui'
import { BrandMark } from '../components/BrandMark'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/app" replace />

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {}
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address'
    }
    if (!password) {
      errors.password = 'Password is required'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/app', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      // Map common backend messages to user-friendly text
      if (msg.toLowerCase().includes('invalid email or password') || msg.toLowerCase().includes('invalid credentials')) {
        setError('Incorrect email or password. Please check and try again.')
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('econnrefused')) {
        setError('Unable to reach the server. Please check your connection and try again.')
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to continue managing your family health records.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <Alert message={error} /> : null}
        <div>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setFieldErrors(e => ({ ...e, email: undefined })) }}
            autoComplete="email"
            required
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-alert">{fieldErrors.email}</p>}
        </div>
        <div>
          <PasswordField
            label="Password"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setFieldErrors(e => ({ ...e, password: undefined })) }}
            autoComplete="current-password"
            required
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-alert">{fieldErrors.password}</p>}
        </div>
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-mid">
        New to AarogyaKul? <Link className="font-medium text-focus hover:underline" to="/register">Create an account</Link>
      </p>
    </AuthFrame>
  )
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="mb-6 flex justify-center"><BrandMark /></div>
          <h1 className="text-center font-display text-2xl font-bold tracking-tight text-deep">{title}</h1>
          <p className="mt-2 text-center text-sm leading-6 text-mid">{subtitle}</p>
        </div>
        <Card className="p-6">{children}</Card>
      </div>
    </div>
  )
}
