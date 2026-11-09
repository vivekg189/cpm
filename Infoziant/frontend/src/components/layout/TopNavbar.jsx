import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Plus,
  Upload,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  X,
  Check,
} from 'lucide-react'
import { getHealth, getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api'
import Button from '../common/Button'

export default function TopNavbar({ onOpenMobileMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [healthStatus, setHealthStatus] = useState('checking')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifs = () => {
    getNotifications()
      .then((data) => {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    let isMounted = true
    getHealth()
      .then((data) => {
        if (isMounted) setHealthStatus(data.status === 'ok' ? 'connected' : 'disconnected')
      })
      .catch(() => {
        if (isMounted) setHealthStatus('disconnected')
      })

    fetchNotifs()
    const interval = setInterval(fetchNotifs, 45000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [location.pathname])

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotificationMenu(false)
      }
    }
    if (showNotificationMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotificationMenu])

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (_) {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (_) {}
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', category: 'Overview' }
      case '/vehicles':
        return { title: 'Vehicles & Fleet', category: 'Fleet Management' }
      case '/documents':
        return { title: 'Documents', category: 'Document Vault' }
      case '/calendar':
        return { title: 'Expiry Calendar', category: 'Schedule & Alerts' }
      case '/maintenance':
        return { title: 'Maintenance Tracker', category: 'Fleet Operations' }
      case '/expenses':
        return { title: 'Expense Analytics', category: 'Cost Management' }
      case '/activity':
        return { title: 'Activity & Audit', category: 'System Logs' }
      case '/status':
        return { title: 'System Status', category: 'Infrastructure' }
      default:
        return { title: 'VehicleVault', category: 'Platform' }
    }
  }

  const { title, category } = getPageTitle()

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          type="button"
          className="top-navbar-mobile-toggle"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="top-navbar-breadcrumbs">
          <span className="breadcrumb-category">{category}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{title}</span>
        </div>
      </div>

      <div className="top-navbar-right">
        {/* System Health Status Indicator */}
        <div
          className={`system-status-pill ${healthStatus}`}
          title={
            healthStatus === 'connected'
              ? 'API & Database Online'
              : healthStatus === 'disconnected'
              ? 'Backend Unreachable'
              : 'Verifying connectivity...'
          }
        >
          {healthStatus === 'connected' ? (
            <>
              <span className="status-dot green animate-pulse" />
              <span className="status-pill-text">API Online</span>
            </>
          ) : healthStatus === 'disconnected' ? (
            <>
              <span className="status-dot red" />
              <span className="status-pill-text">Offline</span>
            </>
          ) : (
            <>
              <span className="status-dot yellow animate-pulse" />
              <span className="status-pill-text">Connecting</span>
            </>
          )}
        </div>

        {/* Automated Notifications Dropdown */}
        <div className="notification-dropdown-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="navbar-icon-btn relative"
            onClick={() => {
              setShowNotificationMenu((prev) => !prev)
              if (!showNotificationMenu) fetchNotifs()
            }}
            title="Expiry Reminders & Alerts"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="notification-panel animate-scale-up">
              <div className="notification-panel-header">
                <div>
                  <h4 className="font-semibold text-sm">Automated Alerts &amp; Expirations</h4>
                  <p className="text-xs text-secondary">30d, 15d, 7d and 1d compliance reminders</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="text-xs text-primary font-semibold hover:underline"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-items-list">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted">
                    <CheckCircle2 size={24} className="text-success mx-auto mb-2" />
                    <p>No active expiry warnings or reminders.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isCrit = n.urgency === 'critical'
                    const isWarn = n.urgency === 'warning'
                    return (
                      <div
                        key={n._id}
                        className={`notification-item-row ${!n.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          if (n.document) {
                            navigate('/documents')
                          } else if (n.vehicle) {
                            navigate('/vehicles')
                          }
                          setShowNotificationMenu(false)
                        }}
                      >
                        <div className="notif-icon-col">
                          {isCrit ? (
                            <AlertCircle size={16} className="text-danger" />
                          ) : isWarn ? (
                            <AlertTriangle size={16} className="text-warning" />
                          ) : (
                            <Clock size={16} className="text-primary" />
                          )}
                        </div>
                        <div className="notif-content-col">
                          <p className="notif-title">{n.title}</p>
                          <p className="notif-msg">{n.message}</p>
                          <span className="notif-time">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            type="button"
                            className="notif-read-btn"
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Quick Action Buttons */}
        <div className="top-navbar-actions">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Plus}
            onClick={() => navigate('/vehicles?action=add')}
            className="navbar-quick-action"
          >
            Add Vehicle
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Upload}
            onClick={() => navigate('/documents?action=upload')}
            className="navbar-quick-action"
          >
            Upload PDF
          </Button>
        </div>
      </div>
    </header>
  )
}
