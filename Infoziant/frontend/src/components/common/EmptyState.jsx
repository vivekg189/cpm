import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon: ActionIcon,
  className = '',
  children,
}) {
  return (
    <div className={`empty-state-wrapper ${className}`}>
      {Icon && (
        <div className="empty-state-icon-container">
          <Icon size={40} className="empty-state-icon" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionText && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          leftIcon={ActionIcon}
          className="empty-state-action"
        >
          {actionText}
        </Button>
      )}
      {children}
    </div>
  )
}

