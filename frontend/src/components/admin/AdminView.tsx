import React, { useState } from 'react'
import { Building2, ShieldAlert, Users, FileText } from 'lucide-react'
import { AdminDepartamentos } from './AdminDepartamentos'
import { AdminRestricciones } from './AdminRestricciones'
import { AdminUsuarios } from './AdminUsuarios'
import { AdminAuditoria } from './AdminAuditoria'

export const AdminView: React.FC = () => {
  const [adminTab, setAdminTab] = useState<'deptos' | 'blacklist' | 'usuarios' | 'auditoria'>('deptos')

  const tabs: { id: 'deptos' | 'blacklist' | 'usuarios' | 'auditoria'; label: string; icon: React.ReactNode }[] = [
    { id: 'deptos', label: 'Departamentos y Residentes', icon: <Building2 size={15} /> },
    { id: 'blacklist', label: 'Lista de Restricciones (Blacklist)', icon: <ShieldAlert size={15} /> },
    { id: 'usuarios', label: 'Personal de Conserjería', icon: <Users size={15} /> },
    { id: 'auditoria', label: 'Auditoría y Reportes', icon: <FileText size={15} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Admin Nav Sub-pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 12,
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = adminTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                background: isActive ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {adminTab === 'deptos' && <AdminDepartamentos />}
      {adminTab === 'blacklist' && <AdminRestricciones />}
      {adminTab === 'usuarios' && <AdminUsuarios />}
      {adminTab === 'auditoria' && <AdminAuditoria />}
    </div>
  )
}
