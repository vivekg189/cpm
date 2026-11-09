import { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  CarFront,
  Files,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Layers,
  ShieldAlert,
} from 'lucide-react'
import { getHealth, getDashboardStats, getDocuments } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import HealthCard from '../components/system/HealthCard'
import ArchitectureCard from '../components/system/ArchitectureCard'
import StorageMonitoringCard from '../components/system/StorageMonitoringCard'
import SecurityInfoCard from '../components/system/SecurityInfoCard'
import StatCard from '../components/dashboard/StatCard'
import Button from '../components/common/Button'
import Alert from '../components/Alert'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useToast } from '../context/ToastContext'

export default function SystemStatus() {
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [totalStorageBytes, setTotalStorageBytes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)

  const toast = useToast()

  const fetchStatus = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    setError(null)
    try {
      const [h, s, docsRes] = await Promise.all([
        getHealth(),
        getDashboardStats(),
        getDocuments().catch(() => ({ documents: [] })),
      ])
      setHealth(h)
      setStats(s)
      setLastChecked(new Date())

      // Compute total stored file bytes from document records
      if (docsRes.documents) {
        const total = docsRes.documents.reduce((acc, curr) => acc + (curr.fileSize || 0), 0)
        setTotalStorageBytes(total)
      }

      if (isManual) {
        toast.success('System health metrics updated')
      }
    } catch (e) {
      setError(e.message || 'Could not connect to backend server')
      if (isManual) {
        toast.error('Health check failed: Backend unreachable')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStatus(false)
  }, [fetchStatus])

  return (
    <div className="system-status-page animate-fade-in">
      <PageHeader
        title="System Status"
        subtitle="Real-time infrastructure health, storage telemetry, and service topology."
        badge={
          health?.status === 'ok' ? (
            <span className="status-badge badge-success badge-sm">
              <CheckCircle2 size={12} className="status-badge-icon" />
              <span>Operational</span>
            </span>
          ) : (
            <span className="status-badge badge-danger badge-sm">
              <AlertCircle size={12} className="status-badge-icon" />
              <span>Degraded</span>
            </span>
          )
        }
        actions={
          <Button
            variant="outline"
            leftIcon={RefreshCw}
            onClick={() => fetchStatus(true)}
            isLoading={refreshing}
            disabled={loading || refreshing}
            id="refresh-status-btn"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        }
      />

      {error && !loading && (
        <Alert
          type="error"
          title="Backend API Unreachable"
          className="mb-6"
        >
          {error}. Please check that the Docker Compose network and Node backend container are healthy and running.
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message="Polling system telemetry and health metrics..." />
      ) : (
        <div className="system-status-sections-grid">
          {/* Quick Metrics Bar */}
          {stats && (
            <div className="status-stats-grid">
              <StatCard
                icon={CarFront}
                value={stats.stats.totalVehicles}
                label="Total Registered Vehicles"
                colorScheme="blue"
              />
              <StatCard
                icon={Files}
                value={stats.stats.totalDocuments}
                label="Stored Documents"
                colorScheme="purple"
              />
              <StatCard
                icon={Clock}
                value={stats.stats.expiringDocuments}
                label="Expiring Within 30 Days"
                colorScheme="amber"
              />
              <StatCard
                icon={AlertCircle}
                value={stats.stats.expiredDocuments}
                label="Expired Documents"
                colorScheme="rose"
              />
            </div>
          )}

          {/* Health & Storage Grid */}
          <div className="status-two-col-grid">
            <HealthCard health={health} lastChecked={lastChecked} />
            <StorageMonitoringCard stats={stats?.stats} totalBytes={totalStorageBytes} />
          </div>

          {/* Architecture Topology */}
          <ArchitectureCard />

          {/* Security Limitation & Hardening Info */}
          <SecurityInfoCard />
        </div>
      )}
    </div>
  )
}
