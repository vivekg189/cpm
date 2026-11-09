import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CarFront,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  UploadCloud,
  Calendar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { getDashboardStats, getVehicles, createVehicle, uploadDocument } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import StatCard from '../components/dashboard/StatCard'
import ExpiryChart from '../components/dashboard/ExpiryChart'
import RecentVehicles from '../components/dashboard/RecentVehicles'
import RecentDocuments from '../components/dashboard/RecentDocuments'
import UpcomingExpirations from '../components/dashboard/UpcomingExpirations'
import QuickActions from '../components/dashboard/QuickActions'
import AddVehicleModal from '../components/vehicles/AddVehicleModal'
import DocumentUploadModal from '../components/documents/DocumentUploadModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/Alert'
import Button from '../components/common/Button'
import { useToast } from '../context/ToastContext'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [vehiclesList, setVehiclesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Direct modal controls from dashboard
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const loadData = async () => {
    try {
      const [statsRes, vehRes] = await Promise.all([
        getDashboardStats(),
        getVehicles().catch(() => ({ vehicles: [] })),
      ])
      setData(statsRes)
      setVehiclesList(vehRes.vehicles || [])
    } catch (e) {
      setError(e.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateVehicle = async (vehicleData) => {
    setActionLoading(true)
    try {
      await createVehicle(vehicleData)
      toast.success(`Vehicle ${vehicleData.registrationNumber} registered successfully!`)
      setShowAddVehicleModal(false)
      loadData()
    } catch (e) {
      throw e
    } finally {
      setActionLoading(false)
    }
  }

  const handleUploadDocument = async (formData) => {
    setActionLoading(true)
    try {
      await uploadDocument(formData)
      toast.success('Document uploaded and indexed successfully!')
      setShowUploadModal(false)
      loadData()
    } catch (e) {
      throw e
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading automotive dashboard..." fullPage />
  }

  if (error) {
    return (
      <div className="page-error-container">
        <PageHeader title="Dashboard" subtitle="Vehicle document operations center" />
        <Alert type="error" title="Unable to connect to backend service">
          {error}
        </Alert>
        <Button variant="primary" onClick={loadData} className="mt-4">
          Retry Loading
        </Button>
      </div>
    )
  }

  const { stats, recentVehicles = [], recentDocuments = [] } = data || {
    stats: { totalVehicles: 0, totalDocuments: 0, expiringDocuments: 0, expiredDocuments: 0 },
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Page Header with greeting and date badge */}
      <PageHeader
        title={
          <span>
            Welcome back to <span className="gradient-brand-text">VehicleVault</span>
          </span>
        }
        subtitle="Manage fleet compliance, document expirations, and cloud certifications seamlessly."
        badge={
          <span className="current-date-pill">
            <Calendar size={13} className="inline-icon text-primary" />
            <span>{currentDateFormatted}</span>
          </span>
        }
        actions={
          <div className="dashboard-header-buttons">
            <Button
              variant="outline"
              leftIcon={Plus}
              onClick={() => setShowAddVehicleModal(true)}
              id="dash-add-vehicle-btn"
            >
              Add Vehicle
            </Button>
            <Button
              variant="primary"
              leftIcon={UploadCloud}
              onClick={() => setShowUploadModal(true)}
              disabled={vehiclesList.length === 0}
              title={vehiclesList.length === 0 ? 'Register a vehicle first' : 'Upload document'}
              id="dash-upload-doc-btn"
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {/* 4 Statistics Cards */}
      <div className="stats-metric-grid">
        <StatCard
          icon={CarFront}
          value={stats.totalVehicles}
          label="Registered Vehicles"
          colorScheme="blue"
          trendLabel="Active Fleet"
          trendType="neutral"
          onClick={() => navigate('/vehicles')}
        />
        <StatCard
          icon={FileText}
          value={stats.totalDocuments}
          label="Total Documents"
          colorScheme="purple"
          trendLabel="Cloud Stored"
          trendType="positive"
          onClick={() => navigate('/documents')}
        />
        <StatCard
          icon={Clock}
          value={stats.expiringDocuments}
          label="Expiring Within 30 Days"
          colorScheme="amber"
          trendLabel={stats.expiringDocuments > 0 ? 'Action Needed' : 'Good Standing'}
          trendType={stats.expiringDocuments > 0 ? 'warning' : 'positive'}
          onClick={() => navigate('/documents?filter=expiring')}
        />
        <StatCard
          icon={AlertCircle}
          value={stats.expiredDocuments}
          label="Expired Documents"
          colorScheme="rose"
          trendLabel={stats.expiredDocuments > 0 ? 'Critical' : 'None Expired'}
          trendType={stats.expiredDocuments > 0 ? 'negative' : 'positive'}
          onClick={() => navigate('/documents?filter=expired')}
        />
      </div>

      {/* Quick Action Navigation Strip */}
      <QuickActions
        onAddVehicle={() => setShowAddVehicleModal(true)}
        onUploadDocument={() => setShowUploadModal(true)}
      />

      {/* Expiration warning banner if there are expiring documents */}
      <UpcomingExpirations documents={recentDocuments} />

      {/* Analytics and Recent Grids */}
      <div className="dashboard-split-layout">
        <div className="dashboard-main-col">
          <ExpiryChart stats={stats} />
        </div>

        <div className="dashboard-side-col">
          <RecentVehicles vehicles={recentVehicles} />
        </div>
      </div>

      <div className="dashboard-secondary-grid">
        <RecentDocuments documents={recentDocuments} />
      </div>

      {/* Global Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        onSubmit={handleCreateVehicle}
        isLoading={actionLoading}
      />

      {/* Global Upload Document Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadDocument}
        vehicles={vehiclesList}
      />
    </div>
  )
}
