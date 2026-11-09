import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CarFront,
  Files,
  CalendarDays,
  Wrench,
  Receipt,
  History,
  Activity,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Server,
  Layers,
  X,
} from 'lucide-react'

const navSections = [
  {
    title: 'Core Management',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/vehicles', icon: CarFront, label: 'Vehicles & Fleet' },
      { to: '/documents', icon: Files, label: 'Documents Vault' },
    ],
  },
  {
    title: 'Operations & Alerts',
    items: [
      { to: '/calendar', icon: CalendarDays, label: 'Expiry Calendar' },
      { to: '/maintenance', icon: Wrench, label: 'Maintenance Log' },
      { to: '/expenses', icon: Receipt, label: 'Expenses & Analytics' },
    ],
  },
  {
    title: 'Audit & System',
    items: [
      { to: '/activity', icon: History, label: 'Activity Logs' },
      { to: '/status', icon: Activity, label: 'System Status' },
    ],
  },
]

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        aria-label="Main Navigation"
      >
        {/* Brand header */}
        <div className="sidebar-brand-header">
          <div className="brand-logo-container">
            <div className="brand-logo-icon">
              <ShieldCheck size={22} className="shield-icon" />
              <CarFront size={14} className="car-overlay-icon" />
            </div>
            {!isCollapsed && (
              <div className="brand-text-container">
                <span className="brand-title">VehicleVault</span>
                <span className="brand-subtitle">Smart Document Manager</span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-navigation">
          {navSections.map((sec, secIdx) => (
            <div key={sec.title} className="sidebar-nav-section">
              {!isCollapsed && (
                <div className={`sidebar-nav-heading ${secIdx > 0 ? 'mt-3' : ''}`}>
                  {sec.title}
                </div>
              )}
              <ul className="sidebar-nav-list">
                {sec.items.map(({ to, icon: Icon, label }) => (
                  <li key={to} className="sidebar-nav-item">
                    <NavLink
                      to={to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `sidebar-nav-link ${isActive ? 'active' : ''}`
                      }
                      title={isCollapsed ? label : undefined}
                    >
                      <span className="sidebar-nav-icon">
                        <Icon size={19} strokeWidth={2} />
                      </span>
                      {!isCollapsed && (
                        <span className="sidebar-nav-label">{label}</span>
                      )}
                      <span className="active-pill" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="sidebar-collapse-wrapper">
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>

        {/* Bottom environment & version info */}
        <div className="sidebar-footer-info">
          {!isCollapsed ? (
            <div className="footer-details">
              <div className="footer-meta-row">
                <span className="footer-meta-label">Environment</span>
                <span className="footer-badge">
                  <Server size={12} className="inline-icon" /> Docker
                </span>
              </div>
              <div className="footer-meta-row">
                <span className="footer-meta-label">Architecture</span>
                <span className="footer-text">
                  <Layers size={12} className="inline-icon" /> MERN + Nginx
                </span>
              </div>
              <div className="footer-version-tag">
                <span className="status-dot green" />
                <span>VehicleVault v2.0 Enterprise</span>
              </div>
            </div>
          ) : (
            <div className="footer-collapsed-dot" title="VehicleVault Enterprise">
              <span className="status-dot green" />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
