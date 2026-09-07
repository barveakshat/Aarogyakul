import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType>({ confirm: () => Promise.resolve(false) })

export function useConfirm() {
  return useContext(ConfirmContext)
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { visible: boolean }) | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      resolveRef.current = resolve
      setState({ ...options, visible: true })
    })
  }, [])

  const handleClose = (result: boolean) => {
    resolveRef.current?.(result)
    resolveRef.current = null
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state?.visible && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-deep/50 animate-enter" onClick={() => handleClose(false)}>
          <div className="relative mx-4 w-full max-w-sm rounded-md border border-line bg-surf p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <button onClick={() => handleClose(false)} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-mid transition-colors hover:bg-bg hover:text-deep">
              <X size={16} />
            </button>

            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${
              state.variant === 'danger' ? 'bg-alert/8' : 'bg-focus/8'
            }`}>
              <AlertTriangle size={20} className={state.variant === 'danger' ? 'text-alert' : 'text-focus'} />
            </div>

            <h3 className="font-display text-base font-semibold text-deep">{state.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mid">{state.message}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 rounded-md border border-line bg-surf px-4 py-2 text-sm font-semibold text-deep transition-colors hover:bg-bg"
              >
                {state.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  state.variant === 'danger'
                    ? 'bg-alert hover:bg-alert/90'
                    : 'bg-focus hover:bg-focus/90'
                }`}
              >
                {state.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
