import React, { useState, useEffect, useMemo } from 'react'
import {
  PhoneCall,
  Search,
  User,
  Phone,
  Info,
  UserPlus,
  ShieldAlert,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { directorioApi } from '../../api/endpoints'
import type { DirectorioItemDto } from '../../types/models'
import { useQuickActions } from '../../context/QuickActionContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { CitofonoDialModal } from './CitofonoDialModal'

export const DirectorioPanel: React.FC = () => {
  const { openVisitaModal } = useQuickActions()
  const { showSuccess } = useToast()

  const [query, setQuery] = useState('')
  const [departamentos, setDepartamentos] = useState<DirectorioItemDto[]>([])
  const [selectedDepto, setSelectedDepto] = useState<DirectorioItemDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialModalOpen, setIsDialModalOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Fetch departments list
  useEffect(() => {
    const fetchDirectorio = async () => {
      setIsLoading(true)
      try {
        const data = await directorioApi.buscarDirectorio(query.trim() || undefined)
        setDepartamentos(data)
        setSelectedDepto((current) => {
          if (!current && data.length > 0) {
            const d104 = data.find((d) => d.numero === '104')
            return d104 || data[0]
          }
          if (current) {
            const updated = data.find((d) => d.departamentoId === current.departamentoId)
            return updated || current
          }
          return null
        })
      } catch (err) {
        console.error('Error al cargar directorio:', err)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchDirectorio, query ? 250 : 0)
    return () => clearTimeout(timer)
  }, [query])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    showSuccess(`${label} copiado al portapapeles`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const [activePiso, setActivePiso] = useState<number>(1)
  const selectedPiso = selectedDepto?.piso ?? activePiso

  // All distinct floors (1 to 18)
  const pisos = useMemo(() => {
    const pSet = new Set<number>()
    departamentos.forEach((d) => pSet.add(d.piso))
    if (pSet.size === 0) {
      return Array.from({ length: 18 }, (_, i) => i + 1)
    }
    return Array.from(pSet).sort((a, b) => a - b)
  }, [departamentos])

  // Deptos of currently selected floor
  const deptosDelPiso = useMemo(() => {
    return departamentos.filter((d) => d.piso === selectedPiso)
  }, [departamentos, selectedPiso])

  return (
    <div className="ops-panel" style={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Panel Header */}
      <div className="ops-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <PhoneCall size={15} color="var(--accent-cyan)" />
            Directorio & Citofonía
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {departamentos.length} deptos (18 pisos)
          </span>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          {isLoading ? (
            <Loader2 size={14} style={{ position: 'absolute', left: 9, top: 8, color: 'var(--accent-cyan)', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <Search size={14} style={{ position: 'absolute', left: 9, top: 8, color: 'var(--text-muted)' }} />
          )}
          <input
            type="text"
            placeholder="Buscar depto o residente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input"
            style={{
              padding: '6px 10px 6px 30px',
              fontSize: '12px',
            }}
          />
        </div>

        {/* Floor selector bar & floor apartments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Scrollable Floor selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Piso:
            </span>
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, flex: 1, scrollbarWidth: 'thin' }}>
              {pisos.map((piso) => {
                const isPisoSelected = selectedPiso === piso
                return (
                  <button
                    key={piso}
                    type="button"
                    onClick={() => {
                      setActivePiso(piso)
                      const firstInFloor = departamentos.find((d) => d.piso === piso)
                      if (firstInFloor) setSelectedDepto(firstInFloor)
                    }}
                    style={{
                      background: isPisoSelected ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.04)',
                      color: isPisoSelected ? '#ffffff' : 'var(--text-secondary)',
                      border: `1px solid ${isPisoSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-xs)',
                      padding: '2px 7px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    P{piso}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4 Departments for the selected floor */}
          <div style={{ display: 'flex', gap: 5 }}>
            {deptosDelPiso.length > 0 ? (
              deptosDelPiso.map((deptoItem) => {
                const isSelected = selectedDepto?.departamentoId === deptoItem.departamentoId
                return (
                  <button
                    key={deptoItem.departamentoId}
                    type="button"
                    onClick={() => setSelectedDepto(deptoItem)}
                    style={{
                      flex: 1,
                      background: isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#0a0f1e' : 'var(--text-primary)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-xs)',
                      padding: '4px 6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'center',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {deptoItem.numero}
                  </button>
                )
              })
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px' }}>
                Cargando departamentos del Piso {selectedPiso}...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Depto Detail Card */}
      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
        {selectedDepto ? (
          <div>
            {/* Depto Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 14,
                paddingBottom: 12,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    DEPTO {selectedDepto.numero}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Piso {selectedDepto.piso}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedDepto.torre || 'Torre Central'} • Anexo: #{selectedDepto.anexoCitofono || selectedDepto.numero}
                </div>
              </div>

              {/* Direct Intercom Call Button */}
              <Button
                size="sm"
                variant="cyan"
                icon={<PhoneCall size={13} />}
                onClick={() => setIsDialModalOpen(true)}
                title="Llamar directamente por citófono"
              >
                Llamar
              </Button>
            </div>

            {/* Resident Card */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Residente Titular
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  TITULAR
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedDepto.nombreTitular}
                  </div>
                </div>
              </div>

              {/* Contact info with copy action */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-card)',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Phone size={11} color="var(--text-muted)" />
                    Móvil:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedDepto.telefonoTitular || 'No registrado'}
                    </span>
                    {selectedDepto.telefonoTitular && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedDepto.telefonoTitular, 'Teléfono móvil')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                        title="Copiar teléfono"
                      >
                        {copiedField === 'Teléfono móvil' ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {selectedDepto.telefonoFijo && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-card)',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>Fijo red:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {selectedDepto.telefonoFijo}
                    </span>
                  </div>
                )}
              </div>

              {/* Other residents in depto */}
              {selectedDepto.todosResidentes && selectedDepto.todosResidentes.length > 1 && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Otros Residentes:
                  </div>
                  {selectedDepto.todosResidentes
                    .filter((r) => !r.esTitular)
                    .map((r) => (
                      <div key={r.id} style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: 2 }}>
                        • {r.nombreCompleto} ({r.telefono})
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Operational Notes */}
            {selectedDepto.notasOperativas && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderLeft: '3px solid var(--accent-cyan)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 11px',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  <Info size={13} />
                  Notas Operativas
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.4 }}>
                  {selectedDepto.notasOperativas}
                </p>
              </div>
            )}

            {/* Department Security Warnings */}
            {selectedDepto.advertenciaSeguridad && (
              <div
                style={{
                  background: 'var(--status-danger-bg)',
                  border: '1px solid var(--status-danger-border)',
                  borderLeft: '3px solid var(--status-danger)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 11px',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, color: '#fca5a5' }}>
                  <ShieldAlert size={13} />
                  Advertencia de Seguridad Interna
                </div>
                <p style={{ fontSize: '12px', color: '#fee2e2', marginTop: 4, lineHeight: 1.4 }}>
                  {selectedDepto.advertenciaSeguridad}
                </p>
              </div>
            )}

            {/* Action button: Pre-register visit for this department */}
            <div style={{ marginTop: 14 }}>
              <Button
                variant="primary"
                style={{ width: '100%' }}
                icon={<UserPlus size={14} />}
                onClick={() => openVisitaModal(selectedDepto.departamentoId)}
              >
                Registrar Visita para Depto {selectedDepto.numero}
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            <Phone size={26} style={{ marginBottom: 8, opacity: 0.4, display: 'inline-block' }} />
            <div style={{ fontSize: '12px' }}>Selecciona o busca un departamento</div>
          </div>
        )}
      </div>

      {/* Citofono Dial Modal */}
      <CitofonoDialModal
        isOpen={isDialModalOpen}
        onClose={() => setIsDialModalOpen(false)}
        depto={selectedDepto}
        onAuthorizeVisit={(deptoId) => openVisitaModal(deptoId)}
      />
    </div>
  )
}
