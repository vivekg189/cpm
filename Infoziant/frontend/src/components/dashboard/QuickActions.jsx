import { useNavigate } from 'react-router-dom'
import { PlusCircle, UploadCloud, CalendarDays, Wrench, Receipt, Files } from 'lucide-react'

export default function QuickActions({ onAddVehicle, onUploadDocument }) {
  const navigate = useNavigate()

  return (
    <div className="quick-actions-bar">
      <div className="quick-actions-header">
        <span className="quick-actions-label">Quick Actions &amp; Workflows</span>
      </div>
      <div className="quick-actions-grid">
        <button
          type="button"
          className="quick-action-card"
          onClick={onAddVehicle || (() => navigate('/vehicles?action=add'))}
        >
          <div className="action-icon-pill primary-tint">
            <PlusCircle size={20} />
          </div>
          <div className="action-text-group">
            <span className="action-title">Add Vehicle</span>
            <span className="action-subtitle">Register new car or fleet</span>
          </div>
        </button>

        <button
          type="button"
          className="quick-action-card"
          onClick={onUploadDocument || (() => navigate('/documents?action=upload'))}
        >
          <div className="action-icon-pill secondary-tint">
            <UploadCloud size={20} />
          </div>
          <div className="action-text-group">
            <span className="action-title">Upload PDF</span>
            <span className="action-subtitle">Attach insurance, RC, or PUC</span>
          </div>
        </button>

        <button
          type="button"
          className="quick-action-card"
          onClick={() => navigate('/calendar')}
        >
          <div className="action-icon-pill amber-tint">
            <CalendarDays size={20} />
          </div>
          <div className="action-text-group">
            <span className="action-title">Expiry Calendar</span>
            <span className="action-subtitle">Monthly &amp; weekly deadlines</span>
          </div>
        </button>

        <button
          type="button"
          className="quick-action-card"
          onClick={() => navigate('/maintenance')}
        >
          <div className="action-icon-pill emerald-tint">
            <Wrench size={20} />
          </div>
          <div className="action-text-group">
            <span className="action-title">Maintenance</span>
            <span className="action-subtitle">Service &amp; repair history</span>
          </div>
        </button>

        <button
          type="button"
          className="quick-action-card"
          onClick={() => navigate('/expenses')}
        >
          <div className="action-icon-pill primary-tint">
            <Receipt size={20} />
          </div>
          <div className="action-text-group">
            <span className="action-title">Expense Analytics</span>
            <span className="action-subtitle">Operating costs &amp; charts</span>
          </div>
        </button>

        <button
          type="button"
          className="quick-action-card"
          onClick={() => navigate('/documents')}
        >
          <div className="action-icon-pill secondary-tint">
            <Files size={20} />
          </div>
          <div className="action-text-group">
            <span className="action-title">Document Vault</span>
            <span className="action-subtitle">Certificates &amp; policies</span>
          </div>
        </button>
      </div>
    </div>
  )
}
