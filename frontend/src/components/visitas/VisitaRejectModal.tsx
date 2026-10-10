import React, { useState } from 'react'
import { XCircle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { visitasApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import type { VisitaDto } from '../../types/models'

interface VisitaRejectModalProps {
  visita: VisitaDto | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const VisitaRejectModal: React.FC<VisitaRejectModalProps> = ({
  visita,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast()
  const [motivo, setMotivo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const quickReasons = [
    'No contesta citófono / teléfono',
    'Residente no autorizó el ingreso',
    'Persona no se identificó correctamente',
    'Depto no esperaba visitas a esta hora',
  ]

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!visita || !motivo.trim()) return

    setIsSubmitting(true)
    try {
      await visitasApi.rechazar(visita.id, { motivoRechazo: motivo.trim() })
      showSuccess(`Visita a depto ${visita.departamentoNumero} rechazada correctamente`)
      onSuccess()
      onClose()
      setMotivo('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al rechazar visita'
      showError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!visita) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rechazar Autorización de Visita"
      subtitle={`Visitante: ${visita.nombreCompleto} • Depto ${visita.departamentoNumero}`}
      icon={<XCircle size={20} color="var(--status-danger)" />}
      maxWidth={500}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleSubmit()}
            disabled={!motivo.trim() || isSubmitting}
            isLoading={isSubmitting}
          >
            Confirmar Rechazo
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Indica el motivo por el cual no se autoriza el ingreso de <strong>{visita.nombreCompleto}</strong>:
        </div>

        {/* Quick reasons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {quickReasons.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setMotivo(reason)}
              style={{
                background: motivo === reason ? 'rgba(239, 68, 68, 0.15)' : '#0d1526',
                border: `1px solid ${motivo === reason ? 'var(--status-danger)' : 'var(--border-subtle)'}`,
                borderRadius: '6px',
                padding: '8px 12px',
                textAlign: 'left',
                color: motivo === reason ? '#fee2e2' : 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {reason}
            </button>
          ))}
        </div>

        <Input
          label="Motivo Detallado"
          placeholder="Escribe el motivo del rechazo..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          autoFocus
          required
        />
      </form>
    </Modal>
  )
}
