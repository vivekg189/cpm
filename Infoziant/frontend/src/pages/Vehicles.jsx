import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CarFront,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  FileText,
  AlertCircle,
  QrCode,
  FileDown,
  Layers,
} from 'lucide-react'
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getDocuments,
} from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import VehicleCard from '../components/vehicles/VehicleCard'
import VehicleTable from '../components/vehicles/VehicleTable'
import AddVehicleModal from '../components/vehicles/AddVehicleModal'
import VehicleDetailsModal from '../components/vehicles/VehicleDetailsModal'
import QrCodeModal from '../components/vehicles/QrCodeModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import DocumentUploadModal from '../components/documents/DocumentUploadModal'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/Alert'
import { useToast } from '../context/ToastContext'

const FLEET_GROUPS = [
  'ALL',
  'Personal',
  'Commercial Fleet',
  'Executive',
  'Delivery Vans',
  'Heavy Haulage',
  'Operations',
]

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [docCounts, setDocCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtering, Searching & Sorting
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFleetGroup, setSelectedFleetGroup] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedMake, setSelectedMake] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('vv_vehicle_view') || 'grid'
  })

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [viewingDetailsVehicle, setViewingDetailsVehicle] = useState(null)
  const [qrCodeVehicle, setQrCodeVehicle] = useState(null)
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Direct upload modal from vehicle card/details
  const [uploadVehicleTarget, setUploadVehicleTarget] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [vehRes, docRes] = await Promise.all([
        getVehicles({
          fleetGroup: selectedFleetGroup !== 'ALL' ? selectedFleetGroup : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        }),
        getDocuments().catch(() => ({ documents: [] })),
      ])
      setVehicles(vehRes.vehicles || [])

      const counts = {}
      if (docRes.documents) {
        docRes.documents.forEach((d) => {
          const vId = d.vehicle?._id || d.vehicle
          if (vId) counts[vId] = (counts[vId] || 0) + 1
        })
      }
      setDocCounts(counts)
    } catch (e) {
      setError(e.message || 'Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }, [selectedFleetGroup, selectedStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('action') === 'add') {
      setShowAddModal(true)
      navigate('/vehicles', { replace: true })
    }
  }, [location.search, navigate])

  const handleToggleView = (mode) => {
    setViewMode(mode)
    localStorage.setItem('vv_vehicle_view', mode)
  }

  const distinctMakes = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.make).filter(Boolean))
    return Array.from(set).sort()
  }, [vehicles])

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const matchesSearch =
          !searchTerm.trim() ||
          v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.assignedDriver?.name && v.assignedDriver.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (v.notes && v.notes.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesMake = selectedMake === 'ALL' || v.make === selectedMake

        return matchesSearch && matchesMake
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
        if (sortBy === 'yearDesc') return b.year - a.year
        if (sortBy === 'regAsc') return a.registrationNumber.localeCompare(b.registrationNumber)
        return 0
      })
  }, [vehicles, searchTerm, selectedMake, sortBy])

  const handleSaveVehicle = async (payload) => {
    if (editingVehicle) {
      await updateVehicle(editingVehicle._id, payload)
      toast.success(`Vehicle ${payload.registrationNumber} updated successfully`)
    } else {
      await createVehicle(payload)
      toast.success(`Vehicle ${payload.registrationNumber} created successfully`)
    }
    setShowAddModal(false)
    setEditingVehicle(null)
    loadData()
  }

  const handleDeleteVehicle = async () => {
    if (!confirmDeleteVehicle) return
    setIsDeleting(true)
    try {
      await deleteVehicle(confirmDeleteVehicle._id)
      toast.success(`Vehicle ${confirmDeleteVehicle.registrationNumber} deleted`)
      setConfirmDeleteVehicle(null)
      loadData()
    } catch (e) {
      toast.error(e.message || 'Failed to delete vehicle')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="vehicles-page animate-fade-in">
      <PageHeader
        title="Vehicles &amp; Fleet Management"
        subtitle="Manage fleet groupings, assigned drivers, QR inspection badges, and compliance certificates."
        badge={
          <span className="badge-subtle font-semibold">
            {vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''} Listed
          </span>
        }
        actions={
          <Button
            variant="primary"
            leftIcon={Plus}
            onClick={() => {
              setEditingVehicle(null)
              setShowAddModal(true)
            }}
            id="add-vehicle-btn"
          >
            Add Vehicle
          </Button>
        }
      />

      {error && <Alert type="error">{error}</Alert>}

      {/* Fleet Group Filter Tabs */}
      <div className="fleet-group-tabs-bar mb-4">
        {FLEET_GROUPS.map((grp) => (
          <button
            key={grp}
            type="button"
            className={`fleet-tab-btn ${selectedFleetGroup === grp ? 'active' : ''}`}
            onClick={() => setSelectedFleetGroup(grp)}
          >
            {grp === 'ALL' ? 'All Fleets' : grp}
          </button>
        ))}
      </div>

      {/* Control Bar: Search, Filters & View Switcher */}
      <div className="collection-control-bar">
        <div className="control-bar-left">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by registration, make, driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control-search-input"
              id="search-vehicles-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-select-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="control-select"
              id="filter-make-select"
            >
              <option value="ALL">All Manufacturers</option>
              {distinctMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="control-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="control-bar-right">
          <div className="sort-select-wrapper">
            <ArrowUpDown size={16} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="newest">Recently Registered</option>
              <option value="oldest">Oldest First</option>
              <option value="yearDesc">Manufacturing Year</option>
              <option value="regAsc">Registration (A-Z)</option>
            </select>
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleToggleView('grid')}
              title="Grid card view"
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleToggleView('table')}
              title="Table view"
              aria-label="Table view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Grid / Table View */}
      {loading ? (
        <LoadingSpinner message="Loading registered fleet..." />
      ) : vehicles.length === 0 ? (
        <div className="card-glass-wrapper p-8">
          <EmptyState
            icon={CarFront}
            title="No vehicles found in this group"
            description="Start by registering a vehicle into your fleet to track compliance, attach documents, and log maintenance."
            actionText="Register Vehicle"
            actionIcon={Plus}
            onAction={() => {
              setEditingVehicle(null)
              setShowAddModal(true)
            }}
          />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="card-glass-wrapper p-8">
          <EmptyState
            icon={Search}
            title="No vehicles match your search"
            description="Try modifying search keywords or clearing fleet filters."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('')
              setSelectedMake('ALL')
              setSelectedFleetGroup('ALL')
              setSelectedStatus('ALL')
            }}
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="vehicles-card-grid">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle._id}
              vehicle={vehicle}
              docCount={docCounts[vehicle._id] || 0}
              onEdit={(v) => {
                setEditingVehicle(v)
                setShowAddModal(true)
              }}
              onDelete={(v) => setConfirmDeleteVehicle(v)}
              onViewDetails={(v) => setViewingDetailsVehicle(v)}
              onViewDocuments={(v) => navigate(`/documents?vehicleId=${v._id}`)}
              onOpenQrCode={(v) => setQrCodeVehicle(v)}
            />
          ))}
        </div>
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          docCounts={docCounts}
          onEdit={(v) => {
            setEditingVehicle(v)
            setShowAddModal(true)
          }}
          onDelete={(v) => setConfirmDeleteVehicle(v)}
          onViewDetails={(v) => setViewingDetailsVehicle(v)}
          onViewDocuments={(v) => navigate(`/documents?vehicleId=${v._id}`)}
          onOpenQrCode={(v) => setQrCodeVehicle(v)}
        />
      )}

      {/* Add / Edit Vehicle Modal */}
      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingVehicle(null)
        }}
        onSubmit={handleSaveVehicle}
        vehicleToEdit={editingVehicle}
      />

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        isOpen={!!viewingDetailsVehicle}
        onClose={() => setViewingDetailsVehicle(null)}
        vehicle={viewingDetailsVehicle}
        docCount={viewingDetailsVehicle ? docCounts[viewingDetailsVehicle._id] || 0 : 0}
        onEdit={(v) => {
          setViewingDetailsVehicle(null)
          setEditingVehicle(v)
          setShowAddModal(true)
        }}
        onUploadDocument={(v) => setUploadVehicleTarget(v)}
        onViewDocuments={(v) => navigate(`/documents?vehicleId=${v._id}`)}
        onOpenQrCode={(v) => setQrCodeVehicle(v)}
      />

      {/* QR Code Inspection Modal */}
      <QrCodeModal
        isOpen={!!qrCodeVehicle}
        onClose={() => setQrCodeVehicle(null)}
        vehicle={qrCodeVehicle}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDeleteVehicle}
        onClose={() => setConfirmDeleteVehicle(null)}
        onConfirm={handleDeleteVehicle}
        title="Delete Vehicle"
        message={`Are you sure you want to permanently delete vehicle ${confirmDeleteVehicle?.registrationNumber}? All attached documents, maintenance logs, expenses, and PDF files stored on disk will be unlinked and purged.`}
        confirmText="Delete Vehicle & Records"
        isLoading={isDeleting}
      />

      {/* Direct upload modal from details */}
      {uploadVehicleTarget && (
        <DocumentUploadModal
          isOpen={!!uploadVehicleTarget}
          onClose={() => setUploadVehicleTarget(null)}
          onSubmit={async (fd) => {
            await uploadDocument(fd)
            toast.success('Document uploaded successfully')
            setUploadVehicleTarget(null)
            loadData()
          }}
          vehicles={vehicles}
          preselectedVehicleId={uploadVehicleTarget._id}
        />
      )}
    </div>
  )
}
