import { FormEvent, useEffect, useState } from 'react'
import { Alert, Button, Card, EmptyState, LoadingState, PageHeader, TextField } from '../components/ui'
import { createFamily, createMember, getMyFamily } from '../api/family'
import type { FamilyResponse } from '../types/api'
import { FamilyMemberCard } from '../components/FamilyMemberCard'
import { MemberForm } from '../components/MemberForm'

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
        title={family.familyName}
        description="Manage family members and jump into each member's reports, AI insights, and health timeline."
      />
      {error ? <div className="mb-4"><Alert message={error} /></div> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
          <h2 className="text-base font-semibold text-txtP">Add family member</h2>
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
