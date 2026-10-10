import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Package, CheckCircle2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { paquetesApi, directorioApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import type { DepartamentoDto } from '../../types/models'

interface PaqueteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedDeptoId?: number | null
}

export const PaqueteModal: React.FC<PaqueteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedDeptoId,
}) => {
  const { showSuccess, showError } = useToast()

  const [codigoUbicacion, setCodigoUbicacion] = useState('')
  const [empresaTransporte, setEmpresaTransporte] = useState('Chilexpress')
  const [codigoSeguimiento, setCodigoSeguimiento] = useState('')
  const [departamentoId, setDepartamentoId] = useState<number | null>(preselectedDeptoId ?? null)
  const [descripcion, setDescripcion] = useState('')
  const [notas, setNotas] = useState('')

  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const seguimientoInputRef = useRef<HTMLInputElement>(null)

  const quickEmpresas = ['Chilexpress', 'Starken', 'Blue Express', 'MercadoLibre', 'CorreosChile', 'Amazon']

  const generateLocationCode = (deptoId: number, deptosList: DepartamentoDto[]) => {
    const depto = deptosList.find((d) => d.id === deptoId)
    if (depto) {
      const randomNum = Math.floor(Math.random() * 89 + 10)
      return `#PAQ-${depto.numero}-${randomNum}`
    }
    return ''
  }

  useEffect(() => {
    let isMounted = true
    const fetchDeptos = async () => {
      try {
        const data = await directorioApi.listarTodos()
        if (!isMounted) return
        const active = data.filter((d) => d.activo)
        setDepartamentos(active)
        const initialDeptoId = preselectedDeptoId ?? (active.length > 0 ? active[0].id : null)
        if (initialDeptoId) {
          setDepartamentoId(initialDeptoId)
          setCodigoUbicacion((curr) => curr || generateLocationCode(initialDeptoId, active))
        }
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
      seguimientoInputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!empresaTransporte.trim() || !departamentoId) {
      showError('Por favor selecciona la empresa de transporte y el departamento destino')
      return
    }

    setIsSubmitting(true)
    try {
      await paquetesApi.registrar({
        codigoUbicacion: codigoUbicacion.trim() || undefined,
        codigoSeguimiento: codigoSeguimiento.trim() || undefined,
        empresaTransporte: empresaTransporte.trim(),
        departamentoId,
        descripcion: descripcion.trim() || undefined,
        notas: notas.trim() || undefined,
      })

      showSuccess(`Encomienda recepcionada en conserjería (${codigoUbicacion})`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al recepcionar paquete'
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
      title="Recepción de Encomienda / Paquetería"
      subtitle="Custodia física en conserjería con código de casillero / estante"
      icon={<Package size={20} />}
      maxWidth={580}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Presiona <kbd>Enter</kbd> para recepcionar
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
              Recepcionar en Custodia
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* Quick transport company selector */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label" style={{ marginBottom: 6 }}>
            <span>Empresa de Transporte *</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {quickEmpresas.map((emp) => (
              <button
                key={emp}
                type="button"
                onClick={() => setEmpresaTransporte(emp)}
                style={{
                  background: empresaTransporte === emp ? 'var(--accent-blue)' : '#0d1526',
                  color: empresaTransporte === emp ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${empresaTransporte === emp ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
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
            value={empresaTransporte}
            onChange={(e) => setEmpresaTransporte(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Tracking / Código seguimiento */}
          <Input
            ref={seguimientoInputRef}
            label="Código de Seguimiento / Guía"
            placeholder="Ej: CH-987123654"
            value={codigoSeguimiento}
            onChange={(e) => setCodigoSeguimiento(e.target.value)}
            autoFocus
          />

          {/* Código ubicación física */}
          <Input
            label="Código de Ubicación Física (Estante/Casillero)"
            placeholder="Ej: #PAQ-104-01"
            value={codigoUbicacion}
            onChange={(e) => setCodigoUbicacion(e.target.value)}
          />

          {/* Departamento Destino */}
          <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 12 }}>
            <label className="form-label">
              <span>Departamento Destinatario *</span>
            </label>
            <select
              className="form-select"
              value={departamentoId || ''}
              onChange={(e) => {
                const id = Number(e.target.value)
                setDepartamentoId(id)
                setCodigoUbicacion(generateLocationCode(id, departamentos))
              }}
              required
            >
              <option value="" disabled>
                Seleccionar departamento...
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

        {/* Descripción paquete */}
        <Input
          label="Descripción del Paquete"
          placeholder="Ej: Caja mediana rotulada e-commerce, sobre documentos..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        {/* Notas */}
        <Input
          label="Notas Adicionales"
          placeholder="Ej: Dejado por repartidor en mesón, requiere firma..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </form>
    </Modal>
  )
}
