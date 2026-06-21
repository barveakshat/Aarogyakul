import { ChangeEvent, useState } from 'react'
import { initials } from '../utils/format'

const maxImageBytes = 1.5 * 1024 * 1024

export function PhotoUpload({
  label = 'Profile photo',
  name,
  value,
  onChange,
}: {
  label?: string
  name: string
  value?: string
  onChange: (value: string) => void
}) {
  const [error, setError] = useState('')

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.')
      return
    }
    if (file.size > maxImageBytes) {
      setError('Keep the profile photo under 1.5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result || ''))
    reader.onerror = () => setError('Could not read this image.')
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-txtP">{label}</span>
      <div className="flex items-center gap-4 rounded-crd border border-brd bg-white/80 p-3">
        {value ? (
          <img className="h-16 w-16 rounded-2xl object-cover shadow-crd" src={value} alt={`${name} profile`} />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-emerald-100 text-lg font-black text-pri">
            {initials(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <input
            className="block w-full text-sm text-txtS file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-pri file:to-pri2 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
            type="file"
            accept="image/*"
            onChange={handleFile}
          />
          {value ? (
            <button className="mt-2 text-xs font-semibold text-pri hover:underline" type="button" onClick={() => onChange('')}>
              Remove photo
            </button>
          ) : null}
          {error ? <p className="mt-2 text-xs font-semibold text-crit">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
