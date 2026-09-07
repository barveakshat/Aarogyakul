import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { useProfile } from '../context/ProfileContext'
import { createFamily, createMember } from '../api/family'
import { MemberForm } from '../components/MemberForm'
import { Button, Card, LoadingState, TextField } from '../components/ui'
import { Plus, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from '../components/Avatar'
import { useToast } from '../components/Toast'
import type { MemberResponse } from '../types/api'

export default function ProfilePickerPage() {
  const { family, loading, setActiveProfile, reloadFamily } = useProfile()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFamilyCreate, setShowFamilyCreate] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  if (loading) return <LoadingState label="Loading profiles" />

  const handleSelect = (member: MemberResponse) => {
    setActiveProfile(member)
    navigate('/app', { replace: true })
  }

  const handleCreateFamily = async (e: FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await createFamily({ familyName: familyName || `${user?.fullName} Family` })
    } catch {
      // Family may already exist — that's fine, just reload
    }
    await reloadFamily()
    setShowFamilyCreate(false)
    setCreating(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AarogyaKul" className="h-10 w-10 rounded-md object-contain" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-deep">Who's using AarogyaKul?</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-mid hover:text-deep hover:bg-line/30 transition-colors">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
        <p className="text-sm text-mid mb-10">Select your profile to view your health dashboard, documents, and timeline.</p>

        {!family ? (
          <Card className="p-8 max-w-md mx-auto text-center">
            {showFamilyCreate ? (
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <h2 className="font-display text-base font-semibold text-deep">Create your family workspace</h2>
                <TextField label="Family name" value={familyName} placeholder={`${user?.fullName} Family`} onChange={(e) => setFamilyName(e.target.value)} />
                <div className="flex gap-3">
                  <Button variant="secondary" type="button" onClick={() => setShowFamilyCreate(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="font-display text-base font-semibold text-deep">Welcome to AarogyaKul</h2>
                <p className="mt-2 text-sm text-mid">Create a family workspace to get started, then add profiles for each family member.</p>
                <Button className="mt-6" onClick={() => setShowFamilyCreate(true)}>Create Family Workspace</Button>
              </>
            )}
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {family.members.map((member) => (
                <button
                  key={member.memberId}
                  onClick={() => handleSelect(member)}
                  className="group flex flex-col items-center gap-3 rounded-md p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-surf focus:outline-none focus:ring-4 focus:ring-focus/20"
                >
                  <Avatar
                    name={member.fullName}
                    photoUrl={member.profilePhotoUrl}
                    size="xl"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="text-sm font-semibold text-deep group-hover:text-focus transition-colors">{member.fullName}</span>
                  <span className="text-xs text-mid">{member.relationshipToOwner || 'Member'}</span>
                </button>
              ))}

              <button
                onClick={() => setShowAddForm(true)}
                className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-line p-5 transition-all duration-300 hover:-translate-y-1 hover:border-focus/40 hover:bg-focus/[0.02] focus:outline-none focus:ring-4 focus:ring-focus/20"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-line/30">
                  <Plus size={32} className="text-mid" />
                </div>
                <span className="text-sm font-semibold text-mid">Add Profile</span>
              </button>
            </div>

            {showAddForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-enter" onClick={() => setShowAddForm(false)}>
                <Card className="relative mx-4 w-full max-w-md p-6 shadow-md" >
                  <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <h2 className="font-display text-base font-semibold text-deep mb-1">Add family member</h2>
                  <p className="text-sm text-mid mb-5">Create a new profile in your family workspace.</p>
                  <MemberForm
                    submitLabel="Add profile"
                    onSubmit={async (payload) => {
                      try {
                        await createMember(family.familyId, payload)
                        await reloadFamily()
                        setShowAddForm(false)
                      } catch (err: any) {
                        toast(err.message || 'Failed to add profile', 'error')
                      }
                    }}
                  />
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
