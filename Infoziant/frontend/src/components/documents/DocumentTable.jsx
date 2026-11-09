import { FileText, Download, Trash2, Eye, Calendar, CarFront, HardDrive } from 'lucide-react'
import Button from '../common/Button'
import ExpiryBadge from './ExpiryBadge'
import { getDownloadUrl } from '../../services/api'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function DocumentTable({
  documents = [],
  onPreview,
  onDelete,
}) {
  return (
    <div className="table-responsive-wrapper">
      <table className="modern-data-table">
        <thead>
          <tr>
            <th>Document Name &amp; File</th>
            <th>Associated Vehicle</th>
            <th>Document Type</th>
            <th>File Size</th>
            <th>Upload Date</th>
            <th>Expiry Date &amp; Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const downloadUrl = getDownloadUrl(doc._id)

            return (
              <tr key={doc._id} className="table-row-hover">
                <td>
                  <div className="table-doc-cell">
                    <div className="table-doc-icon">
                      <FileText size={18} />
                    </div>
                    <div className="table-doc-text">
                      <span className="doc-main-title">{doc.title}</span>
                      <span className="doc-filename-sub">{doc.originalFilename}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="table-vehicle-pill">
                    <CarFront size={13} className="text-muted" />
                    <span className="plate-pill sm">
                      {doc.vehicle?.registrationNumber || 'Vehicle'}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="badge-subtle-primary">{doc.documentType}</span>
                </td>
                <td className="text-secondary text-sm font-mono">
                  {formatBytes(doc.fileSize)}
                </td>
                <td className="text-secondary text-sm">
                  {formatDate(doc.uploadedAt)}
                </td>
                <td>
                  <ExpiryBadge date={doc.expiryDate} />
                </td>
                <td>
                  <div className="table-actions-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Eye}
                      onClick={() => onPreview(doc)}
                      title="Preview PDF"
                      aria-label={`Preview ${doc.title}`}
                    />
                    <a
                      href={downloadUrl}
                      download={doc.originalFilename}
                      className="btn btn-outline btn-sm table-download-btn"
                      id={`download-doc-${doc._id}`}
                      title="Download PDF"
                      aria-label={`Download ${doc.title}`}
                    >
                      <Download size={14} />
                      <span className="action-btn-text">Download</span>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Trash2}
                      onClick={() => onDelete(doc)}
                      id={`delete-doc-${doc._id}`}
                      className="btn-danger-ghost"
                      title="Delete document"
                      aria-label={`Delete ${doc.title}`}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

