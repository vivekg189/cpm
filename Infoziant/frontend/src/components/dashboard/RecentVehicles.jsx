import { useNavigate } from 'react-router-dom'
import { CarFront, ArrowRight, Plus, Calendar, Tag } from 'lucide-react'
import Button from '../common/Button'

export default function RecentVehicles({ vehicles = [] }) {
  const navigate = useNavigate()

  return (
    <div className="dashboard-card recent-vehicles-card">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <CarFront size={20} className="text-primary" />
          <h2 className="card-heading">Recent Vehicles</h2>
        </div>
        <button
          type="button"
          className="card-header-link"
          onClick={() => navigate('/vehicles')}
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="card-body-flush">
        {vehicles.length === 0 ? (
          <div className="empty-sub-state">
            <div className="empty-sub-icon">
              <CarFront size={32} strokeWidth={1.5} />
            </div>
            <p className="empty-sub-title">No vehicles registered yet</p>
            <p className="empty-sub-text">Add your fleet to monitor expirations</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={() => navigate('/vehicles?action=add')}
              className="mt-3"
            >
              Add Vehicle
            </Button>
          </div>
        ) : (
          <div className="recent-entities-list">
            {vehicles.map((v) => (
              <div
                key={v._id}
                className="recent-entity-row clickable"
                onClick={() => navigate(`/vehicles?highlight=${v._id}`)}
              >
                <div className="entity-icon-badge vehicle-accent">
                  <CarFront size={18} />
                </div>
                <div className="entity-info-group">
                  <div className="entity-primary-title">
                    <span className="plate-pill">{v.registrationNumber}</span>
                  </div>
                  <div className="entity-meta-subtitle">
                    <span>{v.make} {v.model}</span>
                    <span className="meta-bullet">•</span>
                    <span>{v.year}</span>
                  </div>
                </div>
                <div className="entity-trailing-info">
                  <span className="text-caption">
                    {new Date(v.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

