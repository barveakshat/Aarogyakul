import { FormEvent, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { changePassword } from '../api/account'
import { Alert, Button, Card, PageHeader, TextField } from '../components/ui'
import { useToast } from '../components/Toast'
import { Shield, FileText, Lock, User } from 'lucide-react'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    setPwLoading(true)
    try {
      await changePassword(currentPw, newPw)
      toast('Password changed successfully', 'success')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password')
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pri/10">
              <User size={20} className="text-pri" />
            </div>
            <h2 className="text-base font-black text-txtP">Account</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-txtS">Email</div>
              <div className="mt-1 text-sm font-medium text-txtP">{user?.email || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-txtS">Name</div>
              <div className="mt-1 text-sm font-medium text-txtP">{user?.fullName || '—'}</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-brd">
            <Button variant="danger" onClick={logout}>Sign Out</Button>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pri/10">
              <Lock size={20} className="text-pri" />
            </div>
            <h2 className="text-base font-black text-txtP">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwError && <Alert message={pwError} />}
            <TextField label="Current Password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
            <TextField label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required />
            <TextField label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
            <Button type="submit" disabled={pwLoading}>
              {pwLoading ? 'Saving...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Legal Links */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pri/10">
            <Shield size={20} className="text-pri" />
          </div>
          <h2 className="text-base font-black text-txtP">Legal</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/privacy" className="inline-flex items-center gap-2 rounded-btn border border-brd px-4 py-2.5 text-sm font-medium text-txtP transition-colors hover:border-pri/30 hover:text-pri">
            <FileText size={16} />Privacy Policy
          </Link>
          <Link to="/terms" className="inline-flex items-center gap-2 rounded-btn border border-brd px-4 py-2.5 text-sm font-medium text-txtP transition-colors hover:border-pri/30 hover:text-pri">
            <FileText size={16} />Terms of Service
          </Link>
        </div>
      </Card>
    </>
  )
}
