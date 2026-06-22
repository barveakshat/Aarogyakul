import { Link } from 'react-router'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <img src="/logo.svg" alt="AarogyaKul" className="h-11 w-11 shrink-0 rounded-2xl object-contain" />
      {!compact ? (
        <span className="min-w-0">
          <span className="block text-base font-black tracking-tight text-txtP">AarogyaKul</span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-pri">Health intelligence</span>
        </span>
      ) : null}
    </Link>
  )
}
