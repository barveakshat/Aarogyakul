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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fdIn" onClick={() => handleClose(false)}>
          <div className="relative mx-4 w-full max-w-sm rounded-crd border border-brd bg-white p-6 shadow-glow" onClick={e => e.stopPropagation()}>
            <button onClick={() => handleClose(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-txtS transition-colors hover:bg-brd/50 hover:text-txtP">
              <X size={18} />
            </button>

            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
              state.variant === 'danger' ? 'bg-red-50' : 'bg-pri/10'
            }`}>
              <AlertTriangle size={22} className={state.variant === 'danger' ? 'text-red-500' : 'text-pri'} />
            </div>

            <h3 className="text-lg font-black text-txtP">{state.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-txtS">{state.message}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 rounded-btn border border-brd bg-white px-4 py-2.5 text-sm font-bold text-txtP transition-colors hover:bg-brd/30"
              >
                {state.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 rounded-btn px-4 py-2.5 text-sm font-bold text-white transition-colors ${
                  state.variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-pri to-pri2 hover:brightness-105'
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
