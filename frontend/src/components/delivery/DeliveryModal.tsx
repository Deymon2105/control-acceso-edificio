import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Truck, CheckCircle2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { deliveriesApi, directorioApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import type { DepartamentoDto } from '../../types/models'

interface DeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedDeptoId?: number | null
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedDeptoId,
}) => {
  const { showSuccess, showError } = useToast()

  const [empresa, setEmpresa] = useState('UberEats')
  const [nombreRepartidor, setNombreRepartidor] = useState('')
  const [rutRepartidor, setRutRepartidor] = useState('')
  const [departamentoId, setDepartamentoId] = useState<number | null>(preselectedDeptoId ?? null)
  const [notas, setNotas] = useState('')

  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nombreInputRef = useRef<HTMLInputElement>(null)

  const quickEmpresas = ['UberEats', 'PedidosYa', 'Rappi', 'MercadoLibre', 'Starken', 'Chilexpress']

  useEffect(() => {
    let isMounted = true
    const fetchDeptos = async () => {
      try {
        const data = await directorioApi.listarTodos()
        if (!isMounted) return
        const active = data.filter((d) => d.activo)
        setDepartamentos(active)
        setDepartamentoId((current) => {
          if (preselectedDeptoId) return preselectedDeptoId
          if (current) return current
          return active.length > 0 ? active[0].id : null
        })
      } catch (err) {
        console.error('Error al cargar departamentos:', err)
      }
    }
    void fetchDeptos()
    return () => {
      isMounted = false
    }
  }, [preselectedDeptoId])

  useEffect(() => {
    const timer = setTimeout(() => {
      nombreInputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!empresa.trim() || !nombreRepartidor.trim() || !departamentoId) {
      showError('Por favor completa todos los campos requeridos (*)')
      return
    }

    setIsSubmitting(true)
    try {
      await deliveriesApi.registrar({
        empresa: empresa.trim(),
        nombreRepartidor: nombreRepartidor.trim(),
        rutRepartidor: rutRepartidor.trim() || undefined,
        departamentoId,
        notas: notas.trim() || undefined,
      })

      showSuccess(`Delivery de ${empresa} a piso registrado correctamente (Temporizador de 15 min activo)`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar delivery'
      showError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const deptosPorPiso = useMemo(() => {
    const grouped: Record<number, DepartamentoDto[]> = {}
    departamentos.forEach((d) => {
      if (!grouped[d.piso]) grouped[d.piso] = []
      grouped[d.piso].push(d)
    })
    return grouped
  }, [departamentos])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recepción de Delivery en Mesón"
      subtitle="Registro de llegada del repartidor en recepción mientras retira el residente"
      icon={<Truck size={20} />}
      maxWidth={580}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Presiona <kbd>Enter</kbd> para registrar llegada de delivery
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              icon={<CheckCircle2 size={15} />}
            >
              Registrar Llegada
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* Quick Company Buttons */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label" style={{ marginBottom: 6 }}>
            <span>Empresa de Delivery *</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {quickEmpresas.map((emp) => (
              <button
                key={emp}
                type="button"
                onClick={() => setEmpresa(emp)}
                style={{
                  background: empresa === emp ? 'var(--accent-blue)' : '#0d1526',
                  color: empresa === emp ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${empresa === emp ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {emp}
              </button>
            ))}
          </div>
          <Input
            placeholder="O escribe otra empresa..."
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Nombre repartidor */}
          <Input
            ref={nombreInputRef}
            label="Nombre del Repartidor *"
            placeholder="Ej: Brayan Martínez"
            value={nombreRepartidor}
            onChange={(e) => setNombreRepartidor(e.target.value)}
            required
            autoFocus
          />

          {/* RUT repartidor */}
          <Input
            label="RUT / ID Repartidor (Opcional)"
            placeholder="Ej: 25.112.334-5"
            value={rutRepartidor}
            onChange={(e) => setRutRepartidor(e.target.value)}
          />

          {/* Departamento Destino */}
          <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 12 }}>
            <label className="form-label">
              <span>Departamento Destino *</span>
            </label>
            <select
              className="form-select"
              value={departamentoId || ''}
              onChange={(e) => setDepartamentoId(Number(e.target.value))}
              required
            >
              <option value="" disabled>
                Seleccionar departamento destino...
              </option>
              {Object.values(deptosPorPiso).map((deptos) => {
                const piso = deptos[0]?.piso
                return (
                  <optgroup key={piso} label={`Piso ${piso}`}>
                    {deptos.map((d) => (
                      <option key={d.id} value={d.id}>
                        Depto {d.numero} ({d.torre || 'Torre Central'})
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>
        </div>

        {/* Notas / Pedido */}
        <Input
          label="Detalle del Pedido / Notas"
          placeholder="Ej: Pedido #9823 comida rápida, bolsa de compras..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </form>
    </Modal>
  )
}
