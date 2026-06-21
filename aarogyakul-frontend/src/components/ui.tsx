import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import type { ProcessingStatus } from '../types/api'
import { statusLabel } from '../utils/format'

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const variants = {
    primary: 'bg-pri text-white border-pri hover:bg-blue-700 focus:ring-pri/30',
    secondary: 'bg-surf text-txtP border-brd hover:border-pri hover:text-pri focus:ring-pri/20',
    danger: 'bg-white text-crit border-red-200 hover:bg-red-50 focus:ring-red-200',
    ghost: 'bg-transparent text-txtS border-transparent hover:bg-slate-100 hover:text-txtP focus:ring-pri/20',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-btn border px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
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
      <span className="mb-1.5 block text-sm font-medium text-txtP">{label}</span>
      <input
        className={`w-full rounded-btn border border-brd bg-white px-3 py-2 text-sm text-txtP outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-pri focus:ring-4 focus:ring-pri/10 ${className}`}
        {...props}
      />
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
      <span className="mb-1.5 block text-sm font-medium text-txtP">{label}</span>
      <select
        className={`w-full rounded-btn border border-brd bg-white px-3 py-2 text-sm text-txtP outline-none transition-colors duration-200 focus:border-pri focus:ring-4 focus:ring-pri/10 ${className}`}
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
      <span className="mb-1.5 block text-sm font-medium text-txtP">{label}</span>
      <textarea
        className={`min-h-24 w-full resize-y rounded-btn border border-brd bg-white px-3 py-2 text-sm text-txtP outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-pri focus:ring-4 focus:ring-pri/10 ${className}`}
        {...props}
      />
    </label>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-crd border border-brd bg-surf shadow-crd ${className}`}>{children}</section>
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
        <h1 className="text-2xl font-semibold tracking-normal text-txtP">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-txtS">{description}</p> : null}
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
    <div className="rounded-crd border border-dashed border-brd bg-white px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brd bg-bg text-sm font-semibold text-pri">
        AK
      </div>
      <h2 className="text-base font-semibold text-txtP">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-txtS">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-72 items-center justify-center">
      <div className="flex items-center gap-3 rounded-crd border border-brd bg-white px-4 py-3 text-sm text-txtS shadow-crd">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brd border-t-pri" />
        {label}
      </div>
    </div>
  )
}

export function Alert({ message, tone = 'danger' }: { message: string; tone?: 'danger' | 'info' }) {
  const styles = tone === 'danger' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'
  return <div className={`rounded-btn border px-3 py-2 text-sm ${styles}`}>{message}</div>
}

export function StatusBadge({ status }: { status: ProcessingStatus }) {
  const styles: Record<ProcessingStatus, string> = {
    PENDING: 'border-slate-200 bg-slate-50 text-slate-600',
    PROCESSING: 'border-amber-200 bg-amber-50 text-amber-700',
    COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    FAILED: 'border-red-200 bg-red-50 text-red-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  )
}
