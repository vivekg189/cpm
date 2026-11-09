import { ShieldAlert, Lock, CheckCircle2, AlertTriangle, KeyRound, ShieldCheck } from 'lucide-react'

export default function SecurityInfoCard() {
  return (
    <div className="dashboard-card status-section-card security-alert-card">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <ShieldAlert size={20} className="text-warning" />
          <h2 className="card-heading">Security Posture &amp; Authentication Status</h2>
        </div>
        <span className="status-badge badge-warning badge-sm">
          <AlertTriangle size={12} className="status-badge-icon" />
          <span>Authentication Disabled (MVP)</span>
        </span>
      </div>

      <div className="security-notice-body">
        <div className="security-banner-box">
          <div className="security-banner-icon">
            <Lock size={22} className="text-warning" />
          </div>
          <div className="security-banner-text">
            <h4>Authentication Status: Unauthenticated Demonstration Mode</h4>
            <p>
              VehicleVault is operating as an open internal tool for assignment demonstration. Anyone with network access
              to the Nginx endpoint can perform full CRUD operations on vehicles and download uploaded documents.
            </p>
          </div>
        </div>

        <div className="security-recommendations-grid">
          <div className="security-spec-card">
            <div className="security-spec-header">
              <CheckCircle2 size={16} className="text-success inline-icon" />
              <span className="font-semibold text-sm">Existing Defenses in Place</span>
            </div>
            <ul className="security-checklist">
              <li>MIME-type check and PDF magic bytes validation on upload.</li>
              <li>Filesystem traversal protection with sanitized random storage names.</li>
              <li>Backend port is isolated inside Docker network and not exposed to public host.</li>
              <li>Downloads verify MongoDB existence before serving raw file streams.</li>
            </ul>
          </div>

          <div className="security-spec-card">
            <div className="security-spec-header">
              <KeyRound size={16} className="text-primary inline-icon" />
              <span className="font-semibold text-sm">Production Hardening Checklist</span>
            </div>
            <ul className="security-checklist">
              <li>Implement JWT / OAuth2 session authentication with bcrypt hashing.</li>
              <li>Add Role-Based Access Control (RBAC: Admin, Fleet Manager, Viewer).</li>
              <li>Enable TLS / HTTPS termination at the Nginx reverse proxy level.</li>
              <li>Implement rate limiting on upload routes and audit logging for deletes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

