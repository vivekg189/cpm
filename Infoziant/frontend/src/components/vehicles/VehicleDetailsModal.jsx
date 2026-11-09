import Modal from '../common/Modal'
import Button from '../common/Button'
import {
  CarFront,
  Calendar,
  Tag,
  FileText,
  Upload,
  Clock,
  Edit2,
  QrCode,
  FileDown,
  User,
  ShieldCheck,
} from 'lucide-react'
import { getVehicleReportUrl } from '../../services/api'

export default function VehicleDetailsModal({
  isOpen,
  onClose,
  vehicle,
  onEdit,
  onUploadDocument,
  onViewDocuments,
  onOpenQrCode,
  docCount = 0,
}) {
  if (!vehicle) return null

  const reportUrl = getVehicleReportUrl(vehicle._id)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vehicle &amp; Fleet Specifications"
      subtitle={`Registration: ${vehicle.registrationNumber}`}
      size="md"
    >
      <div className="vehicle-details-view">
        {/* Top identity banner */}
        <div className="vehicle-details-hero">
          <div className="hero-icon-box">
            <CarFront size={36} className="text-primary" />
          </div>
          <div className="hero-info">
            <div className="hero-plate-row">
              <span className="plate-pill lg">{vehicle.registrationNumber}</span>
              <span className="hero-year-pill">Year {vehicle.year}</span>
              <span className="badge-subtle-primary text-xs capitalize">
                {vehicle.status || 'Active'}
              </span>
            </div>
            <h3 className="hero-vehicle-name">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="details-specs-grid">
          <div className="spec-card">
            <span className="spec-label">Fleet Category</span>
            <span className="spec-value">{vehicle.fleetGroup || 'Personal'}</span>
          </div>

          <div className="spec-card">
            <span className="spec-label">Fuel / Powertrain</span>
            <span className="spec-value">{vehicle.fuelType || 'Petrol'}</span>
          </div>

          <div className="spec-card">
            <span className="spec-label">Manufacturer</span>
            <span className="spec-value">{vehicle.make}</span>
          </div>

          <div className="spec-card">
            <span className="spec-label">Attached Documents</span>
            <span className="spec-value text-primary font-bold">{docCount} Files</span>
          </div>

          {vehicle.assignedDriver?.name && (
            <div className="spec-card col-span-2">
              <span className="spec-label">Assigned Driver</span>
              <div className="flex items-center gap-2 mt-1">
                <User size={15} className="text-primary" />
                <span className="font-semibold text-sm">{vehicle.assignedDriver.name}</span>
                {vehicle.assignedDriver.phone && (
                  <span className="text-secondary text-xs">({vehicle.assignedDriver.phone})</span>
                )}
                {vehicle.assignedDriver.licenseNumber && (
                  <span className="text-xs text-muted">
                    • Lic: {vehicle.assignedDriver.licenseNumber}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="spec-card col-span-2">
            <span className="spec-label">Registered On</span>
            <span className="spec-value">
              {new Date(vehicle.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {vehicle.notes && (
            <div className="spec-card col-span-2">
              <span className="spec-label">Notes &amp; Details</span>
              <p className="spec-notes-content">{vehicle.notes}</p>
            </div>
          )}
        </div>

        {/* Quick action footer */}
        <div className="vehicle-details-actions">
          <Button
            variant="outline"
            leftIcon={QrCode}
            onClick={() => {
              onClose()
              if (onOpenQrCode) onOpenQrCode(vehicle)
            }}
          >
            QR Badge
          </Button>
          <a
            href={reportUrl}
            download={`Report_${vehicle.registrationNumber}.pdf`}
            className="btn btn-outline btn-md inline-flex items-center gap-2"
          >
            <FileDown size={16} />
            <span>PDF Report</span>
          </a>
          <Button
            variant="outline"
            leftIcon={FileText}
            onClick={() => {
              onClose()
              if (onViewDocuments) onViewDocuments(vehicle)
            }}
          >
            Documents ({docCount})
          </Button>
          <Button
            variant="primary"
            leftIcon={Upload}
            onClick={() => {
              onClose()
              if (onUploadDocument) onUploadDocument(vehicle)
            }}
          >
            Upload PDF
          </Button>
        </div>
      </div>
    </Modal>
  )
}
