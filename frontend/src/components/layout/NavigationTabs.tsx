import React from 'react'
import {
  LayoutDashboard,
  Truck,
  BookOpen,
  ShieldAlert,
  Settings,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useQuickActions, type NavTab } from '../../context/QuickActionContext'

export const NavigationTabs: React.FC = () => {
  const { isAdmin } = useAuth()
  const { activeTab, setActiveTab } = useQuickActions()

  const tabs: { id: NavTab; label: string; icon: React.ReactNode; adminOnly?: boolean; isEmergency?: boolean }[] = [
    { id: 'panel', label: 'Panel Principal', icon: <LayoutDashboard size={15} /> },
    { id: 'deliveries', label: 'Deliveries & Paquetería', icon: <Truck size={15} /> },
    { id: 'bitacora', label: 'Bitácora de Turno', icon: <BookOpen size={15} /> },
    {
      id: 'aforo',
      label: 'Monitor de Aforo (Siniestros)',
      icon: <ShieldAlert size={15} />,
      isEmergency: true,
    },
    { id: 'admin', label: 'Administración', icon: <Settings size={15} />, adminOnly: true },
  ]

  return (
    <nav
      aria-label="Navegación del sistema"
      style={{
        backgroundColor: 'var(--bg-app)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        overflowX: 'auto',
      }}
    >
      {tabs
        .filter((tab) => !tab.adminOnly || isAdmin)
        .map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '10px 14px',
                fontSize: '12.5px',
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? (tab.isEmergency ? '#fca5a5' : 'var(--text-primary)')
                  : 'var(--text-secondary)',
                backgroundColor: isActive
                  ? (tab.isEmergency ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)')
                  : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${
                  isActive
                    ? (tab.isEmergency ? 'var(--status-danger)' : 'var(--accent-blue)')
                    : 'transparent'
                }`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.025)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7, display: 'flex' }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.isEmergency && (
                <span
                  style={{
                    fontSize: '9.5px',
                    backgroundColor: 'rgba(239, 68, 68, 0.25)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0px 4px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  SOS
                </span>
              )}
            </button>
          )
        })}
    </nav>
  )
}
