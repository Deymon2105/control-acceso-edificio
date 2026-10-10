import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefixIcon?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefixIcon, suffix, id, style, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    return (
      <div className="form-group" style={{ marginBottom: 12 }}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            <span>{label}</span>
            {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{hint}</span>}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {prefixIcon && (
            <div
              style={{
                position: 'absolute',
                left: 10,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className="form-input"
            style={{
              paddingLeft: prefixIcon ? 34 : 12,
              paddingRight: suffix ? 34 : 12,
              borderColor: error ? 'var(--status-danger)' : undefined,
              ...style,
            }}
            {...props}
          />
          {suffix && (
            <div
              style={{
                position: 'absolute',
                right: 10,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {suffix}
            </div>
          )}
        </div>
        {error && <div className="form-error">{error}</div>}
      </div>
    )
  }
)

Input.displayName = 'Input'
