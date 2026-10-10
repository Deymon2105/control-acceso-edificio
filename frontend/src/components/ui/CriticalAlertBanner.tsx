import React from 'react'
import { AlertOctagon, Lock } from 'lucide-react'

interface CriticalAlertBannerProps {
  title: string
  message: string
  directives?: string[]
  isLockout?: boolean
  rut?: string
}

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({
  title,
  message,
  directives,
  isLockout = true,
  rut,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#270e12',
        border: '1px solid #ef4444',
        borderLeft: '4px solid #ef4444',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 16px',
        marginBottom: '16px',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-xs)',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isLockout ? <Lock size={17} /> : <AlertOctagon size={18} />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#fee2e2',
                margin: 0,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </h4>
            {rut && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#fecaca',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                }}
              >
                RUT: {rut}
              </span>
            )}
            {isLockout && (
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                TORNIQUETE BLOQUEADO
              </span>
            )}
          </div>

          <p style={{ fontSize: '12.5px', color: '#fecaca', marginTop: 5, lineHeight: 1.45 }}>
            {message}
          </p>

          {directives && directives.length > 0 && (
            <div
              style={{
                marginTop: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 12px',
              }}
            >
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#fca5a5', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.03em' }}>
                Instrucciones Obligatorias para Conserjería:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12px', color: '#fee2e2', lineHeight: 1.5 }}>
                {directives.map((directive, idx) => (
                  <li key={idx}>{directive}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
