import React, { useState, useEffect } from 'react'
import { ShieldAlert, Plus, Search } from 'lucide-react'
import { restriccionesApi, directorioApi } from '../../api/endpoints'
import type { RestriccionDto, DepartamentoDto } from '../../types/models'
import type { TipoRestriccion } from '../../types/enums'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { formatearRutEnVivo, formatearRut } from '../../utils/validators'

export const AdminRestricciones: React.FC = () => {
  const { showSuccess, showError } = useToast()
  const [restricciones, setRestricciones] = useState<RestriccionDto[]>([])
  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([])
  const [query, setQuery] = useState('')
  const [_isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [rut, setRut] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [tipoRestriccion, setTipoRestriccion] = useState<TipoRestriccion>('BLOQUEO_TOTAL')
  const [departamentoId, setDepartamentoId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadRestricciones = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [rData, dData] = await Promise.all([
        restriccionesApi.listar(query.trim() || undefined),
        directorioApi.listarTodos(),
      ])
      setRestricciones(rData)
      setDepartamentos(dData)
    } catch (err) {
      console.error(err)
      showError('Error al cargar lista de restricciones')
    } finally {
      setIsLoading(false)
    }
  }, [query, showError])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const [rData, dData] = await Promise.all([
          restriccionesApi.listar(query.trim() || undefined),
          directorioApi.listarTodos(),
        ])
        if (!ignore) {
          setRestricciones(rData)
          setDepartamentos(dData)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          showError('Error al cargar lista de restricciones')
          setIsLoading(false)
        }
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [query, showError])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rut.trim() || !nombreCompleto.trim() || !motivo.trim()) {
      showError('Por favor completa los campos requeridos')
      return
    }

    setIsSubmitting(true)
    try {
      await restriccionesApi.crear({
        rut: rut.trim(),
        nombreCompleto: nombreCompleto.trim(),
        motivo: motivo.trim(),
        tipoRestriccion,
        departamentoId: departamentoId ?? undefined,
      })

      showSuccess(`Restricción creada para ${nombreCompleto}`)
      setIsModalOpen(false)
      setRut('')
      setNombreCompleto('')
      setMotivo('')
      setDepartamentoId(null)
      loadRestricciones()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al crear restricción')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivate = async (id: number, nombre: string) => {
    if (!confirm(`¿Desactivar la restricción de seguridad para ${nombre}?`)) return
    try {
      await restriccionesApi.desactivar(id)
      showSuccess(`Restricción desactivada para ${nombre}`)
      loadRestricciones()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al desactivar restricción')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Lista de Restricciones y Seguridad (Blacklist)</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Configuración de órdenes judiciales cautelares y prohibiciones mecánicas de torniquete
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: 8, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por RUT o nombre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                background: '#0a0f1e',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 10px 6px 28px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <Button
            size="sm"
            variant="danger"
            icon={<Plus size={15} />}
            onClick={() => setIsModalOpen(true)}
          >
            + Nueva Restricción
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="dense-table">
          <thead>
            <tr>
              <th>RUT / Documento</th>
              <th>Persona con Restricción</th>
              <th>Tipo de Restricción</th>
              <th>Motivo / Causa Judicial</th>
              <th>Depto Asociado</th>
              <th>Registrado Por</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {restricciones.length > 0 ? (
              restricciones.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    backgroundColor: r.activo && r.tipoRestriccion === 'BLOQUEO_TOTAL' ? 'rgba(239, 68, 68, 0.08)' : undefined,
                  }}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f87171' }}>
                      {r.rut}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{r.nombreCompleto}</strong>
                  </td>
                  <td>
                    <Badge variant={r.tipoRestriccion} />
                  </td>
                  <td style={{ maxWidth: 320 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {r.motivo}
                    </div>
                  </td>
                  <td>
                    {r.departamentoNumero ? (
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        Depto {r.departamentoNumero}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Edificio Completo</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.registradoPor}</span>
                  </td>
                  <td>
                    {r.activo ? (
                      <Badge variant="green" label="ACTIVA" />
                    ) : (
                      <Badge variant="gray" label="INACTIVA" />
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {r.activo && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeactivate(r.id, r.nombreCompleto)}
                      >
                        Desactivar
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                  <ShieldAlert size={30} style={{ opacity: 0.35, marginBottom: 6 }} />
                  <div>No hay restricciones registradas</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Restricción */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Restricción de Seguridad"
        subtitle="Bloqueo judicial u orden de alejamiento inmediata"
        icon={<ShieldAlert size={20} color="var(--status-danger)" />}
        maxWidth={540}
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input
              label="RUT / Documento *"
              placeholder="Ej: 11.111.111-1"
              value={rut}
              onChange={(e) => setRut(formatearRutEnVivo(e.target.value))}
              onBlur={() => {
                if (rut.trim()) {
                  setRut(formatearRut(rut))
                }
              }}
              required
              autoFocus
            />
            <Input
              label="Nombre Completo *"
              placeholder="Ej: Manuel Antonio Castro"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">
              <span>Tipo de Restricción *</span>
            </label>
            <select
              className="form-select"
              value={tipoRestriccion}
              onChange={(e) => setTipoRestriccion(e.target.value as TipoRestriccion)}
            >
              <option value="BLOQUEO_TOTAL">BLOQUEO TOTAL (Prohibición absoluta + Bloqueo mecánico torniquete)</option>
              <option value="ADVERTENCIA_CRITICA">ADVERTENCIA CRÍTICA (Exigir verificación presencial)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">
              <span>Departamento Vinculado (Opcional)</span>
            </label>
            <select
              className="form-select"
              value={departamentoId || ''}
              onChange={(e) => setDepartamentoId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Afecta a todo el edificio</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  Depto {d.numero} (Piso {d.piso})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">
              <span>Motivo o Causa Judicial *</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Ej: Orden judicial cautelar de alejamiento respecto al departamento 202..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" type="submit" isLoading={isSubmitting}>Crear Restricción</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
