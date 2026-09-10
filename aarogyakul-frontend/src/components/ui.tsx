import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { ProcessingStatus } from '../types/api'
import { statusLabel } from '../utils/format'

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const variants = {
    primary: 'bg-focus text-white border-transparent hover:bg-focus/90 focus-visible:ring-focus/20',
    secondary: 'bg-surf text-focus border-line hover:bg-bg focus-visible:ring-focus/15',
    danger: 'bg-surf text-alert border-alert/30 hover:bg-alert/[0.04] focus-visible:ring-alert/15',
    ghost: 'bg-transparent text-mid border-transparent hover:bg-bg hover:text-deep focus-visible:ring-focus/15',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function TextField({
  label,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-deep">{label}</span>
      <input
        className={`w-full rounded-md border border-line bg-surf px-3 py-2 text-sm text-deep outline-none transition duration-150 placeholder:text-soft focus:border-focus focus-visible:ring-2 focus-visible:ring-focus/15 ${className}`}
        {...props}
      />
    </label>
  )
}

export function PasswordField({
  label,
  className = '',
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-deep">{label}</span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-md border border-line bg-surf py-2 pl-3 pr-9 text-sm text-deep outline-none transition duration-150 placeholder:text-soft focus:border-focus focus-visible:ring-2 focus-visible:ring-focus/15 ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-sm text-mid transition-colors hover:text-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/15 focus-visible:ring-offset-1"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {hint && <span className="mt-1 block text-[11px] text-mid">{hint}</span>}
    </label>
  )
}

export function SelectField({
  label,
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-deep">{label}</span>
      <select
        className={`w-full rounded-md border border-line bg-surf px-3 py-2 text-sm text-deep outline-none transition duration-150 focus:border-focus focus-visible:ring-2 focus-visible:ring-focus/15 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function TextAreaField({
  label,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-deep">{label}</span>
      <textarea
        className={`min-h-24 w-full resize-y rounded-md border border-line bg-surf px-3 py-2 text-sm text-deep outline-none transition duration-150 placeholder:text-soft focus:border-focus focus-visible:ring-2 focus-visible:ring-focus/15 ${className}`}
        {...props}
      />
    </label>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-line bg-surf shadow-md ${className}`}>{children}</section>
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-deep">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-mid">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-md border border-dashed border-line bg-surf px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-focus/8 text-sm font-bold text-focus">
        AK
      </div>
      <h2 className="text-sm font-semibold text-deep">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mid">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-72 items-center justify-center">
      <div className="flex items-center gap-3 rounded-md border border-line bg-surf px-4 py-3 text-sm font-medium text-mid shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-focus" />
        {label}
      </div>
    </div>
  )
}

export function Alert({ message, tone = 'danger' }: { message: string; tone?: 'danger' | 'info' }) {
  const styles = tone === 'danger'
    ? 'border-alert/20 bg-alert/[0.04] text-alert'
    : 'border-focus/20 bg-focus/[0.04] text-focus'
  return <div className={`rounded-md border px-3 py-2 text-sm ${styles}`}>{message}</div>
}

export function StatusBadge({ status }: { status: ProcessingStatus }) {
  const styles: Record<ProcessingStatus, string> = {
    PENDING: 'border-mid/15 bg-mid/8 text-mid',
    PROCESSING: 'border-focus/15 bg-focus/8 text-focus',
    COMPLETED: 'border-ok/15 bg-ok/8 text-ok',
    FAILED: 'border-alert/15 bg-alert/8 text-alert',
  }

  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  )
}
