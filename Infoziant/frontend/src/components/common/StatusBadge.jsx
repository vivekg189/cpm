import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react'

export default function StatusBadge({
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  label,
  icon: CustomIcon,
  size = 'md', // 'sm' | 'md'
  showIcon = true,
  className = '',
}) {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return CheckCircle2
      case 'warning':
        return AlertTriangle
      case 'danger':
        return AlertCircle
      case 'info':
        return Info
      default:
        return Clock
    }
  }

  const IconComponent = CustomIcon || getDefaultIcon()
  const iconSize = size === 'sm' ? 12 : 14

  return (
    <span className={`status-badge badge-${variant} badge-${size} ${className}`}>
      {showIcon && <IconComponent size={iconSize} className="status-badge-icon" />}
      <span className="status-badge-text">{label}</span>
    </span>
  )
}

