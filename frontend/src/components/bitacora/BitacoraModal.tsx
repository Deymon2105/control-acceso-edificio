import React, { useState } from 'react'
import { BookOpen, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { bitacoraApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import type { CategoriaBitacora } from '../../types/enums'

interface BitacoraModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const BitacoraModal: React.FC<BitacoraModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast()

  const getInitialTurno = () => {
    const hour = new Date().getHours()
    if (hour >= 7 && hour < 15) return 'Mañana'
    if (hour >= 15 && hour < 23) return 'Tarde'
    return 'Noche'
  }

  const [categoria, setCategoria] = useState<CategoriaBitacora>('GENERAL')
  const [descripcion, setDescripcion] = useState('')
  const [esAlerta, setEsAlerta] = useState(false)
  const [turno, setTurno] = useState<string>(getInitialTurno)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categorias: { id: CategoriaBitacora; label: string }[] = [
    { id: 'GENERAL', label: 'General / Novedad' },
    { id: 'RONDA', label: 'Ronda de Inspección' },
    { id: 'INCIDENTE', label: 'Incidente' },
    { id: 'SEGURIDAD', label: 'Seguridad' },
    { id: 'ENTREGA_TURNO', label: 'Entrega de Turno' },
    { id: 'MANTENCION', label: 'Mantención / Reparación' },
  ]

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!descripcion.trim()) {
      showError('La descripción de la novedad o suceso es obligatoria')
      return
    }

    setIsSubmitting(true)
    try {
      await bitacoraApi.registrar({
        categoria,
        descripcion: descripcion.trim(),
        esAlerta,
        turno,
      })

      showSuccess('Novedad asentada en la bitácora inmutable')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar bitácora'
      showError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asentar Novedad en Bitácora"
      subtitle="Registro inmutable de trazabilidad operativa y seguridad"
      icon={<BookOpen size={20} />}
      maxWidth={580}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Registro formal con firma de usuario y marca temporal inmutable
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant={esAlerta ? 'danger' : 'primary'}
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !descripcion.trim()}
              isLoading={isSubmitting}
              icon={<CheckCircle2 size={15} />}
            >
              Asentar Registro
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Categoría Selector */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label" style={{ marginBottom: 6 }}>
            <span>Categoría del Suceso *</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                style={{
                  background: categoria === cat.id ? 'var(--accent-blue)' : '#0d1526',
                  color: categoria === cat.id ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${categoria === cat.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  padding: '8px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Turno */}
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">
            <span>Turno Operativo</span>
          </label>
          <select
            className="form-select"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
          >
            <option value="Mañana">Turno Mañana (07:00 - 15:00)</option>
            <option value="Tarde">Turno Tarde (15:00 - 23:00)</option>
            <option value="Noche">Turno Noche (23:00 - 07:00)</option>
          </select>
        </div>

        {/* Alerta Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: esAlerta ? 'rgba(239, 68, 68, 0.15)' : '#0d1526',
            border: `1px solid ${esAlerta ? 'var(--status-danger)' : 'var(--border-subtle)'}`,
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: 14,
            cursor: 'pointer',
          }}
          onClick={() => setEsAlerta(!esAlerta)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color={esAlerta ? 'var(--status-danger)' : 'var(--text-muted)'} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: esAlerta ? '#fca5a5' : 'var(--text-primary)' }}>
                Marcar como Alerta Crítica / Incidente Grave
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Destaca la entrada en color rojo para el relevo de turno y administración
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={esAlerta}
            onChange={(e) => setEsAlerta(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#ef4444' }}
          />
        </div>

        {/* Descripción */}
        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label">
            <span>Descripción Detallada del Suceso *</span>
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Describe detalladamente los hechos, involucrados, números de depto, observaciones de ronda o entrega de llaves..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            autoFocus
          />
        </div>
      </form>
    </Modal>
  )
}
