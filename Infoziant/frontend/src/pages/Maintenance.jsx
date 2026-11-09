import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CarFront,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react'
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getVehicles,
} from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/Alert'
import { useToast } from '../context/ToastContext'

const SERVICE_TYPES = [
  'Oil & Filter Change',
  'Brake System Service',
  'Tire Rotation & Balancing',
  'General Periodic Service',
  'Engine & Transmission Tune-Up',
  'Battery & Electrical Check',
  'Cooling System Flush',
  'Suspension & Wheel Alignment',
  'Air Conditioning Service',
  'Bodywork & Painting',
  'Emergency Repair',
  'Other Inspection',
]

const emptyForm = {
  vehicleId: '',
  serviceType: SERVICE_TYPES[0],
  serviceDate: new Date().toISOString().split('T')[0],
  odometerReading: '',
  cost: '',
  performedBy: '',
  invoiceNumber: '',
  nextDueDate: '',
  nextDueOdometer: '',
  status: 'completed',
  notes: '',
}

export default function Maintenance() {
  const [records, setRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const toast = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [maintRes, vehRes] = await Promise.all([
        getMaintenanceRecords({
          vehicleId: filterVehicle || undefined,
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
        }),
        getVehicles().catch(() => ({ vehicles: [] })),
      ])
      setRecords(maintRes.records || [])
      setVehicles(vehRes.vehicles || [])
    } catch (err) {
      setError(err.message || 'Failed to load maintenance records')
    } finally {
      setLoading(false)
    }
  }, [filterVehicle, filterStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreate = () => {
    setEditingRecord(null)
    setForm({
      ...emptyForm,
      vehicleId: vehicles[0]?._id || '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (rec) => {
    setEditingRecord(rec)
    setForm({
      vehicleId: rec.vehicle?._id || rec.vehicle || '',
      serviceType: rec.serviceType || SERVICE_TYPES[0],
      serviceDate: rec.serviceDate ? rec.serviceDate.split('T')[0] : '',
      odometerReading: rec.odometerReading || '',
      cost: rec.cost || '',
      performedBy: rec.performedBy || '',
      invoiceNumber: rec.invoiceNumber || '',
      nextDueDate: rec.nextServiceDue?.date ? rec.nextServiceDue.date.split('T')[0] : '',
      nextDueOdometer: rec.nextServiceDue?.odometer || '',
      status: rec.status || 'completed',
      notes: rec.notes || '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.vehicleId) errs.vehicleId = 'Please select a vehicle'
    if (!form.serviceType) errs.serviceType = 'Service type is required'
    if (!form.performedBy.trim()) errs.performedBy = 'Workshop / Service center name is required'
    if (form.cost === '' || Number(form.cost) < 0) errs.cost = 'Valid cost is required'
    if (form.odometerReading === '' || Number(form.odometerReading) < 0) {
      errs.odometerReading = 'Valid odometer reading (km) is required'
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        vehicleId: form.vehicleId,
        serviceType: form.serviceType,
        serviceDate: form.serviceDate,
        odometerReading: Number(form.odometerReading),
        cost: Number(form.cost),
        performedBy: form.performedBy.trim(),
        invoiceNumber: form.invoiceNumber.trim(),
        nextServiceDue: {
          date: form.nextDueDate || null,
          odometer: form.nextDueOdometer ? Number(form.nextDueOdometer) : null,
        },
        status: form.status,
        notes: form.notes.trim(),
      }

      if (editingRecord) {
        await updateMaintenanceRecord(editingRecord._id, payload)
        toast.success('Maintenance record updated successfully')
      } else {
        await createMaintenanceRecord(payload)
        toast.success('Service log recorded successfully')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save maintenance record')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteMaintenanceRecord(confirmDelete._id)
      toast.success('Maintenance record deleted')
      setConfirmDelete(null)
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete record')
    } finally {
      setDeleting(false)
    }
  }

  // Summary statistics
  const totalCost = useMemo(() => {
    return records.reduce((acc, curr) => acc + (curr.cost || 0), 0)
  }, [records])

  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return records.filter((r) => {
      const matchesSearch =
        !term ||
        r.serviceType.toLowerCase().includes(term) ||
        r.performedBy.toLowerCase().includes(term) ||
        (r.vehicle?.registrationNumber &&
          r.vehicle.registrationNumber.toLowerCase().includes(term))
      return matchesSearch
    })
  }, [records, searchTerm])

  return (
    <div className="maintenance-page animate-fade-in">
      <PageHeader
        title="Vehicle Maintenance &amp; Service History"
        subtitle="Track oil changes, mechanical repairs, scheduled services, and workshop invoices."
        badge={
          <span className="badge-subtle font-semibold">
            {records.length} Service Log{records.length !== 1 ? 's' : ''}
          </span>
        }
        actions={
          <Button
            variant="primary"
            leftIcon={Plus}
            onClick={openCreate}
            disabled={vehicles.length === 0}
          >
            Log Service Record
          </Button>
        }
      />

      {error && <Alert type="error">{error}</Alert>}

      {/* Metrics Banner */}
      <div className="stats-metric-grid">
        <div className="dashboard-stat-card scheme-blue">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Wrench size={22} />
            </div>
            <span className="stat-trend-tag trend-positive">Total Logs</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value">{records.length}</div>
            <div className="stat-card-label">Services Recorded</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>

        <div className="dashboard-stat-card scheme-purple">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <DollarSign size={22} />
            </div>
            <span className="stat-trend-tag trend-neutral">Cumulative</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value font-mono">₹{totalCost.toLocaleString()}</div>
            <div className="stat-card-label">Total Maintenance Spend</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>

        <div className="dashboard-stat-card scheme-amber">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Clock size={22} />
            </div>
            <span className="stat-trend-tag trend-warning">Upcoming</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value">
              {records.filter((r) => r.nextServiceDue?.date).length}
            </div>
            <div className="stat-card-label">Next Service Deadlines</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>

        <div className="dashboard-stat-card scheme-rose">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <CarFront size={22} />
            </div>
            <span className="stat-trend-tag trend-neutral">Serviced</span>
          </div>
          <div className="stat-card-bottom">
            <div className="stat-card-value">
              {new Set(records.map((r) => r.vehicle?._id)).size}
            </div>
            <div className="stat-card-label">Vehicles Maintained</div>
          </div>
          <div className="stat-card-accent-line" />
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="collection-control-bar">
        <div className="control-bar-left">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by service, workshop, plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control-search-input"
            />
          </div>

          <div className="filter-select-wrapper">
            <CarFront size={16} className="filter-icon" />
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="control-select"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} — {v.make}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="control-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Loading maintenance records..." />
      ) : records.length === 0 ? (
        <div className="card-glass-wrapper p-8">
          <EmptyState
            icon={Wrench}
            title="No service records logged yet"
            description="Log vehicle services, oil changes, tire rotations, and repair invoices to keep your fleet in peak operating condition."
            actionText="Log First Service"
            actionIcon={Plus}
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th>Vehicle &amp; Registration</th>
                <th>Service Type</th>
                <th>Service Date</th>
                <th>Odometer</th>
                <th>Workshop / Center</th>
                <th>Cost</th>
                <th>Next Due</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec._id} className="table-row-hover">
                  <td>
                    <span className="plate-pill sm">
                      {rec.vehicle?.registrationNumber || 'Vehicle'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 font-medium">
                      <Wrench size={14} className="text-primary inline-icon" />
                      <span>{rec.serviceType}</span>
                    </div>
                  </td>
                  <td className="text-secondary text-sm">
                    {new Date(rec.serviceDate).toLocaleDateString()}
                  </td>
                  <td className="font-mono text-sm">{rec.odometerReading.toLocaleString()} km</td>
                  <td className="text-sm font-medium">{rec.performedBy}</td>
                  <td className="font-mono font-semibold text-primary">
                    ₹{rec.cost.toLocaleString()}
                  </td>
                  <td className="text-secondary text-xs">
                    {rec.nextServiceDue?.date ? (
                      <span>{new Date(rec.nextServiceDue.date).toLocaleDateString()}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge badge-${
                        rec.status === 'completed'
                          ? 'success'
                          : rec.status === 'scheduled'
                          ? 'warning'
                          : 'info'
                      } badge-sm`}
                    >
                      {rec.status === 'completed' ? (
                        <CheckCircle2 size={12} className="status-badge-icon" />
                      ) : (
                        <Clock size={12} className="status-badge-icon" />
                      )}
                      <span className="capitalize">{rec.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td>
                    <div className="table-actions-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Edit2}
                        onClick={() => openEdit(rec)}
                        title="Edit log"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Trash2}
                        onClick={() => setConfirmDelete(rec)}
                        className="btn-danger-ghost"
                        title="Delete log"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Maintenance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRecord ? 'Edit Maintenance Record' : 'Log Maintenance & Service'}
        subtitle="Record workshop servicing, parts replacement, and next scheduled intervals"
        size="md"
      >
        <form onSubmit={handleSubmit} className="vehicle-form-layout">
          <div className="form-grid-two">
            <Select
              label="Vehicle"
              required
              value={form.vehicleId}
              onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
              error={formErrors.vehicleId}
            >
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} — {v.make} {v.model}
                </option>
              ))}
            </Select>

            <Select
              label="Service Type"
              required
              value={form.serviceType}
              onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
              error={formErrors.serviceType}
              options={SERVICE_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div className="form-grid-two">
            <Input
              label="Service Date"
              type="date"
              required
              value={form.serviceDate}
              onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
            />

            <Input
              label="Odometer Reading (km)"
              type="number"
              required
              placeholder="e.g. 45000"
              value={form.odometerReading}
              onChange={(e) => setForm((f) => ({ ...f, odometerReading: e.target.value }))}
              error={formErrors.odometerReading}
            />
          </div>

          <div className="form-grid-two">
            <Input
              label="Workshop / Service Center"
              required
              placeholder="e.g. Authorized Bosch Center"
              value={form.performedBy}
              onChange={(e) => setForm((f) => ({ ...f, performedBy: e.target.value }))}
              error={formErrors.performedBy}
            />

            <Input
              label="Total Cost (₹)"
              type="number"
              required
              placeholder="e.g. 3500"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              error={formErrors.cost}
            />
          </div>

          <div className="form-grid-two">
            <Input
              label="Next Service Due Date"
              type="date"
              value={form.nextDueDate}
              onChange={(e) => setForm((f) => ({ ...f, nextDueDate: e.target.value }))}
            />

            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={[
                { value: 'completed', label: 'Completed' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'in_progress', label: 'In Progress' },
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="maint-notes">
              Work Done &amp; Invoice Notes
            </label>
            <textarea
              id="maint-notes"
              className="form-textarea"
              rows={3}
              placeholder="List replaced parts, synthetic oil brand, warranty notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="modal-actions-right">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingRecord ? 'Save Changes' : 'Record Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Service Record"
        message={`Are you sure you want to delete this ${confirmDelete?.serviceType} maintenance log?`}
        isLoading={deleting}
      />
    </div>
  )
}

