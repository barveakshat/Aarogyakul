import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Alert, Button, Card, PasswordField, TextField } from '../components/ui'
import { BrandMark } from '../components/BrandMark'
import { ChevronRight } from 'lucide-react'

export default function RegisterPage() {
  const { register, user } = useAuth()

  
  const [accountForm, setAccountForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
  
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | undefined }>({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/app" replace />

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!accountForm.fullName.trim()) errors.fullName = 'Full name is required'
    const trimmedEmail = accountForm.email.trim()
    if (!trimmedEmail) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address'
    }
    if (!accountForm.password) {
      errors.password = 'Password is required'
    } else if (accountForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (!accountForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (accountForm.password !== accountForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({
        fullName: accountForm.fullName.trim(),
        email: accountForm.email.trim(),
        phoneNumber: accountForm.phoneNumber.trim() || undefined,
        password: accountForm.password,
      })
      // Authentication hook will update `user` and trigger redirect to /app
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email')) {
        setFieldErrors({ email: msg })
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('econnrefused')) {
        setError('Unable to reach the server. Please check your connection and try again.')
      } else {
        setError(msg)
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <BrandMark />
          <h1 className="mt-10 max-w-xl font-display text-4xl font-bold tracking-tight text-deep">Join AarogyaKul</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-mid">
            Create your comprehensive health workspace. Your family and member profile are created automatically so you can start immediately.
          </p>
        </div>

        <Card className="p-5 sm:p-7 relative overflow-hidden">
          <div className="mb-6 lg:hidden"><BrandMark /></div>
          
          {error && <div className="mb-4"><Alert message={error} /></div>}
          
          <div className="animate-enter">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-deep">Account setup</h2>
              <p className="mt-2 text-sm leading-6 text-mid">Use this to log into the family vault later.</p>
            </div>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
              <div className="sm:col-span-2">
                <TextField label="Full name" value={accountForm.fullName} onChange={(e) => { setAccountForm({ ...accountForm, fullName: e.target.value }); setFieldErrors(fe => ({ ...fe, fullName: undefined })) }} required />
                {fieldErrors.fullName && <p className="mt-1 text-xs text-alert">{fieldErrors.fullName}</p>}
              </div>
              <div>
                <TextField label="Email" type="email" value={accountForm.email} onChange={(e) => { setAccountForm({ ...accountForm, email: e.target.value }); setFieldErrors(fe => ({ ...fe, email: undefined })) }} autoComplete="email" required />
                {fieldErrors.email && <p className="mt-1 text-xs text-alert">{fieldErrors.email}</p>}
              </div>
              <TextField label="Phone number (optional)" value={accountForm.phoneNumber} onChange={(e) => setAccountForm({ ...accountForm, phoneNumber: e.target.value })} />
              <div className="sm:col-span-2">
                <PasswordField label="Password" minLength={8} value={accountForm.password} onChange={(e) => { setAccountForm({ ...accountForm, password: e.target.value }); setFieldErrors(fe => ({ ...fe, password: undefined })) }} hint="At least 8 characters" autoComplete="new-password" required />
                {fieldErrors.password && <p className="mt-1 text-xs text-alert">{fieldErrors.password}</p>}
              </div>
              <div className="sm:col-span-2">
                <PasswordField label="Confirm password" value={accountForm.confirmPassword} onChange={(e) => { setAccountForm({ ...accountForm, confirmPassword: e.target.value }); setFieldErrors(fe => ({ ...fe, confirmPassword: undefined })) }} autoComplete="new-password" required />
                {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-alert">{fieldErrors.confirmPassword}</p>}
              </div>
              
              <div className="mt-4 sm:col-span-2">
                <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Create Account'}
                  {!submitting && <ChevronRight size={18} />}
                </Button>
                <p className="mt-4 text-center text-sm text-mid">
                  Already have an account? <Link to="/login" className="font-semibold text-focus hover:underline">Log in</Link>
                </p>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
