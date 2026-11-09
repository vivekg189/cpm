import { CarFront, Edit2, Trash2, Eye, FileText, Calendar, QrCode, FileDown } from 'lucide-react'
import Button from '../common/Button'
import { getVehicleReportUrl } from '../../services/api'

export default function VehicleTable({
  vehicles = [],
  onEdit,
  onDelete,
  onViewDetails,
  onViewDocuments,
  onOpenQrCode,
  docCounts = {},
}) {
  return (
    <div className="table-responsive-wrapper">
      <table className="modern-data-table">
        <thead>
          <tr>
            <th>Vehicle &amp; Registration</th>
            <th>Fleet Group</th>
            <th>Make &amp; Model</th>
            <th>Status</th>
            <th>Year</th>
            <th>Documents</th>
            <th>Driver</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const reportUrl = getVehicleReportUrl(v._id)

            return (
              <tr key={v._id} className="table-row-hover">
                <td>
                  <div className="table-vehicle-cell">
                    <div className="table-vehicle-icon">
                      <CarFront size={18} />
                    </div>
                    <div>
                      <span className="plate-pill">{v.registrationNumber}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge-subtle font-medium text-xs">
                    {v.fleetGroup || 'Personal'}
                  </span>
                </td>
                <td className="font-medium text-main">
                  {v.make} {v.model}
                </td>
                <td>
                  <span
                    className={`status-badge badge-${
                      v.status === 'active'
                        ? 'success'
                        : v.status === 'maintenance'
                        ? 'warning'
                        : 'neutral'
                    } badge-sm capitalize`}
                  >
                    {v.status || 'Active'}
                  </span>
                </td>
                <td>
                  <span className="badge-subtle">
                    <Calendar size={12} className="inline-icon" />
                    {v.year}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="table-doc-pill clickable"
                    onClick={() => onViewDocuments(v)}
                    title="View documents"
                  >
                    <FileText size={13} className="text-primary" />
                    <span>{docCounts[v._id] ?? 0}</span>
                  </button>
                </td>
                <td className="text-secondary text-sm">
                  {v.assignedDriver?.name || '—'}
                </td>
                <td>
                  <div className="table-actions-cell">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onOpenQrCode(v)}
                      title="Inspection QR Badge"
                    >
                      <QrCode size={15} />
                    </button>
                    <a
                      href={reportUrl}
                      download={`Report_${v.registrationNumber}.pdf`}
                      className="btn btn-ghost btn-sm"
                      title="Download PDF Report"
                    >
                      <FileDown size={15} />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Eye}
                      onClick={() => onViewDetails(v)}
                      title="View details"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Edit2}
                      onClick={() => onEdit(v)}
                      id={`edit-vehicle-${v._id}`}
                      title="Edit vehicle"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Trash2}
                      onClick={() => onDelete(v)}
                      id={`delete-vehicle-${v._id}`}
                      className="btn-danger-ghost"
                      title="Delete vehicle"
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
