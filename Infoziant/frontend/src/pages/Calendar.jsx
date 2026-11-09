import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  CarFront,
  Clock,
  AlertTriangle,
  AlertCircle,
  Wrench,
  FileText,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { getCalendarEvents, getVehicles } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/Alert'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week'
  const [events, setEvents] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('ALL')

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState(null)

  const navigate = useNavigate()

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [eventsRes, vehRes] = await Promise.all([
        getCalendarEvents({
          vehicleId: selectedVehicle || undefined,
          eventType: selectedEventType,
        }),
        getVehicles().catch(() => ({ vehicles: [] })),
      ])
      setEvents(eventsRes.events || [])
      setVehicles(vehRes.vehicles || [])
    } catch (err) {
      setError(err.message || 'Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }, [selectedVehicle, selectedEventType])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Month navigation helpers
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    } else {
      const prevWeek = new Date(currentDate)
      prevWeek.setDate(currentDate.getDate() - 7)
      setCurrentDate(prevWeek)
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    } else {
      const nextWeek = new Date(currentDate)
      nextWeek.setDate(currentDate.getDate() + 7)
      setCurrentDate(nextWeek)
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Monthly Calendar Matrix calculation
  const monthGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days = []

    // Previous month overflow days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i
      days.push({
        dayNumber: dayNum,
        date: new Date(currentYear, currentMonth - 1, dayNum),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        dayNumber: i,
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      })
    }

    // Next month overflow days (to make total 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentYear, currentMonth])

  // Weekly days calculation
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate)
    const dayOfWeek = curr.getDay()
    const sunday = new Date(curr)
    sunday.setDate(curr.getDate() - dayOfWeek)

    const week = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      week.push(d)
    }
    return week
  }, [currentDate])

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach((ev) => {
      const key = ev.date.split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(ev)
    })
    return map
  }, [events])

  const isToday = (d) => {
    const now = new Date()
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  }

  const formatMonthTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
    const startOfWeek = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endOfWeek = weekDays[6].toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${startOfWeek} – ${endOfWeek}`
  }

  return (
    <div className="calendar-page animate-fade-in">
      <PageHeader
        title="Smart Expiry Calendar"
        subtitle="Track document renewal deadlines, expiring certifications, and scheduled maintenance."
        badge={
          <span className="badge-subtle font-semibold">
            {events.length} Scheduled Event{events.length !== 1 ? 's' : ''}
          </span>
        }
        actions={
          <div className="calendar-view-toggle">
            <button
              type="button"
              className={`calendar-view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month View
            </button>
            <button
              type="button"
              className={`calendar-view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week View
            </button>
          </div>
        }
      />

      {error && <Alert type="error">{error}</Alert>}

      {/* Control Bar: Month navigation & Filtering */}
      <div className="calendar-control-bar">
        <div className="calendar-nav-controls">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="month-stepper">
            <button
              type="button"
              className="stepper-arrow-btn"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="current-month-heading">{formatMonthTitle()}</span>
            <button
              type="button"
              className="stepper-arrow-btn"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="calendar-filter-controls">
          <div className="filter-select-wrapper">
            <CarFront size={16} className="filter-icon" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
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
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="control-select"
            >
              <option value="ALL">All Event Types</option>
              <option value="document_expiry">Document Expirations</option>
              <option value="service_due">Maintenance Due</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating calendar deadlines..." />
      ) : viewMode === 'month' ? (
        /* ================= Monthly Grid View ================= */
        <div className="calendar-matrix-container">
          <div className="calendar-weekday-header">
            {DAYS.map((day) => (
              <div key={day} className="calendar-weekday-cell">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {monthGridDays.map((item, idx) => {
              const dateKey = item.date.toISOString().split('T')[0]
              const dayEvents = eventsByDate[dateKey] || []
              const activeToday = isToday(item.date)

              return (
                <div
                  key={idx}
                  className={`calendar-day-cell ${!item.isCurrentMonth ? 'overflow-day' : ''} ${
                    activeToday ? 'is-today' : ''
                  }`}
                >
                  <div className="day-cell-top">
                    <span className={`day-number ${activeToday ? 'today-badge' : ''}`}>
                      {item.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="event-count-indicator">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="day-events-stack">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`calendar-event-pill urgency-${ev.urgency} type-${ev.type}`}
                        onClick={() => setSelectedEvent(ev)}
                        title={ev.title}
                      >
                        {ev.type === 'service_due' ? (
                          <Wrench size={10} className="event-pill-icon" />
                        ) : (
                          <FileText size={10} className="event-pill-icon" />
                        )}
                        <span className="event-pill-text">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div
                        className="more-events-tag"
                        onClick={() => setSelectedEvent(dayEvents[0])}
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ================= Weekly Column View ================= */
        <div className="calendar-weekly-container">
          <div className="weekly-columns-grid">
            {weekDays.map((d, idx) => {
              const dateKey = d.toISOString().split('T')[0]
              const dayEvents = eventsByDate[dateKey] || []
              const activeToday = isToday(d)

              return (
                <div key={idx} className={`weekly-column ${activeToday ? 'today-column' : ''}`}>
                  <div className="weekly-column-header">
                    <span className="weekly-day-name">{DAYS[d.getDay()]}</span>
                    <span className={`weekly-day-num ${activeToday ? 'today-pill' : ''}`}>
                      {d.getDate()}
                    </span>
                  </div>

                  <div className="weekly-column-body">
                    {dayEvents.length === 0 ? (
                      <div className="weekly-empty-state">No deadlines</div>
                    ) : (
                      dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className={`weekly-event-card urgency-${ev.urgency}`}
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <div className="weekly-card-header">
                            <span className="plate-pill sm">
                              {ev.vehicle?.registrationNumber || 'Vehicle'}
                            </span>
                            <span className="weekly-urgency-tag">
                              {ev.daysRemaining < 0
                                ? 'Expired'
                                : `${ev.daysRemaining}d left`}
                            </span>
                          </div>
                          <h5 className="weekly-card-title">{ev.title}</h5>
                          <div className="weekly-card-meta">
                            {ev.type === 'service_due' ? (
                              <span>
                                <Wrench size={11} className="inline-icon" /> Maintenance
                              </span>
                            ) : (
                              <span>
                                <FileText size={11} className="inline-icon" /> {ev.documentType}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="Deadline Details"
          subtitle={selectedEvent.type === 'service_due' ? 'Maintenance Service Due' : 'Document Expiry Alert'}
          size="sm"
          footer={
            <div className="modal-actions-right">
              <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              {selectedEvent.metadata?.documentId && (
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate(`/documents?search=${encodeURIComponent(selectedEvent.title)}`)
                    setSelectedEvent(null)
                  }}
                >
                  View in Vault
                </Button>
              )}
            </div>
          }
        >
          <div className="calendar-event-modal-content">
            <div className={`event-modal-icon-badge urgency-${selectedEvent.urgency}`}>
              {selectedEvent.type === 'service_due' ? (
                <Wrench size={28} />
              ) : selectedEvent.urgency === 'critical' ? (
                <AlertCircle size={28} />
              ) : (
                <Clock size={28} />
              )}
            </div>
            <h4 className="event-modal-title">{selectedEvent.title}</h4>
            <div className="event-modal-specs">
              <div className="modal-spec-row">
                <span className="spec-label">Target Date:</span>
                <span className="font-semibold">{new Date(selectedEvent.date).toLocaleDateString()}</span>
              </div>
              <div className="modal-spec-row">
                <span className="spec-label">Vehicle:</span>
                <span className="plate-pill sm">{selectedEvent.vehicle?.registrationNumber || 'Vehicle'}</span>
              </div>
              <div className="modal-spec-row">
                <span className="spec-label">Days Remaining:</span>
                <span className={selectedEvent.daysRemaining <= 0 ? 'text-danger font-bold' : 'font-semibold'}>
                  {selectedEvent.daysRemaining <= 0
                    ? `Expired (${Math.abs(selectedEvent.daysRemaining)} days ago)`
                    : `${selectedEvent.daysRemaining} days remaining`}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

