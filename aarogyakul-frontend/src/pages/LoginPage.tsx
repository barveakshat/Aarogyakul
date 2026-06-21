import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Alert, Button, Card, TextField } from '../components/ui'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/app" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to continue managing your family health records.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert message={error} /> : null}
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-txtS">
        New to AarogyaKul? <Link className="font-medium text-pri hover:underline" to="/register">Create an account</Link>
      </p>
    </AuthFrame>
  )
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-crd border border-brd bg-white text-sm font-semibold text-pri shadow-crd">
            AK
          </div>
          <h1 className="text-2xl font-semibold text-txtP">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-txtS">{subtitle}</p>
        </div>
        <Card className="p-6">{children}</Card>
      </div>
    </div>
  )
}
