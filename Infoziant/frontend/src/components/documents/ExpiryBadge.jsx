import { CheckCircle2, AlertTriangle, AlertCircle, Calendar } from 'lucide-react'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ExpiryBadge({ date }) {
  if (!date) {
    return (
      <span className="status-badge badge-neutral badge-sm">
        <Calendar size={12} className="status-badge-icon" />
        <span className="status-badge-text">No Expiry</span>
      </span>
    )
  }

  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24))

  if (d < now) {
    return (
      <span className="status-badge badge-danger badge-sm animate-pulse-gentle">
        <AlertCircle size={12} className="status-badge-icon" />
        <span className="status-badge-text">Expired ({Math.abs(diffDays)}d ago)</span>
      </span>
    )
  }

  if (diffDays <= 30) {
    return (
      <span className="status-badge badge-warning badge-sm">
        <AlertTriangle size={12} className="status-badge-icon" />
        <span className="status-badge-text">{diffDays}d remaining</span>
      </span>
    )
  }

  return (
    <span className="status-badge badge-success badge-sm">
      <CheckCircle2 size={12} className="status-badge-icon" />
      <span className="status-badge-text">Valid until {formatDate(date)}</span>
    </span>
  )
}

