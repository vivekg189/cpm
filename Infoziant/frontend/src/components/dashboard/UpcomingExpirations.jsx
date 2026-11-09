import { useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, Calendar, ArrowRight, ShieldAlert } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'

function getDaysRemaining(dateStr) {
  if (!dateStr) return null
  const exp = new Date(dateStr)
  const now = new Date()
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}

export default function UpcomingExpirations({ documents = [] }) {
  const navigate = useNavigate()

  // Filter documents that are expired or expiring within 30 days
  const expiringDocs = documents.filter((d) => {
    if (!d.expiryDate) return false
    const days = getDaysRemaining(d.expiryDate)
    return days <= 30
  }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))

  if (expiringDocs.length === 0) {
    return (
      <div className="dashboard-card expiring-notice-card all-good">
        <div className="expiring-notice-icon-box success">
          <Clock size={20} className="text-success" />
        </div>
        <div className="expiring-notice-content">
          <h4 className="notice-title">All Documents Up-to-Date</h4>
          <p className="notice-desc">No documents expiring within the next 30 days.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card expiring-notice-card has-alerts">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <ShieldAlert size={20} className="text-danger" />
          <h2 className="card-heading">Action Required — Upcoming Expirations</h2>
        </div>
        <button
          type="button"
          className="card-header-link"
          onClick={() => navigate('/documents?filter=expiring')}
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="expiring-items-grid">
        {expiringDocs.slice(0, 3).map((doc) => {
          const days = getDaysRemaining(doc.expiryDate)
          const isExpired = days <= 0

          return (
            <div
              key={doc._id}
              className={`expiring-item-card ${isExpired ? 'expired-state' : 'expiring-state'}`}
              onClick={() => navigate(`/documents?search=${encodeURIComponent(doc.title)}`)}
            >
              <div className="expiring-item-top">
                <span className="plate-pill">{doc.vehicle?.registrationNumber || 'Vehicle'}</span>
                <StatusBadge
                  variant={isExpired ? 'danger' : 'warning'}
                  label={isExpired ? 'Expired' : `${days} days left`}
                  size="sm"
                />
              </div>
              <div className="expiring-item-name">{doc.title}</div>
              <div className="expiring-item-footer">
                <span className="text-muted-xs">{doc.documentType}</span>
                <span className="expiry-date-tag">
                  <Calendar size={12} className="inline-icon" />
                  {new Date(doc.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

