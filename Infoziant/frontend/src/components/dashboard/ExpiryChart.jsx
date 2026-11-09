import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'

const COLORS = {
  valid: '#10B981',      // Emerald Green
  expiring: '#F59E0B',   // Amber Warning
  expired: '#EF4444',    // Rose Danger
  empty: '#E2E8F0',      // Neutral Slate
}

export default function ExpiryChart({ stats }) {
  const { totalDocuments = 0, expiringDocuments = 0, expiredDocuments = 0 } = stats || {}

  const validDocuments = useMemo(() => {
    return Math.max(0, totalDocuments - expiringDocuments - expiredDocuments)
  }, [totalDocuments, expiringDocuments, expiredDocuments])

  const chartData = useMemo(() => {
    if (totalDocuments === 0) {
      return [{ name: 'No Documents', value: 1, color: COLORS.empty, isEmpty: true }]
    }
    const data = []
    if (validDocuments > 0) {
      data.push({ name: 'Valid & Active', value: validDocuments, color: COLORS.valid, key: 'valid' })
    }
    if (expiringDocuments > 0) {
      data.push({ name: 'Expiring in 30 Days', value: expiringDocuments, color: COLORS.expiring, key: 'expiring' })
    }
    if (expiredDocuments > 0) {
      data.push({ name: 'Expired', value: expiredDocuments, color: COLORS.expired, key: 'expired' })
    }
    return data
  }, [totalDocuments, validDocuments, expiringDocuments, expiredDocuments])

  const validPct = totalDocuments > 0 ? Math.round((validDocuments / totalDocuments) * 100) : 0
  const expiringPct = totalDocuments > 0 ? Math.round((expiringDocuments / totalDocuments) * 100) : 0
  const expiredPct = totalDocuments > 0 ? Math.round((expiredDocuments / totalDocuments) * 100) : 0

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      if (data.isEmpty) return null
      return (
        <div className="chart-custom-tooltip">
          <div className="tooltip-indicator" style={{ backgroundColor: data.color }} />
          <div className="tooltip-info">
            <span className="tooltip-title">{data.name}</span>
            <span className="tooltip-val">
              {data.value} document{data.value > 1 ? 's' : ''} ({Math.round((data.value / totalDocuments) * 100)}%)
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="dashboard-card expiry-analytics-card">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <ShieldCheck size={20} className="text-primary" />
          <h2 className="card-heading">Document Expiry Analytics</h2>
        </div>
        <span className="card-header-badge">Real-time status</span>
      </div>

      <div className="expiry-analytics-content">
        {/* Donut Chart with center label */}
        <div className="chart-donut-wrapper">
          <div className="chart-aspect-box">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={totalDocuments > 0 ? 4 : 0}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-info">
              <span className="donut-total-count">{totalDocuments}</span>
              <span className="donut-total-label">Total Files</span>
            </div>
          </div>
        </div>

        {/* Breakdown bars & details */}
        <div className="expiry-breakdown-list">
          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <div className="breakdown-item-title">
                <CheckCircle2 size={16} className="text-success" />
                <span>Valid Documents</span>
              </div>
              <div className="breakdown-item-values">
                <strong>{validDocuments}</strong>
                <span className="breakdown-pct">({validPct}%)</span>
              </div>
            </div>
            <div className="breakdown-progress-track">
              <div
                className="breakdown-progress-fill bg-success"
                style={{ width: `${validPct}%` }}
              />
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <div className="breakdown-item-title">
                <Clock size={16} className="text-warning" />
                <span>Expiring Soon (30d)</span>
              </div>
              <div className="breakdown-item-values">
                <strong>{expiringDocuments}</strong>
                <span className="breakdown-pct">({expiringPct}%)</span>
              </div>
            </div>
            <div className="breakdown-progress-track">
              <div
                className="breakdown-progress-fill bg-warning"
                style={{ width: `${expiringPct}%` }}
              />
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <div className="breakdown-item-title">
                <AlertTriangle size={16} className="text-danger" />
                <span>Expired Documents</span>
              </div>
              <div className="breakdown-item-values">
                <strong>{expiredDocuments}</strong>
                <span className="breakdown-pct">({expiredPct}%)</span>
              </div>
            </div>
            <div className="breakdown-progress-track">
              <div
                className="breakdown-progress-fill bg-danger"
                style={{ width: `${expiredPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

