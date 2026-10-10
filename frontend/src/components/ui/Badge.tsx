import React from 'react'

export type BadgeVariant =
  | 'AUTORIZADO'
  | 'EN_ESPERA'
  | 'RECHAZADO'
  | 'FINALIZADO'
  | 'EN_TRANSITO'
  | 'CANCELADO'
  | 'RECIBIDO_EN_CONSERJERIA'
  | 'ENTREGADO_A_RESIDENTE'
  | 'BLOQUEO_TOTAL'
  | 'ADVERTENCIA_CRITICA'
  | 'ADMIN'
  | 'CONSERJE'
  | 'green'
  | 'red'
  | 'amber'
  | 'blue'
  | 'gray'
  | 'cyan'

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  pulse?: boolean
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({ variant, label, pulse = false, size = 'sm' }) => {
  let bg = 'rgba(148, 163, 184, 0.08)'
  let color = '#94a3b8'
  let border = 'rgba(148, 163, 184, 0.2)'
  let dotColor = '#94a3b8'
  let text = label

  switch (variant) {
    case 'AUTORIZADO':
    case 'green':
      bg = 'rgba(16, 185, 129, 0.1)'
      color = '#34d399'
      border = 'rgba(16, 185, 129, 0.25)'
      dotColor = '#10b981'
      text = text || 'AUTORIZADO'
      break

    case 'EN_ESPERA':
    case 'blue':
      bg = 'rgba(56, 189, 248, 0.1)'
      color = '#38bdf8'
      border = 'rgba(56, 189, 248, 0.25)'
      dotColor = '#0ea5e9'
      text = text || 'EN ESPERA'
      break

    case 'RECHAZADO':
    case 'BLOQUEO_TOTAL':
    case 'red':
      bg = 'rgba(239, 68, 68, 0.1)'
      color = '#f87171'
      border = 'rgba(239, 68, 68, 0.25)'
      dotColor = '#ef4444'
      text = text || (variant === 'BLOQUEO_TOTAL' ? 'BLOQUEO TOTAL' : 'RECHAZADO')
      break

    case 'ADVERTENCIA_CRITICA':
    case 'amber':
      bg = 'rgba(245, 158, 11, 0.1)'
      color = '#fbbf24'
      border = 'rgba(245, 158, 11, 0.25)'
      dotColor = '#f59e0b'
      text = text || 'ADVERTENCIA'
      break

    case 'EN_TRANSITO':
      bg = 'rgba(14, 165, 233, 0.1)'
      color = '#38bdf8'
      border = 'rgba(14, 165, 233, 0.25)'
      dotColor = '#0ea5e9'
      text = text || 'EN TRÁNSITO'
      break

    case 'RECIBIDO_EN_CONSERJERIA':
      bg = 'rgba(168, 85, 247, 0.1)'
      color = '#c084fc'
      border = 'rgba(168, 85, 247, 0.25)'
      dotColor = '#a855f7'
      text = text || 'EN CUSTODIA'
      break

    case 'ENTREGADO_A_RESIDENTE':
      bg = 'rgba(16, 185, 129, 0.1)'
      color = '#34d399'
      border = 'rgba(16, 185, 129, 0.25)'
      dotColor = '#10b981'
      text = text || 'ENTREGADO'
      break

    case 'FINALIZADO':
    case 'CANCELADO':
    case 'gray':
      bg = 'rgba(148, 163, 184, 0.08)'
      color = '#94a3b8'
      border = 'rgba(148, 163, 184, 0.2)'
      dotColor = '#64748b'
      text = text || (variant === 'CANCELADO' ? 'CANCELADO' : 'FINALIZADO')
      break

    case 'ADMIN':
      bg = 'rgba(239, 68, 68, 0.12)'
      color = '#fca5a5'
      border = 'rgba(239, 68, 68, 0.3)'
      dotColor = '#ef4444'
      text = text || 'ADMIN'
      break

    case 'CONSERJE':
      bg = 'rgba(56, 189, 248, 0.1)'
      color = '#7dd3fc'
      border = 'rgba(56, 189, 248, 0.25)'
      dotColor = '#38bdf8'
      text = text || 'CONSERJE'
      break

    case 'cyan':
      bg = 'rgba(14, 165, 233, 0.1)'
      color = '#38bdf8'
      border = 'rgba(14, 165, 233, 0.25)'
      dotColor = '#0ea5e9'
      text = text || ''
      break
  }

  const isSmall = size === 'sm'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: isSmall ? '1.5px 7px' : '3px 9px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 500,
        letterSpacing: '0.02em',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        lineHeight: 1.25,
      }}
    >
      <span
        style={{
          width: isSmall ? 5 : 6,
          height: isSmall ? 5 : 6,
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          opacity: 0.9,
          animation: pulse ? 'beacon 1.5s infinite ease-in-out' : 'none',
        }}
      />
      {text}
    </span>
  )
}
