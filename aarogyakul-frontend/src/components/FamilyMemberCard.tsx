import { Link } from 'react-router'
import type { MemberResponse } from '../types/api'
import { formatDate, initials } from '../utils/format'
import { Card } from './ui'

export function FamilyMemberCard({ member }: { member: MemberResponse }) {
  return (
    <Link to={`/member/${member.memberId}`} className="block rounded-crd outline-none transition-colors duration-200 focus:ring-4 focus:ring-pri/10">
      <Card className="h-full p-5 transition-colors duration-200 hover:border-pri">
        <div className="flex items-start gap-4">
          {member.profilePhotoUrl ? (
            <img className="h-12 w-12 rounded-full object-cover" src={member.profilePhotoUrl} alt={`${member.fullName} profile`} />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-pri">
              {initials(member.fullName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-txtP">{member.fullName}</h2>
            <p className="mt-1 text-sm text-txtS">{member.relationshipToOwner || 'Family member'}</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-txtS">DOB</dt>
            <dd className="mt-1 font-medium text-txtP">{formatDate(member.dateOfBirth)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-txtS">Blood</dt>
            <dd className="mt-1 font-medium text-txtP">{member.bloodGroup || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-txtS">Allergies</dt>
            <dd className="mt-1 font-medium text-txtP">{member.allergies.length}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-txtS">Conditions</dt>
            <dd className="mt-1 font-medium text-txtP">{member.chronicConditions.length}</dd>
          </div>
        </dl>
      </Card>
    </Link>
  )
}
