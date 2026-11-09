import { useState, useEffect, useCallback } from 'react'
import {
  History,
  Filter,
  CarFront,
  Files,
  Wrench,
  Receipt,
  FileCheck,
  Activity,
  ShieldCheck,
  Clock,
  User,
} from 'lucide-react'
import { getActivityLogs } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Alert from '../components/Alert'

const ENTITY_ICONS = {
  Vehicle: CarFront,
  Document: Files,
  Maintenance: Wrench,
  Expense: Receipt,
  Report: FileCheck,
  System: Activity,
}

export default function ActivityLog() {
  const [activities, setActivities] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState('ALL')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getActivityLogs({
        entityType: selectedEntity !== 'ALL' ? selectedEntity : undefined,
        limit: 50,
      })
      setActivities(res.activities || [])
      setTotal(res.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to fetch audit log')
    } finally {
      setLoading(false)
    }
  }, [selectedEntity])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getActionBadgeColor = (action) => {
    if (action.includes('DELETED')) return 'badge-danger'
    if (action.includes('CREATED') || action.includes('UPLOADED')) return 'badge-success'
    if (action.includes('UPDATED')) return 'badge-warning'
    return 'badge-info'
  }

  return (
    <div className="activity-page animate-fade-in">
      <PageHeader
        title="Activity Logs &amp; Audit Trail"
        subtitle="Immutable chronological history of all fleet modifications, document uploads, and system operations."
        badge={
          <span className="badge-subtle font-semibold">
            {total} Audit Record{total !== 1 ? 's' : ''}
          </span>
        }
      />

      {error && <Alert type="error">{error}</Alert>}

      {/* Filter Bar */}
      <div className="collection-control-bar">
        <div className="control-bar-left">
          <div className="filter-select-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="control-select"
            >
              <option value="ALL">All Entity Types</option>
              <option value="Vehicle">Vehicle Operations</option>
              <option value="Document">Document Operations</option>
              <option value="Maintenance">Maintenance Logs</option>
              <option value="Expense">Expense Entries</option>
              <option value="Report">Report Generations</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving tamper-evident audit trail..." />
      ) : activities.length === 0 ? (
        <div className="card-glass-wrapper p-8">
          <EmptyState
            icon={History}
            title="No activity recorded yet"
            description="All fleet actions, document additions, and edits will be automatically logged in this audit trail."
          />
        </div>
      ) : (
        <div className="activity-timeline-card dashboard-card">
          <div className="activity-timeline-list">
            {activities.map((act) => {
              const IconComponent = ENTITY_ICONS[act.entityType] || Activity
              return (
                <div key={act._id} className="timeline-item-row">
                  <div className="timeline-icon-box">
                    <IconComponent size={18} className="text-primary" />
                  </div>
                  <div className="timeline-content-group">
                    <div className="timeline-title-bar">
                      <span className="timeline-entity-name font-semibold text-main">
                        {act.entityName || act.entityType}
                      </span>
                      <span className={`status-badge ${getActionBadgeColor(act.action)} badge-sm`}>
                        {act.action.replace('_', ' ')}
                      </span>
                    </div>
                    {act.details && <p className="timeline-details-text">{act.details}</p>}
                    <div className="timeline-meta-bar">
                      <span className="timeline-time">
                        <Clock size={12} className="inline-icon" />
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                      <span className="meta-bullet">•</span>
                      <span className="timeline-ip font-mono text-xs text-muted">
                        IP: {act.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

