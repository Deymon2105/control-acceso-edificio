import React from 'react'

export type ButtonVariant = 'primary' | 'danger' | 'warning' | 'secondary' | 'cyan' | 'ghost' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  shortcut?: string
  icon?: React.ReactNode
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  shortcut,
  icon,
  isLoading,
  disabled,
  style,
  ...props
}) => {
  let bg = 'var(--accent-blue)'
  let color = '#ffffff'
  let border = '1px solid rgba(255, 255, 255, 0.12)'
  let hoverBg = 'var(--accent-blue-hover)'

  if (variant === 'danger') {
    bg = 'var(--status-danger)'
    color = '#ffffff'
    border = '1px solid rgba(255, 255, 255, 0.12)'
    hoverBg = '#dc2626'
  } else if (variant === 'warning') {
    bg = 'var(--status-warning)'
    color = '#080c15'
    border = '1px solid rgba(0, 0, 0, 0.12)'
    hoverBg = '#d97706'
  } else if (variant === 'success') {
    bg = 'var(--status-success)'
    color = '#ffffff'
    border = '1px solid rgba(255, 255, 255, 0.12)'
    hoverBg = '#059669'
  } else if (variant === 'cyan') {
    bg = 'var(--accent-cyan)'
    color = '#ffffff'
    border = '1px solid rgba(255, 255, 255, 0.12)'
    hoverBg = 'var(--accent-cyan-hover)'
  } else if (variant === 'secondary') {
    bg = 'rgba(255, 255, 255, 0.05)'
    color = 'var(--text-primary)'
    border = '1px solid var(--border-subtle)'
    hoverBg = 'rgba(255, 255, 255, 0.09)'
  } else if (variant === 'ghost') {
    bg = 'transparent'
    color = 'var(--text-secondary)'
    border = '1px solid transparent'
    hoverBg = 'rgba(255, 255, 255, 0.05)'
  }

  const padding = size === 'sm' ? '4px 9px' : size === 'lg' ? '10px 18px' : '7px 13px'
  const fontSize = size === 'sm' ? '12px' : size === 'lg' ? '14px' : '13px'

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 500,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: bg,
        color,
        border,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
        outline: 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) e.currentTarget.style.backgroundColor = hoverBg
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) e.currentTarget.style.backgroundColor = bg
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--border-focus)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: 13,
            height: 13,
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            borderTopColor: '#fff',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      {children}
      {shortcut && <kbd style={{ marginLeft: 3 }}>{shortcut}</kbd>}
    </button>
  )
}
