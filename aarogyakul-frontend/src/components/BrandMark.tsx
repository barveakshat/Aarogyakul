import { Link } from 'react-router'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pri via-aqua to-pri2 text-sm font-black text-white shadow-glow">
        <span className="absolute inset-0 bg-white/10" />
        <span className="relative">AK</span>
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block text-base font-black tracking-tight text-txtP">AarogyaKul</span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-pri">Health intelligence</span>
        </span>
      ) : null}
    </Link>
  )
}
