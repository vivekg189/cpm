import { Activity, Database, Clock, Server, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'

function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`
  return `${h}h ${m}m ${s}s`
}

export default function HealthCard({ health, lastChecked }) {
  const isHealthy = health?.status === 'ok'
  const dbStatus = health?.database?.status || 'unknown'
  const isDbConnected = dbStatus === 'connected'

  return (
    <div className="dashboard-card status-section-card">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <Activity size={20} className="text-primary" />
          <h2 className="card-heading">Application &amp; Service Health</h2>
        </div>
        <span className={`status-badge badge-${isHealthy ? 'success' : 'danger'} badge-sm`}>
          {isHealthy ? <CheckCircle2 size={12} className="status-badge-icon" /> : <AlertCircle size={12} className="status-badge-icon" />}
          <span>{isHealthy ? 'All Systems Operational' : 'Degraded Performance'}</span>
        </span>
      </div>

      <div className="system-health-rows">
        <div className="health-row-item">
          <div className="health-row-label-group">
            <Server size={16} className="text-muted" />
            <span>API Gateway &amp; Express Server</span>
          </div>
          <div className="health-row-value-group">
            <span className={`status-dot ${isHealthy ? 'green' : 'red'}`} />
            <span className="font-semibold">{isHealthy ? 'Healthy' : 'Unhealthy'}</span>
          </div>
        </div>

        <div className="health-row-item">
          <div className="health-row-label-group">
            <Database size={16} className="text-muted" />
            <span>MongoDB Database Connection</span>
          </div>
          <div className="health-row-value-group">
            <span className={`status-dot ${isDbConnected ? 'green' : 'red'}`} />
            <span className="font-semibold capitalize">{dbStatus}</span>
          </div>
        </div>

        <div className="health-row-item">
          <div className="health-row-label-group">
            <Clock size={16} className="text-muted" />
            <span>Backend Server Uptime</span>
          </div>
          <div className="health-row-value-group">
            <span className="font-mono text-sm">{formatUptime(health?.uptime)}</span>
          </div>
        </div>

        <div className="health-row-item">
          <div className="health-row-label-group">
            <Activity size={16} className="text-muted" />
            <span>API Platform Version</span>
          </div>
          <div className="health-row-value-group">
            <span className="badge-subtle font-mono">v{health?.version || '1.0.0'}</span>
          </div>
        </div>

        <div className="health-row-item">
          <div className="health-row-label-group">
            <Clock size={16} className="text-muted" />
            <span>Last Health Check</span>
          </div>
          <div className="health-row-value-group">
            <span className="text-secondary text-sm">
              {lastChecked ? lastChecked.toLocaleTimeString() : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

