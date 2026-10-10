import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  UserPlus,
  Search,
  Lock,
  CheckCircle2,
  History,
  ShieldAlert,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CriticalAlertBanner } from '../ui/CriticalAlertBanner'
import { visitasApi, directorioApi, restriccionesApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { validarRutChileno, validarTelefonoChileno } from '../../utils/validators'
import type {
  BuscarRutResponseDto,
  DepartamentoDto,
  EstadoVisita,
  VerificacionRestriccionDto,
} from '../../types/models'

interface VisitaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedDeptoId?: number | null
}

export const VisitaModal: React.FC<VisitaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedDeptoId,
}) => {
  const { showSuccess, showError } = useToast()

  const [rut, setRut] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [departamentoId, setDepartamentoId] = useState<number | null>(preselectedDeptoId ?? null)
  const [estadoInicial, setEstadoInicial] = useState<EstadoVisita>('EN_ESPERA')
  const [observaciones, setObservaciones] = useState('')

  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([])
  const [isSearchingRut, setIsSearchingRut] = useState(false)
  const [rutLookupResult, setRutLookupResult] = useState<BuscarRutResponseDto | null>(null)
  const [restriction, setRestriction] = useState<VerificacionRestriccionDto | null>(null)
  const [warningConfirmed, setWarningConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rutInputRef = useRef<HTMLInputElement>(null)

  // Load departments list for dropdown
  useEffect(() => {
    const fetchDeptos = async () => {
      try {
        const data = await directorioApi.listarTodos()
        setDepartamentos(data.filter((d) => d.activo))
        if (preselectedDeptoId) {
          setDepartamentoId(preselectedDeptoId)
        } else if (data.length > 0) {
          setDepartamentoId((prev) => prev ?? data[0].id)
        }
      } catch (err) {
        console.error('Error al cargar departamentos:', err)
      }
    }
    fetchDeptos()
  }, [preselectedDeptoId])

  // Focus on mount
  useEffect(() => {
    rutInputRef.current?.focus()
  }, [])

  // Live lookup by RUT
  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleanRut = rut.trim()
      if (!cleanRut || cleanRut.length < 3) {
        setRutLookupResult(null)
        setRestriction(null)
        return
      }

      setIsSearchingRut(true)
      try {
        // 1. Search in visitasApi (also includes restriction check from backend)
        const res = await visitasApi.buscarPorRut(cleanRut)
        setRutLookupResult(res)

        if (res.existeHistorico) {
          if (res.nombre) setNombre(res.nombre)
          if (res.apellido) setApellido(res.apellido)
          if (res.telefono) setTelefono(res.telefono)
        }

        if (res.restriccion && res.restriccion.tieneRestriccion) {
          setRestriction(res.restriccion)
        } else {
          // Double-check direct restriction endpoint
          try {
            const restr = await restriccionesApi.verificarRut(cleanRut)
            if (restr.tieneRestriccion) {
              setRestriction(restr)
            } else {
              setRestriction(null)
            }
          } catch {
            setRestriction(null)
          }
        }
      } catch (err) {
        console.error('Error al buscar RUT:', err)
      } finally {
        setIsSearchingRut(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [rut])

  const isBlocked = restriction?.esBloqueoTotal === true

  const [rutError, setRutError] = useState<string | null>(null)
  const [telError, setTelError] = useState<string | null>(null)

  // Memoized grouped departments by floor (1 to 18)
  const deptosPorPiso = useMemo(() => {
    const grouped: Record<number, DepartamentoDto[]> = {}
    departamentos.forEach((d) => {
      if (!grouped[d.piso]) grouped[d.piso] = []
      grouped[d.piso].push(d)
    })
    return grouped
  }, [departamentos])

  const handleRutBlur = () => {
    if (!rut.trim()) {
      setRutError(null)
      return
    }
    const check = validarRutChileno(rut)
    if (!check.valido) {
      setRutError(check.mensaje || 'RUT inválido')
    } else {
      setRutError(null)
      if (check.rutFormateado) {
        setRut(check.rutFormateado)
      }
    }
  }

  const handleTelefonoBlur = () => {
    if (!telefono.trim()) {
      setTelError(null)
      return
    }
    const check = validarTelefonoChileno(telefono)
    if (!check.valido) {
      setTelError(check.mensaje || 'Teléfono inválido')
    } else {
      setTelError(null)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (isBlocked) {
      showError('ACCESO DENEGADO: La persona tiene prohibición judicial/bloqueo de ingreso.')
      return
    }

    if (restriction?.tieneRestriccion && !isBlocked && !warningConfirmed) {
      showError('Debes marcar la casilla de verificación de advertencia de seguridad para continuar.')
      return
    }

    if (!rut.trim() || !nombre.trim() || !apellido.trim() || !departamentoId) {
      showError('Por favor completa todos los campos requeridos (*)')
      return
    }

    // 1. Validar RUT chileno
    const rutCheck = validarRutChileno(rut)
    if (!rutCheck.valido) {
      setRutError(rutCheck.mensaje || 'RUT inválido')
      showError(rutCheck.mensaje || 'El RUT ingresado no es válido. Revisa formato y dígito verificador.')
      return
    }
    setRutError(null)

    // 2. Validar teléfono chileno (si se ingresó)
    const telCheck = validarTelefonoChileno(telefono)
    if (!telCheck.valido) {
      setTelError(telCheck.mensaje || 'Teléfono inválido')
      showError(telCheck.mensaje || 'El formato de teléfono no es válido.')
      return
    }
    setTelError(null)

    setIsSubmitting(true)
    try {
      await visitasApi.registrar({
        rut: rutCheck.rutFormateado || rut.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || undefined,
        departamentoId,
        estadoInicial,
        observaciones: observaciones.trim() || undefined,
      })

      showSuccess(`Visita de ${nombre} ${apellido} registrada exitosamente`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar visita'
      showError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault()
      if (!isBlocked) {
        handleSubmit()
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro Rápido de Visita"
      subtitle="Flujo optimizado para mesón de conserjería (Teclado: Tab y Enter)"
      icon={<UserPlus size={20} />}
      maxWidth={640}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Presiona <kbd>Enter</kbd> para registrar • <kbd>Esc</kbd> para cancelar
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant={isBlocked ? 'danger' : 'primary'}
              onClick={() => handleSubmit()}
              disabled={isBlocked || isSubmitting || (restriction?.tieneRestriccion && !warningConfirmed)}
              isLoading={isSubmitting}
              icon={isBlocked ? <Lock size={15} /> : <CheckCircle2 size={15} />}
            >
              {isBlocked ? 'Ingreso Bloqueado' : 'Registrar Visita'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* CRITICAL SECURITY ALERT BANNER */}
        {isBlocked && (
          <CriticalAlertBanner
            title="BLOQUEO MECÁNICO ACTIVO - ORDEN JUDICIAL / RESTRICCIÓN VIGENTE"
            rut={rut}
            isLockout={true}
            message={
              restriction?.mensajeAlerta ||
              'Persona con orden judicial cautelar de alejamiento o prohibición absoluta de ingreso al edificio.'
            }
            directives={[
              'Prohibición total y absoluta de franqueo de acceso.',
              'El torniquete electrónico se encuentra bloqueado por protocolo.',
              'No confrontar al visitante. Notificar de inmediato al supervisor y registrar en bitácora.',
              'En caso de insistencia o agresión, activar botón de pánico de Carabineros.',
            ]}
          />
        )}

        {/* Warning Banner (Non-total lockout) */}
        {!isBlocked && restriction?.tieneRestriccion && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid var(--status-warning)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-warning)', fontWeight: 700, fontSize: 13 }}>
              <ShieldAlert size={18} />
              ADVERTENCIA DE SEGURIDAD CRÍTICA
            </div>
            <p style={{ fontSize: 12, color: '#fef3c7', margin: '6px 0 10px 0', lineHeight: 1.4 }}>
              {restriction.mensajeAlerta || 'Verificar documento original y exigir autorización presencial del residente.'}
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#ffffff', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={warningConfirmed}
                onChange={(e) => setWarningConfirmed(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--status-warning)' }}
              />
              <span>He verificado la identidad físicamente y confirmo bajo protocolo de conserjería</span>
            </label>
          </div>
        )}

        {/* Recurrent Visitor Badge */}
        {rutLookupResult?.existeHistorico && !isBlocked && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--status-success-border)',
              borderRadius: '6px',
              padding: '6px 12px',
              marginBottom: 14,
              fontSize: 12,
              color: 'var(--status-success)',
            }}
          >
            <History size={16} />
            <span>
              <strong>Visitante Frecuente:</strong> Registra {rutLookupResult.totalVisitasHistoricas} visita(s) previa(s). Datos autocompletados.
            </span>
          </div>
        )}

        {/* Input Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* RUT / Documento */}
          <div style={{ gridColumn: 'span 2' }}>
            <Input
              ref={rutInputRef}
              label="Documento de Identidad (RUT / Pasaporte) *"
              hint="Autocompleta historial y valida lista de seguridad"
              placeholder="Ej: 17.345.678-9 o 11.111.111-1"
              value={rut}
              onChange={(e) => {
                setRut(e.target.value)
                if (rutError) setRutError(null)
              }}
              onBlur={handleRutBlur}
              error={rutError || undefined}
              prefixIcon={isSearchingRut ? <span className="animate-spin">⌛</span> : <Search size={16} />}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Nombre */}
          <Input
            label="Nombres *"
            placeholder="Ej: Sebastián"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={isBlocked || isSubmitting}
            required
          />

          {/* Apellidos */}
          <Input
            label="Apellidos *"
            placeholder="Ej: Pinto Rojas"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            disabled={isBlocked || isSubmitting}
            required
          />

          {/* Teléfono */}
          <Input
            label="Teléfono Móvil (Opcional)"
            placeholder="Ej: +56 9 3566 0839"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value)
              if (telError) setTelError(null)
            }}
            onBlur={handleTelefonoBlur}
            error={telError || undefined}
            disabled={isBlocked || isSubmitting}
          />

          {/* Departamento Destino */}
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">
              <span>Departamento Destino *</span>
            </label>
            <select
              className="form-select"
              value={departamentoId || ''}
              onChange={(e) => setDepartamentoId(Number(e.target.value))}
              disabled={isBlocked || isSubmitting}
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

        {/* Estado Inicial de la Visita */}
        <div style={{ marginTop: 6, marginBottom: 14 }}>
          <label className="form-label" style={{ marginBottom: 8 }}>
            <span>Estado Inicial de la Visita</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              onClick={() => setEstadoInicial('EN_ESPERA')}
              disabled={isBlocked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: estadoInicial === 'EN_ESPERA' ? 'rgba(56, 189, 248, 0.15)' : '#0d1526',
                border: `1px solid ${estadoInicial === 'EN_ESPERA' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: estadoInicial === 'EN_ESPERA' ? '#e0f2fe' : 'var(--text-secondary)',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `2px solid ${estadoInicial === 'EN_ESPERA' ? 'var(--accent-cyan)' : 'var(--text-muted)'}`,
                  background: estadoInicial === 'EN_ESPERA' ? 'var(--accent-cyan)' : 'transparent',
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>En Espera (Llamando)</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visita en mesón mientras se autoriza</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setEstadoInicial('AUTORIZADO')}
              disabled={isBlocked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: estadoInicial === 'AUTORIZADO' ? 'rgba(16, 185, 129, 0.15)' : '#0d1526',
                border: `1px solid ${estadoInicial === 'AUTORIZADO' ? 'var(--status-success)' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: estadoInicial === 'AUTORIZADO' ? '#d1fae5' : 'var(--text-secondary)',
                cursor: isBlocked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `2px solid ${estadoInicial === 'AUTORIZADO' ? 'var(--status-success)' : 'var(--text-muted)'}`,
                  background: estadoInicial === 'AUTORIZADO' ? 'var(--status-success)' : 'transparent',
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Autorizado Directo</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Registra check-in inmediato a piso</div>
              </div>
            </button>
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label">
            <span>Observaciones / Motivo de la Visita</span>
          </label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Ej: Reunión de trabajo, visita familiar, técnico autorizado..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={isBlocked || isSubmitting}
          />
        </div>
      </form>
    </Modal>
  )
}
