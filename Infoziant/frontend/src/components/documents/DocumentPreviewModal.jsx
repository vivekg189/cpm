import { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { Download, FileText, ExternalLink, Calendar, CarFront, Loader2 } from 'lucide-react'
import { getDownloadUrl } from '../../services/api'
import ExpiryBadge from './ExpiryBadge'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentPreviewModal({ isOpen, onClose, document: doc }) {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  if (!doc) return null

  const downloadUrl = getDownloadUrl(doc._id)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.title}
      subtitle={`${doc.documentType} • ${doc.vehicle?.registrationNumber || 'Vehicle'}`}
      size="xl"
      footer={
        <div className="preview-modal-footer">
          <div className="preview-meta-summary">
            <span className="preview-size-tag">
              <FileText size={14} className="inline-icon text-muted" />
              {formatBytes(doc.fileSize)}
            </span>
            <span className="meta-bullet">•</span>
            <span className="preview-filename">{doc.originalFilename}</span>
          </div>
          <div className="preview-footer-actions">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <a
              href={downloadUrl}
              download={doc.originalFilename}
              className="btn btn-primary btn-md inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      }
    >
      <div className="document-preview-container">
        {/* Document information subheader */}
        <div className="preview-info-bar">
          <div className="preview-bar-item">
            <CarFront size={15} className="text-primary inline-icon" />
            <span className="font-semibold">{doc.vehicle?.registrationNumber}</span>
            <span className="text-muted-xs">
              ({doc.vehicle?.make} {doc.vehicle?.model})
            </span>
          </div>

          <div className="preview-bar-item">
            <Calendar size={15} className="text-secondary inline-icon" />
            <span className="text-muted-xs">Expiry:</span>
            <ExpiryBadge date={doc.expiryDate} />
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="pdf-viewer-box">
          {!iframeLoaded && (
            <div className="pdf-loading-overlay">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p>Loading document preview...</p>
            </div>
          )}
          <iframe
            src={`${downloadUrl}#toolbar=1&navpanes=0`}
            title={doc.title}
            className="pdf-iframe"
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      </div>
    </Modal>
  )
}

