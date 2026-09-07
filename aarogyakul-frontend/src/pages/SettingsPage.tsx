import { FormEvent, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { changePassword } from '../api/account'
import { Alert, Button, Card, PageHeader, PasswordField } from '../components/ui'
import { useToast } from '../components/Toast'
import { Shield, FileText, Lock, User } from 'lucide-react'

export default function SettingsPage() {
  const { user, logout, isDemo } = useAuth()
  const { toast } = useToast()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    
    // DEMO GUARD
    if (isDemo) {
      setPwError('You are viewing a live demo. Account settings cannot be changed.')
      return
    }

    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return }
    if (currentPw === newPw) { setPwError('New password must be different from current password'); return }
    setPwLoading(true)
    try {
      await changePassword(currentPw, newPw)
      toast('Password changed successfully', 'success')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change password'
      if (msg.toLowerCase().includes('current password is incorrect')) {
        setPwError('Current password is incorrect')
      } else {
        setPwError(msg)
      }
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, security, and preferences." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Info */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-focus/8">
              <User size={20} className="text-focus" />
            </div>
            <h2 className="font-display text-base font-semibold text-deep">Account</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-mid">Email</div>
              <div className="mt-1 text-sm font-medium text-deep">{user?.email || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-mid">Name</div>
              <div className="mt-1 text-sm font-medium text-deep">{user?.fullName || '—'}</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <Button variant="danger" onClick={logout}>Sign Out</Button>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-focus/8">
              <Lock size={20} className="text-focus" />
            </div>
            <h2 className="font-display text-base font-semibold text-deep">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwError && <Alert message={pwError} />}
            <PasswordField label="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" required />
            <PasswordField label="New password" value={newPw} onChange={e => setNewPw(e.target.value)} hint="At least 8 characters" autoComplete="new-password" required />
            <PasswordField label="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" required />
            <Button type="submit" disabled={pwLoading}>
              {pwLoading ? 'Saving...' : 'Update password'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Legal Links */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-focus/8">
            <Shield size={20} className="text-focus" />
          </div>
          <h2 className="font-display text-base font-semibold text-deep">Legal</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/privacy" className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-deep transition-colors hover:border-focus/30 hover:text-focus">
            <FileText size={16} />Privacy Policy
          </Link>
          <Link to="/terms" className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-deep transition-colors hover:border-focus/30 hover:text-focus">
            <FileText size={16} />Terms of Service
          </Link>
        </div>
      </Card>
    </>
  )
}
