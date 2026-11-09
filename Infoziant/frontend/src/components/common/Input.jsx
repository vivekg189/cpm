import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    required = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`form-control-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className={`input-container ${error ? 'has-error' : ''}`}>
        {LeftIcon && (
          <div className="input-icon-left">
            <LeftIcon size={18} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`form-input ${LeftIcon ? 'with-left-icon' : ''} ${RightIcon ? 'with-right-icon' : ''}`}
          {...props}
        />
        {RightIcon && (
          <div className="input-icon-right">
            <RightIcon size={18} />
          </div>
        )}
      </div>
      {error && <p className="form-error-msg">{error}</p>}
      {!error && helperText && <p className="form-helper-text">{helperText}</p>}
    </div>
  )
})

export default Input

