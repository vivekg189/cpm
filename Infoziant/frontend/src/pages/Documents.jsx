import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Files,
  UploadCloud,
  Search,
  Filter,
  ArrowUpDown,
  CarFront,
  ShieldAlert,
  FileCheck2,
  Trash2,
  Download,
} from 'lucide-react'
import {
  getDocuments,
  getVehicles,
  uploadDocument,
  deleteDocument,
  getDownloadUrl,
} from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import DocumentTable from '../components/documents/DocumentTable'
import DocumentUploadModal from '../components/documents/DocumentUploadModal'
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/Alert'
import { useToast } from '../context/ToastContext'

const DOCUMENT_CATEGORIES = [
  'Insurance',
  'Registration Certificate',
  'Pollution Certificate',
  'Road Tax',
  'Fitness Certificate',
  'Permit',
  'Other',
]

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVehicleId, setFilterVehicleId] = useState('')
  const [filterDocType, setFilterDocType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL') // 'ALL' | 'valid' | 'expiring' | 'expired' | 'noExpiry'
  const [sortBy, setSortBy] = useState('uploadedDesc') // 'uploadedDesc' | 'uploadedAsc' | 'expiryAsc' | 'expiryDesc' | 'titleAsc'

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [docRes, vehRes] = await Promise.all([
        getDocuments(filterVehicleId || undefined),
        getVehicles(),
      ])
      setDocuments(docRes.documents || [])
      setVehicles(vehRes.vehicles || [])
    } catch (e) {
      setError(e.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [filterVehicleId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Parse search params on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('action') === 'upload') {
      setShowUploadModal(true)
    }
    const vehicleParam = params.get('vehicleId')
    if (vehicleParam) {
      setFilterVehicleId(vehicleParam)
    }
    const filterParam = params.get('filter')
    if (filterParam === 'expiring') {
      setFilterStatus('expiring')
    } else if (filterParam === 'expired') {
      setFilterStatus('expired')
    }
    const searchParam = params.get('search')
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [location.search])

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return documents
      .filter((doc) => {
        // Search text matching
        const term = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !term ||
          doc.title.toLowerCase().includes(term) ||
          doc.originalFilename.toLowerCase().includes(term) ||
          (doc.vehicle?.registrationNumber &&
            doc.vehicle.registrationNumber.toLowerCase().includes(term))

        // Document Type filter
        const matchesType =
          filterDocType === 'ALL' || doc.documentType === filterDocType

        // Expiry Status filter
        let matchesStatus = true
        if (filterStatus === 'expired') {
          matchesStatus = !!doc.expiryDate && new Date(doc.expiryDate) < now
        } else if (filterStatus === 'expiring') {
          matchesStatus =
            !!doc.expiryDate &&
            new Date(doc.expiryDate) >= now &&
            new Date(doc.expiryDate) <= thirtyDaysFromNow
        } else if (filterStatus === 'valid') {
          matchesStatus =
            !!doc.expiryDate && new Date(doc.expiryDate) > thirtyDaysFromNow
        } else if (filterStatus === 'noExpiry') {
          matchesStatus = !doc.expiryDate
        }

        return matchesSearch && matchesType && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'uploadedDesc') return new Date(b.uploadedAt) - new Date(a.uploadedAt)
        if (sortBy === 'uploadedAsc') return new Date(a.uploadedAt) - new Date(b.uploadedAt)
        if (sortBy === 'expiryAsc') {
          if (!a.expiryDate) return 1
          if (!b.expiryDate) return -1
          return new Date(a.expiryDate) - new Date(b.expiryDate)
        }
        if (sortBy === 'expiryDesc') {
          if (!a.expiryDate) return 1
          if (!b.expiryDate) return -1
          return new Date(b.expiryDate) - new Date(a.expiryDate)
        }
        if (sortBy === 'titleAsc') return a.title.localeCompare(b.title)
        return 0
      })
  }, [documents, searchTerm, filterDocType, filterStatus, sortBy])

  const handleUploadSubmit = async (formData) => {
    await uploadDocument(formData)
    toast.success('Document successfully saved and stored in volume')
    setShowUploadModal(false)
    loadData()
  }

  const handleDeleteDocument = async () => {
    if (!confirmDeleteDoc) return
    setIsDeleting(true)
    try {
      await deleteDocument(confirmDeleteDoc._id)
      toast.success(`Document "${confirmDeleteDoc.title}" deleted`)
      setConfirmDeleteDoc(null)
      loadData()
    } catch (e) {
      toast.error(e.message || 'Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="documents-page animate-fade-in">
      <PageHeader
        title="Documents"
        subtitle="Upload, preview, and monitor compliance for all your vehicle certificates and policies."
        badge={
          <span className="badge-subtle font-semibold">
            {documents.length} File{documents.length !== 1 ? 's' : ''} in Vault
          </span>
        }
        actions={
          <Button
            variant="primary"
            leftIcon={UploadCloud}
            onClick={() => setShowUploadModal(true)}
            disabled={vehicles.length === 0}
            title={vehicles.length === 0 ? 'Register a vehicle first' : 'Upload document'}
            id="upload-doc-btn"
          >
            Upload PDF
          </Button>
        }
      />

      {error && <Alert type="error">{error}</Alert>}

      {vehicles.length === 0 && !loading && (
        <Alert type="warning" title="No Vehicles Registered">
          Please register at least one vehicle in the{' '}
          <button
            type="button"
            className="text-primary underline font-medium"
            onClick={() => navigate('/vehicles')}
          >
            Vehicles section
          </button>{' '}
          before uploading compliance documents.
        </Alert>
      )}

      {/* Control Bar: Search, Filters & Sorting */}
      <div className="collection-control-bar">
        <div className="control-bar-left">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, filename, plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control-search-input"
              id="search-documents-input"
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

          {/* Vehicle Filter */}
          <div className="filter-select-wrapper">
            <CarFront size={16} className="filter-icon" />
            <select
              value={filterVehicleId}
              onChange={(e) => setFilterVehicleId(e.target.value)}
              className="control-select"
              id="filter-vehicle"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} — {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Filter */}
          <div className="filter-select-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="control-select"
            >
              <option value="ALL">All Categories</option>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Status Filter */}
          <div className="filter-select-wrapper">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="control-select status-select"
            >
              <option value="ALL">All Expiry Statuses</option>
              <option value="valid">Valid &amp; Active</option>
              <option value="expiring">Expiring Soon (&le; 30d)</option>
              <option value="expired">Expired</option>
              <option value="noExpiry">No Expiry Date</option>
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
              <option value="uploadedDesc">Upload Date (Newest)</option>
              <option value="uploadedAsc">Upload Date (Oldest)</option>
              <option value="expiryAsc">Expiry Date (Expiring First)</option>
              <option value="expiryDesc">Expiry Date (Latest First)</option>
              <option value="titleAsc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Documents Table View */}
      {loading ? (
        <LoadingSpinner message="Loading document vault..." />
      ) : documents.length === 0 ? (
        <div className="card-glass-wrapper p-8">
          <EmptyState
            icon={Files}
            title="Document vault is empty"
            description="Upload insurance policies, registration certificates (RC), pollution checks (PUC), and fitness certificates to enable automated expiry tracking."
            actionText={vehicles.length > 0 ? 'Upload First Document' : 'Register Vehicle First'}
            actionIcon={UploadCloud}
            onAction={() => {
              if (vehicles.length > 0) {
                setShowUploadModal(true)
              } else {
                navigate('/vehicles?action=add')
              }
            }}
          />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="card-glass-wrapper p-8">
          <EmptyState
            icon={Search}
            title="No documents match your query"
            description="Try modifying your filters or clearing search criteria."
            actionText="Clear All Filters"
            onAction={() => {
              setSearchTerm('')
              setFilterVehicleId('')
              setFilterDocType('ALL')
              setFilterStatus('ALL')
            }}
          />
        </div>
      ) : (
        <DocumentTable
          documents={filteredDocuments}
          onPreview={(doc) => setPreviewDoc(doc)}
          onDelete={(doc) => setConfirmDeleteDoc(doc)}
        />
      )}

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
        vehicles={vehicles}
        preselectedVehicleId={filterVehicleId}
      />

      {/* PDF Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />

      {/* Confirm Document Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDeleteDoc}
        onClose={() => setConfirmDeleteDoc(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${confirmDeleteDoc?.title}"? The PDF file stored at /app/uploads will be unlinked and purged from disk.`}
        confirmText="Delete Document"
        isLoading={isDeleting}
      />
    </div>
  )
}
