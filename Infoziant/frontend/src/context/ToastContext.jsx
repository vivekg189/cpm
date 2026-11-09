import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4000,
    }

    setToasts((prev) => [...prev, newToast])

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [removeToast])

  const success = useCallback((message, title = 'Success') => {
    return addToast({ type: 'success', title, message })
  }, [addToast])

  const error = useCallback((message, title = 'Error') => {
    return addToast({ type: 'error', title, message, duration: 5500 })
  }, [addToast])

  const warning = useCallback((message, title = 'Warning') => {
    return addToast({ type: 'warning', title, message, duration: 5000 })
  }, [addToast])

  const info = useCallback((message, title = 'Notice') => {
    return addToast({ type: 'info', title, message })
  }, [addToast])

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="toast-icon text-success" size={20} />
      case 'error':
        return <AlertCircle className="toast-icon text-danger" size={20} />
      case 'warning':
        return <AlertTriangle className="toast-icon text-warning" size={20} />
      default:
        return <Info className="toast-icon text-primary" size={20} />
    }
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type} animate-slide-in`}>
            <div className="toast-icon-wrapper">{getIcon(t.type)}</div>
            <div className="toast-content">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-message">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

