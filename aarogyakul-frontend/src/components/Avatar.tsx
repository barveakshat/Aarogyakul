import { initials } from '../utils/format'

interface AvatarProps {
  name: string
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm:  { box: 'h-8 w-8',   text: 'text-xs'  },
  md:  { box: 'h-10 w-10', text: 'text-sm'  },
  lg:  { box: 'h-16 w-16', text: 'text-lg'  },
  xl:  { box: 'h-24 w-24', text: 'text-2xl' },
}

export function Avatar({ name, photoUrl, size = 'md', className = '' }: AvatarProps) {
  const { box, text } = sizeMap[size]

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${box} rounded-full object-cover shadow-sm flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${box} ${text} rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none ${className}`}
      style={{
        background: 'rgba(59, 95, 204, 0.1)',
        color: '#3B5FCC',
        border: '2px solid rgba(59, 95, 204, 0.15)',
      }}
      aria-label={name}
      title={name}
    >
      {initials(name)}
    </div>
  )
}
