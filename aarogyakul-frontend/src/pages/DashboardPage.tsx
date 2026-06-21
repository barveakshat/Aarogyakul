import { FormEvent, useEffect, useState } from 'react'
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader, TextField } from '../components/ui'
import { createFamily, createMember, getMyFamily } from '../api/family'
import type { FamilyResponse } from '../types/api'
import { FamilyMemberCard } from '../components/FamilyMemberCard'
import { MemberForm } from '../components/MemberForm'
import { Link } from 'react-router'

export default function DashboardPage() {
  const [family, setFamily] = useState<FamilyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [creatingFamily, setCreatingFamily] = useState(false)

  const loadFamily = async () => {
    setLoading(true)
    setError('')
    try {
      setFamily(await getMyFamily())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load family'
      if (message.toLowerCase().includes('not found')) {
        setFamily(null)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFamily()
  }, [])

  const handleCreateFamily = async (event: FormEvent) => {
    event.preventDefault()
    setCreatingFamily(true)
    setError('')
    try {
      setFamily(await createFamily({ familyName }))
      setFamilyName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create family')
    } finally {
      setCreatingFamily(false)
    }
  }

  if (loading) return <LoadingState label="Loading family workspace" />

  if (!family) {
    return (
      <>
        <PageHeader title="Set up your family" description="AarogyaKul keeps one family workspace per user for the MVP." />
        {error ? <div className="mb-4"><Alert message={error} /></div> : null}
        <EmptyState
          title="Create your family workspace"
          description="Once created, you can add members, upload PDF reports, and track generated insights."
          action={
            <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={handleCreateFamily}>
              <TextField label="Family name" value={familyName} onChange={(event) => setFamilyName(event.target.value)} required />
              <div className="pt-6">
                <Button type="submit" disabled={creatingFamily}>{creatingFamily ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={`${family.familyName} dashboard`}
        description="A clean command center for members, report uploads, timelines, and clinical notes."
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Members" value={family.members.length} />
        <StatCard label="Profiles ready" value={family.members.filter((member) => member.dateOfBirth && member.bloodGroup).length} />
        <StatCard label="Allergies" value={family.members.reduce((sum, member) => sum + member.allergies.length, 0)} />
        <StatCard label="Conditions" value={family.members.reduce((sum, member) => sum + member.chronicConditions.length, 0)} />
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <QuickLink title="Upload report" text="Choose a member and send a PDF into the AI pipeline." to="/app/reports" />
        <QuickLink title="Review insights" text="Open completed reports and extracted parameters." to="/app/insights" />
        <QuickLink title="Health timelines" text="Browse chronological events for every member." to="/app/timelines" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {family.members.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {family.members.map((member) => <FamilyMemberCard key={member.memberId} member={member} />)}
            </div>
          ) : (
            <EmptyState title="No members yet" description="Add the first family member to start uploading medical documents." />
          )}
        </div>
        <Card className="p-5">
          <h2 className="text-base font-black text-txtP">Add family member</h2>
          <p className="mt-1 text-sm leading-6 text-txtS">Capture just enough information to organize reports safely.</p>
          <div className="mt-5">
            <MemberForm
              submitLabel="Add member"
              onSubmit={async (payload) => {
                await createMember(family.familyId, payload)
                await loadFamily()
              }}
            />
          </div>
        </Card>
      </div>
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="text-3xl font-black text-pri">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-txtS">{label}</div>
    </Card>
  )
}

function QuickLink({ title, text, to }: { title: string; text: string; to: string }) {
  return (
    <Link to={to} className="block rounded-crd outline-none focus:ring-4 focus:ring-pri/10">
      <Card className="h-full p-5 transition duration-200 hover:-translate-y-1 hover:shadow-glow">
        <div className="mb-4 h-2 rounded-full bg-gradient-to-r from-pri via-aqua to-pri2" />
        <h2 className="text-base font-black text-txtP">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-txtS">{text}</p>
      </Card>
    </Link>
  )
}
