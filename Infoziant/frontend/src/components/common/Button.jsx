import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
    size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
    type = 'button',
    isLoading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    ...props
  },
  ref
) {
  const baseClasses = `btn btn-${variant} btn-${size} ${className}`.trim()

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={baseClasses}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : LeftIcon ? (
        <LeftIcon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn-icon-left" />
      ) : null}
      <span>{children}</span>
      {!isLoading && RightIcon ? (
        <RightIcon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn-icon-right" />
      ) : null}
    </button>
  )
})

export default Button

