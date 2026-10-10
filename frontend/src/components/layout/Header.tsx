import React, { useState, useEffect } from 'react'
import {
  Building2,
  Clock,
  LogOut,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useQuickActions } from '../../context/QuickActionContext'
import { aforoApi } from '../../api/endpoints'
import { Badge } from '../ui/Badge'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const { setActiveTab } = useQuickActions()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [totalAforo, setTotalAforo] = useState<number>(0)

  // Real-time digital clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Poll aforo count periodically
  useEffect(() => {
    const fetchAforo = async () => {
      try {
        const res = await aforoApi.obtenerResumen()
        setTotalAforo(res.totalPersonasEnEdificio)
      } catch {
        // Backend might be offline in mock mode or error
      }
    }
    fetchAforo()
    const interval = setInterval(fetchAforo, 10000)
    return () => clearInterval(interval)
  }, [])

  // Current Shift calculation
  const getTurno = () => {
    const hour = currentTime.getHours()
    if (hour >= 7 && hour < 15) return 'Turno Mañana'
    if (hour >= 15 && hour < 23) return 'Turno Tarde'
    return 'Turno Noche'
  }

  const formatHora = (d: Date) => {
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatFecha = (d: Date) => {
    const str = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Building identification */}
      <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'center', gap: 12, minWidth: 'max-content' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#162238',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          <Building2 size={20} color="#38bdf8" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
              DEPTO PRIMERA AVENIDA
            </span>
            <span
              style={{
                fontSize: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              CONTROL OPERATIVO
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{getTurno()}</span>
            <span>•</span>
            <span>Mesón Principal</span>
          </div>
        </div>
      </div>

      {/* Center: Live Clock */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 12px',
          }}
        >
          <Clock size={15} color="var(--text-muted)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {formatHora(currentTime)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
              {formatFecha(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Emergency Aforo Button & User info */}
      <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14, minWidth: 'max-content' }}>
        {/* 1-Click EMERGENCY AFORO BUTTON */}
        <button
          type="button"
          onClick={() => setActiveTab('aforo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            color: '#fca5a5',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.16)'
            e.currentTarget.style.borderColor = 'var(--status-danger)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
            e.currentTarget.style.borderColor = 'var(--status-danger-border)'
          }}
          title="Abrir Monitor de Aforo y Evacuación de Emergencia (F9)"
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger)',
              display: 'inline-block',
            }}
          />
          <AlertTriangle size={14} color="var(--status-danger)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1, color: '#fee2e2' }}>
              AFORO ACTIVO
            </div>
            <div style={{ fontSize: 10, color: '#fca5a5' }}>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{totalAforo}</span> personas
            </div>
          </div>
          <kbd style={{ marginLeft: 4, background: '#2c1214', borderColor: '#7f1d1d', color: '#fca5a5' }}>F9</kbd>
        </button>

        {/* User Badge & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.nombreCompleto || user?.username || 'Usuario'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 1 }}>
              <Badge variant={user?.rol === 'ADMIN' ? 'ADMIN' : 'CONSERJE'} size="sm" />
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--status-danger)'
              e.currentTarget.style.borderColor = 'var(--status-danger-border)'
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
