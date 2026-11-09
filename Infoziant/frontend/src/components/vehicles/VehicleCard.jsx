import {
  CarFront,
  Calendar,
  Edit2,
  Trash2,
  FileText,
  QrCode,
  FileDown,
  User,
  ShieldCheck,
} from 'lucide-react'
import Button from '../common/Button'
import { getVehicleReportUrl } from '../../services/api'

export default function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onViewDetails,
  onViewDocuments,
  onOpenQrCode,
  docCount,
}) {
  const reportUrl = getVehicleReportUrl(vehicle._id)

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'badge-success'
      case 'maintenance':
        return 'badge-warning'
      case 'inactive':
      case 'sold':
        return 'badge-neutral'
      default:
        return 'badge-success'
    }
  }

  return (
    <div className="vehicle-card animate-fade-in">
      <div className="vehicle-card-header">
        <div className="flex items-center gap-2">
          <div className="vehicle-license-plate">
            <span className="plate-country">IND</span>
            <span className="plate-number">{vehicle.registrationNumber}</span>
          </div>
          <span className={`status-badge ${getStatusColor(vehicle.status)} badge-sm capitalize`}>
            {vehicle.status || 'Active'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-subtle font-semibold text-xs">
            {vehicle.fleetGroup || 'Personal'}
          </span>
          <div className="vehicle-badge-year">
            <Calendar size={13} className="inline-icon" />
            <span>{vehicle.year}</span>
          </div>
        </div>
      </div>

      <div className="vehicle-card-body">
        <div className="vehicle-illustration-banner">
          <div className="vehicle-avatar-box">
            <CarFront size={32} strokeWidth={1.8} className="car-avatar-icon" />
          </div>
          <div className="vehicle-model-block">
            <h3 className="vehicle-name-title">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="vehicle-make-tag">
              {vehicle.fuelType || 'Petrol'} • {vehicle.make}
            </span>
          </div>
        </div>

        {vehicle.assignedDriver?.name && (
          <div className="flex items-center gap-2 text-xs text-secondary bg-surface-subtle p-2 rounded">
            <User size={13} className="text-primary flex-shrink-0" />
            <span>
              Driver: <strong>{vehicle.assignedDriver.name}</strong>
              {vehicle.assignedDriver.phone ? ` (${vehicle.assignedDriver.phone})` : ''}
            </span>
          </div>
        )}

        {vehicle.notes && (
          <p className="vehicle-notes-snippet" title={vehicle.notes}>
            {vehicle.notes}
          </p>
        )}

        <div className="vehicle-card-stats-row">
          <div
            className="vehicle-stat-pill clickable"
            onClick={() => onViewDocuments && onViewDocuments(vehicle)}
            title="View documents for this vehicle"
          >
            <FileText size={14} className="text-primary" />
            <span className="stat-pill-label">Documents:</span>
            <span className="stat-pill-count">{docCount ?? 0}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm inline-flex items-center gap-1"
              onClick={() => onOpenQrCode(vehicle)}
              title="View &amp; Print QR Inspection Badge"
            >
              <QrCode size={14} />
              <span className="text-xs">QR</span>
            </button>
            <a
              href={reportUrl}
              download={`Report_${vehicle.registrationNumber}.pdf`}
              className="btn btn-outline btn-sm inline-flex items-center gap-1"
              title="Download Executive PDF Report"
            >
              <FileDown size={14} />
              <span className="text-xs">PDF</span>
            </a>
          </div>
        </div>
      </div>

      <div className="vehicle-card-footer">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(vehicle)}
          className="vehicle-action-btn view-btn"
        >
          Details
        </Button>
        <div className="vehicle-card-actions-right">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Edit2}
            onClick={() => onEdit(vehicle)}
            className="vehicle-action-btn"
            id={`edit-vehicle-${vehicle._id}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={() => onDelete(vehicle)}
            className="vehicle-action-btn btn-danger-ghost"
            id={`delete-vehicle-${vehicle._id}`}
            aria-label={`Delete ${vehicle.registrationNumber}`}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
