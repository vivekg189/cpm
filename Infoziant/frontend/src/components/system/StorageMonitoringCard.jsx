import { HardDrive, FileText, CheckCircle2, FolderCheck } from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function StorageMonitoringCard({ stats, totalBytes = 0 }) {
  const docCount = stats?.totalDocuments || 0

  return (
    <div className="dashboard-card status-section-card">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <HardDrive size={20} className="text-purple" />
          <h2 className="card-heading">Document Storage Monitoring</h2>
        </div>
        <span className="status-badge badge-success badge-sm">
          <CheckCircle2 size={12} className="status-badge-icon" />
          <span>Volume Mounted</span>
        </span>
      </div>

      <div className="storage-stats-container">
        <div className="storage-metrics-grid">
          <div className="storage-metric-box">
            <span className="storage-metric-label">Docker Named Volume</span>
            <span className="storage-metric-val font-mono">vehicle_documents</span>
            <span className="storage-metric-sub">Mounted to /app/uploads</span>
          </div>

          <div className="storage-metric-box">
            <span className="storage-metric-label">Stored Documents</span>
            <span className="storage-metric-val">{docCount} Files</span>
            <span className="storage-metric-sub">PDF binary format</span>
          </div>

          <div className="storage-metric-box">
            <span className="storage-metric-label">Volume Storage Status</span>
            <span className="storage-metric-val text-success">Active &amp; Persistent</span>
            <span className="storage-metric-sub">Survives container restarts</span>
          </div>

          <div className="storage-metric-box">
            <span className="storage-metric-label">Vault Storage Used</span>
            <span className="storage-metric-val font-mono">{formatBytes(totalBytes)}</span>
            <span className="storage-metric-sub">Across all registered vehicles</span>
          </div>
        </div>

        <div className="volume-safety-note">
          <FolderCheck size={16} className="text-primary flex-shrink-0" />
          <p className="text-xs text-secondary">
            <strong>Volume Persistence Guarantee:</strong> PDF documents are physically stored in Docker&apos;s
            managed volume path rather than the ephemeral container layer. Rebuilding images or running{' '}
            <code>docker compose down</code> preserves all files intact.
          </p>
        </div>
      </div>
    </div>
  )
}

