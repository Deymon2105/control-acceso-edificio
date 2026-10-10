import React, { useState } from 'react'
import { CheckCircle2, PackageCheck } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { paquetesApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import type { PaqueteDto } from '../../types/models'

interface EntregarPaqueteModalProps {
  paquete: PaqueteDto | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const EntregarPaqueteModal: React.FC<EntregarPaqueteModalProps> = ({
  paquete,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast()
  const [retiradoPor, setRetiradoPor] = useState('')
  const [notas, setNotas] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!paquete || !retiradoPor.trim()) {
      showError('El nombre de la persona que retira la encomienda es obligatorio')
      return
    }

    setIsSubmitting(true)
    try {
      await paquetesApi.entregar(paquete.id, {
        retiradoPor: retiradoPor.trim(),
        notas: notas.trim() || undefined,
      })

      showSuccess(`Paquete ${paquete.codigoUbicacion} entregado exitosamente a ${retiradoPor}`)
      onSuccess()
      onClose()
      setRetiradoPor('')
      setNotas('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al entregar paquete'
      showError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!paquete) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entregar Encomienda a Residente"
      subtitle={`Ubicación: ${paquete.codigoUbicacion} • Depto ${paquete.departamentoNumero}`}
      icon={<PackageCheck size={20} color="var(--status-success)" />}
      maxWidth={480}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={() => handleSubmit()}
            disabled={!retiradoPor.trim() || isSubmitting}
            isLoading={isSubmitting}
            icon={<CheckCircle2 size={15} />}
          >
            Confirmar Entrega
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: 14,
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <div><strong>Empresa:</strong> {paquete.empresaTransporte}</div>
          {paquete.codigoSeguimiento && <div><strong>Tracking:</strong> {paquete.codigoSeguimiento}</div>}
          {paquete.descripcion && <div><strong>Detalle:</strong> {paquete.descripcion}</div>}
        </div>

        <Input
          label="Nombre de Quién Retira *"
          placeholder="Ej: Rodrigo Morales (Titular) o Camila Pérez"
          value={retiradoPor}
          onChange={(e) => setRetiradoPor(e.target.value)}
          autoFocus
          required
        />

        <Input
          label="Notas Adicionales de Entrega"
          placeholder="Ej: Retirado personalmente con carnet / conserje presenció entrega..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </form>
    </Modal>
  )
}
