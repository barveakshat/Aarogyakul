import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle, AlertTriangle, Info, X, XCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles: Record<ToastType, string> = {
  success: 'border-ok/20 bg-ok/[0.04] text-ok',
  error: 'border-alert/20 bg-alert/[0.04] text-alert',
  warning: 'border-attn/20 bg-attn/[0.04] text-attn',
  info: 'border-focus/20 bg-focus/[0.04] text-focus',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-ok',
  error: 'text-alert',
  warning: 'text-attn',
  info: 'text-focus',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const Icon = icons[toast.type]
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-md border bg-surf px-4 py-3 shadow-md animate-enter max-w-sm ${styles[toast.type]}`}
      role="alert"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColors[toast.type]}`} />
      <p className="flex-1 text-sm font-medium leading-snug text-deep">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 rounded-sm p-0.5 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}
