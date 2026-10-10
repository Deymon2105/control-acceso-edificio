import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title?: string
  message: string
}

interface ToastContextType {
  toasts: ToastMessage[]
  showToast: (message: string, type?: ToastType, title?: string) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const newToast: ToastMessage = { id, type, title, message }
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        removeToast(id)
      }, 4500)
    },
    [removeToast]
  )

  const showSuccess = useCallback((message: string, title?: string) => showToast(message, 'success', title), [showToast])
  const showError = useCallback((message: string, title?: string) => showToast(message, 'error', title), [showToast])
  const showWarning = useCallback((message: string, title?: string) => showToast(message, 'warning', title), [showToast])
  const showInfo = useCallback((message: string, title?: string) => showToast(message, 'info', title), [showToast])

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
      }}
    >
      {children}
      <div className="toast-container" style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 420,
        width: 'calc(100% - 48px)',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          let borderColor = 'var(--border-subtle)'
          let bgColor = 'var(--bg-card)'
          let iconColor = 'var(--accent-cyan)'
          let IconComp = Info

          if (toast.type === 'success') {
            borderColor = 'var(--status-success-border)'
            bgColor = 'rgba(16, 185, 129, 0.12)'
            iconColor = 'var(--status-success)'
            IconComp = CheckCircle2
          } else if (toast.type === 'error') {
            borderColor = 'var(--status-danger-border)'
            bgColor = 'rgba(239, 68, 68, 0.16)'
            iconColor = 'var(--status-danger)'
            IconComp = AlertCircle
          } else if (toast.type === 'warning') {
            borderColor = 'var(--status-warning-border)'
            bgColor = 'rgba(245, 158, 11, 0.16)'
            iconColor = 'var(--status-warning)'
            IconComp = AlertTriangle
          }

          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                background: `linear-gradient(135deg, ${bgColor} 0%, var(--bg-card) 100%)`,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                boxShadow: 'var(--shadow-lg)',
                pointerEvents: 'auto',
                animation: 'modal-appear 0.2s ease-out',
                color: 'var(--text-primary)',
              }}
            >
              <IconComp size={20} color={iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                {toast.title && (
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: 'var(--text-primary)' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}
