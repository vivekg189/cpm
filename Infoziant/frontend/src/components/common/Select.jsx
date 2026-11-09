import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    required = false,
    options = [],
    placeholder,
    className = '',
    id,
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`form-control-wrapper ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className={`select-container ${error ? 'has-error' : ''}`}>
        <select
          ref={ref}
          id={selectId}
          className="form-select"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown size={18} className="select-arrow-icon" />
      </div>
      {error && <p className="form-error-msg">{error}</p>}
      {!error && helperText && <p className="form-helper-text">{helperText}</p>}
    </div>
  )
})

export default Select

