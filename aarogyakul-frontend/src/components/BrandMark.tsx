import { Link } from 'react-router'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <img src="/logo.svg" alt="AarogyaKul" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
      {!compact ? (
        <span className="min-w-0">
          <span className="block text-base font-bold tracking-tight text-deep">AarogyaKul</span>
          <span className="block text-[11px] font-medium text-mid">Health records for every generation</span>
        </span>
      ) : null}
    </Link>
  )
}
