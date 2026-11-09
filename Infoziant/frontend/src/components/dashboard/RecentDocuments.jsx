import { useNavigate } from 'react-router-dom'
import { FileText, ArrowRight, Upload, Calendar, HardDrive } from 'lucide-react'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getDocumentStatusBadge(expiryDate) {
  if (!expiryDate) {
    return <StatusBadge variant="neutral" label="No Expiry" size="sm" showIcon={false} />
  }
  const exp = new Date(expiryDate)
  const now = new Date()
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))

  if (exp < now) {
    return <StatusBadge variant="danger" label="Expired" size="sm" />
  }
  if (diffDays <= 30) {
    return <StatusBadge variant="warning" label={`${diffDays}d left`} size="sm" />
  }
  return <StatusBadge variant="success" label="Active" size="sm" />
}

export default function RecentDocuments({ documents = [] }) {
  const navigate = useNavigate()

  return (
    <div className="dashboard-card recent-documents-card">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <FileText size={20} className="text-secondary" />
          <h2 className="card-heading">Recent Documents</h2>
        </div>
        <button
          type="button"
          className="card-header-link"
          onClick={() => navigate('/documents')}
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="card-body-flush">
        {documents.length === 0 ? (
          <div className="empty-sub-state">
            <div className="empty-sub-icon">
              <FileText size={32} strokeWidth={1.5} />
            </div>
            <p className="empty-sub-title">No documents uploaded yet</p>
            <p className="empty-sub-text">Upload PDF certificates to begin tracking</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Upload}
              onClick={() => navigate('/documents?action=upload')}
              className="mt-3"
            >
              Upload PDF
            </Button>
          </div>
        ) : (
          <div className="recent-entities-list">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="recent-entity-row clickable"
                onClick={() => navigate(`/documents?search=${encodeURIComponent(doc.title)}`)}
              >
                <div className="entity-icon-badge document-accent">
                  <FileText size={18} />
                </div>
                <div className="entity-info-group">
                  <div className="entity-primary-title">
                    <span className="doc-title-text">{doc.title}</span>
                  </div>
                  <div className="entity-meta-subtitle">
                    <span className="text-bold-muted">
                      {doc.vehicle?.registrationNumber || 'Vehicle'}
                    </span>
                    <span className="meta-bullet">•</span>
                    <span>{doc.documentType}</span>
                    <span className="meta-bullet">•</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                  </div>
                </div>
                <div className="entity-trailing-info">
                  {getDocumentStatusBadge(doc.expiryDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

