import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  AlertTriangle,
  Clock,
  User,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react'
import { bitacoraApi } from '../../api/endpoints'
import type { RegistroBitacoraDto } from '../../types/models'
import type { CategoriaBitacora } from '../../types/enums'
import { useQuickActions } from '../../context/QuickActionContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { BitacoraModal } from './BitacoraModal'

export const BitacoraView: React.FC = () => {
  const { isBitacoraModalOpen, openBitacoraModal, closeBitacoraModal } = useQuickActions()
  const { showSuccess, showError } = useToast()

  const [novedades, setNovedades] = useState<RegistroBitacoraDto[]>([])
  const [categoriaFilter, setCategoriaFilter] = useState<string>('TODAS')
  const [soloAlertas, setSoloAlertas] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [itemAEliminar, setItemAEliminar] = useState<RegistroBitacoraDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadBitacora = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await bitacoraApi.listar({
        categoria: categoriaFilter !== 'TODAS' ? (categoriaFilter as CategoriaBitacora) : undefined,
        soloAlertas: soloAlertas ? true : undefined,
      })
      setNovedades(data)
    } catch (err) {
      console.error('Error al cargar bitácora:', err)
    } finally {
      setIsLoading(false)
    }
  }, [categoriaFilter, soloAlertas])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const data = await bitacoraApi.listar({
          categoria: categoriaFilter !== 'TODAS' ? (categoriaFilter as CategoriaBitacora) : undefined,
          soloAlertas: soloAlertas ? true : undefined,
        })
        if (!ignore) {
          setNovedades(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error al cargar bitácora:', err)
          setIsLoading(false)
        }
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [categoriaFilter, soloAlertas])

  const categorias = ['TODAS', 'INCIDENTE', 'RONDA', 'ENTREGA_TURNO', 'MANTENCION', 'SEGURIDAD', 'GENERAL']

  const formatFecha = (dStr: string) => {
    const d = new Date(dStr)
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleConfirmEliminar = async () => {
    if (!itemAEliminar) return
    const idParaEliminar = itemAEliminar.id
    setIsDeleting(true)
    try {
      await bitacoraApi.eliminar(idParaEliminar)
      setNovedades((prev) => prev.filter((item) => item.id !== idParaEliminar))
      showSuccess('Registro de bitácora eliminado correctamente')
      setItemAEliminar(null)
      await loadBitacora()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar registro de bitácora'
      showError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Filter and Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '14px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Filter size={15} />
            <span>Categoría:</span>
          </div>

          <div style={{ display: 'flex', gap: 5, overflowX: 'auto' }}>
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoriaFilter(c)}
                style={{
                  background: categoriaFilter === c ? 'var(--accent-blue)' : '#0d1526',
                  color: categoriaFilter === c ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${categoriaFilter === c ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {c === 'TODAS' ? 'Todas las Categorías' : c}
              </button>
            ))}
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: soloAlertas ? '#fca5a5' : 'var(--text-secondary)',
              cursor: 'pointer',
              marginLeft: 10,
              background: soloAlertas ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              padding: '4px 8px',
              borderRadius: 4,
              border: `1px solid ${soloAlertas ? 'var(--status-danger)' : 'transparent'}`,
            }}
          >
            <input
              type="checkbox"
              checked={soloAlertas}
              onChange={(e) => setSoloAlertas(e.target.checked)}
              style={{ accentColor: '#ef4444' }}
            />
            <AlertTriangle size={13} color={soloAlertas ? '#ef4444' : 'var(--text-muted)'} />
            <strong>Solo Alertas Críticas</strong>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            onClick={loadBitacora}
          >
            Sincronizar
          </Button>

          <Button
            size="sm"
            variant="cyan"
            shortcut="F8"
            icon={<Plus size={15} />}
            onClick={openBitacoraModal}
          >
            + Asentar Novedad
          </Button>
        </div>
      </div>

      {/* Log Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {novedades.length > 0 ? (
          novedades.map((item) => (
            <div
              key={item.id}
              style={{
                background: item.esAlerta
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, var(--bg-card) 100%)'
                  : 'var(--bg-card)',
                border: `1px solid ${item.esAlerta ? 'var(--status-danger-border)' : 'var(--border-subtle)'}`,
                borderLeft: `4px solid ${item.esAlerta ? 'var(--status-danger)' : 'var(--accent-blue)'}`,
                borderRadius: '8px',
                padding: '14px 18px',
                boxShadow: item.esAlerta ? 'var(--shadow-glow-red)' : 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#0a0f1e',
                      color: 'var(--accent-cyan)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {item.categoria}
                  </span>

                  {item.esAlerta && (
                    <Badge variant="red" label="ALERTA CRÍTICA" pulse={true} />
                  )}

                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Turno: <strong>{item.turno || 'Sin especificar'}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={13} />
                    <span>{item.usuarioNombre}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} />
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatFecha(item.fechaHora)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemAEliminar(item)}
                    title="Eliminar este registro de bitácora"
                    aria-label="Eliminar este registro de bitácora"
                    style={{
                      background: 'transparent',
                      border: '1px solid transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      width: 26,
                      height: 26,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444'
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                {item.descripcion}
              </p>
            </div>
          ))
        ) : (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '40px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <BookOpen size={32} style={{ opacity: 0.35, marginBottom: 8 }} />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              No se encontraron registros en la bitácora con los filtros seleccionados
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      {itemAEliminar && (
        <Modal
          isOpen={Boolean(itemAEliminar)}
          onClose={() => setItemAEliminar(null)}
          title="Eliminar Registro de Bitácora"
          maxWidth={460}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
              <Button variant="ghost" onClick={() => setItemAEliminar(null)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmEliminar}
                isLoading={isDeleting}
                icon={<Trash2 size={14} />}
              >
                Eliminar Registro
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, lineHeight: 1.4 }}>
              ¿Estás seguro de que deseas eliminar este registro de bitácora? Esta acción no se puede deshacer.
            </p>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
              }}
            >
              "{itemAEliminar.descripcion}"
            </div>
          </div>
        </Modal>
      )}

      <BitacoraModal
        isOpen={isBitacoraModalOpen}
        onClose={closeBitacoraModal}
        onSuccess={loadBitacora}
      />
    </div>
  )
}
