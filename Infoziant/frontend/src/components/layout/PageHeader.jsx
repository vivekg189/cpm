export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`page-header-container ${className}`}>
      <div className="page-header-text">
        <div className="page-header-title-row">
          <h1 className="page-main-title">{title}</h1>
          {badge && <div className="page-header-badge">{badge}</div>}
        </div>
        {subtitle && <p className="page-main-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}

      {children && <div className="page-header-extra">{children}</div>}
    </div>
  )
}

