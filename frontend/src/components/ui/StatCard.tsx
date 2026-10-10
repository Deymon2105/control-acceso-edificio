import React from 'react'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  subtitle?: string
  trend?: string
  isAlert?: boolean
  onClick?: () => void
  colorTheme?: 'blue' | 'amber' | 'red' | 'green' | 'cyan'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  isAlert = false,
  onClick,
  colorTheme = 'blue',
}) => {
  let accentColor = 'var(--accent-blue)'
  if (colorTheme === 'amber' || isAlert) {
    accentColor = 'var(--status-warning)'
  } else if (colorTheme === 'red') {
    accentColor = 'var(--status-danger)'
  } else if (colorTheme === 'green') {
    accentColor = 'var(--status-success)'
  } else if (colorTheme === 'cyan') {
    accentColor = 'var(--accent-cyan)'
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isAlert ? 'var(--status-warning-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--border-strong)'
          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = isAlert ? 'var(--status-warning-border)' : 'var(--border-subtle)'
          e.currentTarget.style.backgroundColor = 'var(--bg-card)'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </span>
        <span
          style={{
            color: accentColor,
            opacity: 0.85,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </span>
      </div>

      <div style={{ margin: '8px 0 2px 0' }}>
        <div
          style={{
            fontSize: '26px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: '11.5px',
            color: isAlert ? 'var(--status-warning)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '2px',
          }}
        >
          {isAlert && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-warning)',
                display: 'inline-block',
              }}
            />
          )}
          {subtitle}
        </div>
      )}
    </div>
  )
}
