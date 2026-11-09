import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

export default function Alert({ type = 'error', title, children, className = '' }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="alert-icon text-success" />
      case 'warning':
        return <AlertTriangle size={18} className="alert-icon text-warning" />
      case 'info':
        return <Info size={18} className="alert-icon text-primary" />
      case 'error':
      default:
        return <AlertCircle size={18} className="alert-icon text-danger" />
    }
  }

  return (
    <div className={`alert-box alert-${type} ${className}`} role="alert">
      <div className="alert-icon-wrapper">{getIcon()}</div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
    </div>
  )
}
