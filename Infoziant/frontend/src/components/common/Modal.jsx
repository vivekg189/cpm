import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showClose = true,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="presentation">
      <div
        className={`modal-dialog modal-${size} animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="modal-header">
          <div>
            {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          {showClose && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

