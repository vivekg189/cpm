import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import Alert from '../Alert'
import { CarFront, Calendar, Tag, Fuel, Users, ShieldCheck } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

const FLEET_GROUPS = [
  'Personal',
  'Commercial Fleet',
  'Executive',
  'Delivery Vans',
  'Heavy Haulage',
  'Operations',
  'Other',
]

const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'CNG',
  'Other',
]

const VEHICLE_STATUSES = [
  { value: 'active', label: 'Active in Fleet' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'inactive', label: 'Inactive / Standby' },
  { value: 'sold', label: 'Sold / Decommissioned' },
]

export default function AddVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  vehicleToEdit,
  isLoading = false,
}) {
  const [form, setForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: CURRENT_YEAR,
    fleetGroup: 'Personal',
    status: 'active',
    fuelType: 'Petrol',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    if (vehicleToEdit) {
      setForm({
        registrationNumber: vehicleToEdit.registrationNumber || '',
        make: vehicleToEdit.make || '',
        model: vehicleToEdit.model || '',
        year: vehicleToEdit.year || CURRENT_YEAR,
        fleetGroup: vehicleToEdit.fleetGroup || 'Personal',
        status: vehicleToEdit.status || 'active',
        fuelType: vehicleToEdit.fuelType || 'Petrol',
        driverName: vehicleToEdit.assignedDriver?.name || '',
        driverPhone: vehicleToEdit.assignedDriver?.phone || '',
        driverLicense: vehicleToEdit.assignedDriver?.licenseNumber || '',
        notes: vehicleToEdit.notes || '',
      })
    } else {
      setForm({
        registrationNumber: '',
        make: '',
        model: '',
        year: CURRENT_YEAR,
        fleetGroup: 'Personal',
        status: 'active',
        fuelType: 'Petrol',
        driverName: '',
        driverPhone: '',
        driverLicense: '',
        notes: '',
      })
    }
    setErrors({})
    setApiError(null)
  }, [vehicleToEdit, isOpen])

  const validate = () => {
    const newErrors = {}
    if (!form.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required'
    } else if (form.registrationNumber.trim().length > 20) {
      newErrors.registrationNumber = 'Must be 20 characters or fewer'
    }

    if (!form.make.trim()) {
      newErrors.make = 'Manufacturer / Make is required'
    }

    if (!form.model.trim()) {
      newErrors.model = 'Model is required'
    }

    const yearNum = Number(form.year)
    if (!yearNum || yearNum < 1886 || yearNum > CURRENT_YEAR + 1) {
      newErrors.year = `Year must be between 1886 and ${CURRENT_YEAR + 1}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    try {
      const payload = {
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        fleetGroup: form.fleetGroup,
        status: form.status,
        fuelType: form.fuelType,
        assignedDriver: {
          name: form.driverName.trim(),
          phone: form.driverPhone.trim(),
          licenseNumber: form.driverLicense.trim().toUpperCase(),
        },
        notes: form.notes.trim(),
      }

      await onSubmit(payload)
      onClose()
    } catch (err) {
      setApiError(err.message || 'Failed to save vehicle')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicleToEdit ? 'Edit Vehicle & Fleet Details' : 'Register New Vehicle'}
      subtitle={
        vehicleToEdit
          ? `Updating records for ${vehicleToEdit.registrationNumber}`
          : 'Enter vehicle registration, make, fleet category, and driver assignment'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="vehicle-form-layout">
        {apiError && <Alert type="error">{apiError}</Alert>}

        <div className="form-grid-two">
          <Input
            label="Registration Number"
            required
            id="v-reg"
            placeholder="e.g. MH01AB1234"
            value={form.registrationNumber}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                registrationNumber: e.target.value.toUpperCase(),
              }))
            }
            error={errors.registrationNumber}
            maxLength={20}
            leftIcon={CarFront}
            autoFocus
          />

          <Input
            label="Manufacturing Year"
            required
            id="v-year"
            type="number"
            min={1886}
            max={CURRENT_YEAR + 1}
            value={form.year}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                year: parseInt(e.target.value, 10) || '',
              }))
            }
            error={errors.year}
            leftIcon={Calendar}
          />
        </div>

        <div className="form-grid-two">
          <Input
            label="Manufacturer / Make"
            required
            id="v-make"
            placeholder="e.g. Toyota, Tata, Tesla"
            value={form.make}
            onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
            error={errors.make}
            maxLength={50}
          />

          <Input
            label="Model Name"
            required
            id="v-model"
            placeholder="e.g. Innova, Nexon, Model 3"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            error={errors.model}
            maxLength={50}
          />
        </div>

        {/* Fleet Group & Fuel Type */}
        <div className="form-grid-two">
          <Select
            label="Fleet Group / Category"
            value={form.fleetGroup}
            onChange={(e) => setForm((f) => ({ ...f, fleetGroup: e.target.value }))}
            options={FLEET_GROUPS.map((g) => ({ value: g, label: g }))}
          />

          <Select
            label="Fuel / Powertrain Type"
            value={form.fuelType}
            onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value }))}
            options={FUEL_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <div className="form-group">
          <Select
            label="Operating Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={VEHICLE_STATUSES}
          />
        </div>

        {/* Assigned Driver Details */}
        <div className="driver-assignment-section p-3 bg-surface-subtle rounded-lg">
          <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-primary">
            <Users size={14} />
            <span>Assigned Driver Information (Optional)</span>
          </div>
          <div className="form-grid-two">
            <Input
              label="Driver Name"
              placeholder="e.g. Rajesh Kumar"
              value={form.driverName}
              onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +91 98765 43210"
              value={form.driverPhone}
              onChange={(e) => setForm((f) => ({ ...f, driverPhone: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="v-notes">
            Additional Specifications &amp; Notes
          </label>
          <textarea
            id="v-notes"
            className="form-textarea"
            rows={2}
            placeholder="Optional notes, chassis info, color, or special permits..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            maxLength={500}
          />
        </div>

        <div className="modal-actions-right">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            id="save-vehicle-btn"
          >
            {vehicleToEdit ? 'Save Changes' : 'Register Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
