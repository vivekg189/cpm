export default function StatCard({
  icon: Icon,
  value,
  label,
  colorScheme = 'blue', // 'blue' | 'purple' | 'amber' | 'rose' | 'emerald'
  trendLabel,
  trendType = 'neutral', // 'positive' | 'negative' | 'warning' | 'neutral'
  onClick,
}) {
  return (
    <div
      className={`dashboard-stat-card scheme-${colorScheme} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-top">
        <div className="stat-icon-wrapper">
          <Icon size={24} strokeWidth={2} />
        </div>
        {trendLabel && (
          <span className={`stat-trend-tag trend-${trendType}`}>
            {trendLabel}
          </span>
        )}
      </div>

      <div className="stat-card-bottom">
        <div className="stat-card-value">{value ?? 0}</div>
        <div className="stat-card-label">{label}</div>
      </div>

      <div className="stat-card-accent-line" />
    </div>
  )
}

