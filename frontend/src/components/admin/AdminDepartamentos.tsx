import React, { useState, useEffect } from 'react'
import { Plus, Edit2, UserPlus, Trash2 } from 'lucide-react'
import { directorioApi } from '../../api/endpoints'
import type { DepartamentoDto } from '../../types/models'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

export const AdminDepartamentos: React.FC = () => {
  const { showSuccess, showError } = useToast()
  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([])
  const [_isLoading, setIsLoading] = useState(false)

  // Modals state
  const [isCreateDeptoOpen, setIsCreateDeptoOpen] = useState(false)
  const [editingDepto, setEditingDepto] = useState<DepartamentoDto | null>(null)
  const [addingResidentDepto, setAddingResidentDepto] = useState<DepartamentoDto | null>(null)

  // Create/Edit form states
  const [numero, setNumero] = useState('')
  const [piso, setPiso] = useState(1)
  const [torre, setTorre] = useState('Torre Central')
  const [anexoCitofono, setAnexoCitofono] = useState('')
  const [telefonoFijo, setTelefonoFijo] = useState('')
  const [notasOperativas, setNotasOperativas] = useState('')
  const [advertenciaSeguridad, setAdvertenciaSeguridad] = useState('')

  // Add resident form state
  const [resNombre, setResNombre] = useState('')
  const [resApellido, setResApellido] = useState('')
  const [resRut, setResRut] = useState('')
  const [resTelefono, setResTelefono] = useState('')
  const [resEmail, setResEmail] = useState('')
  const [resEsTitular, setResEsTitular] = useState(false)

  const loadDeptos = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await directorioApi.listarTodos()
      setDepartamentos(data)
    } catch (err) {
      console.error(err)
      showError('Error al listar departamentos')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const data = await directorioApi.listarTodos()
        if (!ignore) {
          setDepartamentos(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          showError('Error al listar departamentos')
          setIsLoading(false)
        }
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [showError])

  const handleCreateDepto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numero.trim() || !piso) {
      showError('El número y piso son obligatorios')
      return
    }

    try {
      await directorioApi.crear({
        numero: numero.trim(),
        piso: Number(piso),
        torre: torre.trim() || undefined,
        anexoCitofono: anexoCitofono.trim() || undefined,
        telefonoFijo: telefonoFijo.trim() || undefined,
        notasOperativas: notasOperativas.trim() || undefined,
        advertenciaSeguridad: advertenciaSeguridad.trim() || undefined,
      })
      showSuccess(`Departamento ${numero} creado con éxito`)
      setIsCreateDeptoOpen(false)
      loadDeptos()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al crear depto')
    }
  }

  const handleUpdateDepto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepto) return

    try {
      await directorioApi.actualizar(editingDepto.id, {
        piso: Number(piso),
        torre: torre.trim() || undefined,
        anexoCitofono: anexoCitofono.trim() || undefined,
        telefonoFijo: telefonoFijo.trim() || undefined,
        notasOperativas: notasOperativas.trim() || undefined,
        advertenciaSeguridad: advertenciaSeguridad.trim() || undefined,
        activo: true,
      })
      showSuccess(`Departamento ${editingDepto.numero} actualizado`)
      setEditingDepto(null)
      loadDeptos()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al actualizar depto')
    }
  }

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addingResidentDepto || !resNombre.trim() || !resApellido.trim() || !resTelefono.trim()) {
      showError('Nombre, apellido y teléfono son obligatorios')
      return
    }

    try {
      await directorioApi.agregarResidente({
        departamentoId: addingResidentDepto.id,
        nombre: resNombre.trim(),
        apellido: resApellido.trim(),
        rut: resRut.trim() || undefined,
        telefono: resTelefono.trim(),
        email: resEmail.trim() || undefined,
        esTitular: resEsTitular,
      })
      showSuccess(`Residente ${resNombre} agregado a Depto ${addingResidentDepto.numero}`)
      setAddingResidentDepto(null)
      setResNombre('')
      setResApellido('')
      setResRut('')
      setResTelefono('')
      setResEmail('')
      loadDeptos()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al asociar residente')
    }
  }

  const handleDeactivateResident = async (residenteId: number, nombre: string) => {
    if (!confirm(`¿Desactivar al residente ${nombre}?`)) return
    try {
      await directorioApi.desactivarResidente(residenteId)
      showSuccess(`Residente ${nombre} desactivado`)
      loadDeptos()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al desactivar residente')
    }
  }

  const openEditModal = (d: DepartamentoDto) => {
    setEditingDepto(d)
    setPiso(d.piso)
    setTorre(d.torre || 'Torre Central')
    setAnexoCitofono(d.anexoCitofono || '')
    setTelefonoFijo(d.telefonoFijo || '')
    setNotasOperativas(d.notasOperativas || '')
    setAdvertenciaSeguridad(d.advertenciaSeguridad || '')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Gestión de Departamentos y Residentes</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Administra unidades habitacionales, números de citófono y habitantes registrados
          </span>
        </div>
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => {
            setNumero('')
            setPiso(1)
            setTorre('Torre Central')
            setAnexoCitofono('')
            setTelefonoFijo('')
            setNotasOperativas('')
            setAdvertenciaSeguridad('')
            setIsCreateDeptoOpen(true)
          }}
        >
          + Nuevo Departamento
        </Button>
      </div>

      {/* Grid of Depto cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {departamentos.map((d) => (
          <div
            key={d.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    DEPTO {d.numero}
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Piso {d.piso} • {d.torre || 'Torre Central'} • Anexo: #{d.anexoCitofono || d.numero}
                  </div>
                </div>
                <Button size="sm" variant="ghost" icon={<Edit2 size={13} />} onClick={() => openEditModal(d)}>
                  Editar
                </Button>
              </div>

              {/* Security Warning note if any */}
              {d.advertenciaSeguridad && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderLeft: '3px solid var(--status-danger)',
                    padding: '6px 10px',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#fca5a5',
                    marginBottom: 8,
                  }}
                >
                  <strong>Seguridad:</strong> {d.advertenciaSeguridad}
                </div>
              )}

              {/* Operational note if any */}
              {d.notasOperativas && (
                <div
                  style={{
                    background: 'rgba(37, 99, 235, 0.08)',
                    borderLeft: '3px solid var(--accent-blue)',
                    padding: '6px 10px',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#93c5fd',
                    marginBottom: 8,
                  }}
                >
                  <strong>Nota:</strong> {d.notasOperativas}
                </div>
              )}

              {/* Resident list */}
              <div style={{ marginTop: 8, borderTop: '1px solid rgba(30, 58, 95, 0.4)', paddingTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Residentes ({d.residentes?.length || 0}):
                </div>
                {d.residentes && d.residentes.length > 0 ? (
                  d.residentes.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        padding: '3px 0',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div>
                        <strong>{r.nombreCompleto}</strong> {r.esTitular && <span style={{ color: 'var(--accent-cyan)', fontSize: 10 }}>[TITULAR]</span>}
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.telefono}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeactivateResident(r.id, r.nombreCompleto)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: 2 }}
                        title="Desactivar habitante"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Sin residentes registrados
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid rgba(30, 58, 95, 0.4)' }}>
              <Button
                size="sm"
                variant="secondary"
                style={{ width: '100%' }}
                icon={<UserPlus size={13} />}
                onClick={() => setAddingResidentDepto(d)}
              >
                + Asociar Residente
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Depto */}
      <Modal
        isOpen={isCreateDeptoOpen}
        onClose={() => setIsCreateDeptoOpen(false)}
        title="Crear Nuevo Departamento"
        subtitle="Registra una unidad con anexo citófono y directivas"
        maxWidth={500}
      >
        <form onSubmit={handleCreateDepto}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Número Depto *" placeholder="Ej: 401" value={numero} onChange={(e) => setNumero(e.target.value)} required autoFocus />
            <Input label="Piso *" type="number" value={piso} onChange={(e) => setPiso(Number(e.target.value))} required />
            <Input label="Torre" value={torre} onChange={(e) => setTorre(e.target.value)} />
            <Input label="Anexo Citófono" placeholder="Ej: 401" value={anexoCitofono} onChange={(e) => setAnexoCitofono(e.target.value)} />
            <Input label="Teléfono Fijo" placeholder="Ej: 222334455" value={telefonoFijo} onChange={(e) => setTelefonoFijo(e.target.value)} />
          </div>
          <Input label="Notas Operativas" placeholder="Ej: Autoriza delivery a puerta, no llamar de noche..." value={notasOperativas} onChange={(e) => setNotasOperativas(e.target.value)} />
          <Input label="Advertencia de Seguridad" placeholder="Ej: Procedimiento judicial o instrucción de resguardo..." value={advertenciaSeguridad} onChange={(e) => setAdvertenciaSeguridad(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Button variant="ghost" onClick={() => setIsCreateDeptoOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar Departamento</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Depto */}
      <Modal
        isOpen={Boolean(editingDepto)}
        onClose={() => setEditingDepto(null)}
        title={`Editar Depto ${editingDepto?.numero}`}
        subtitle="Actualiza notas operativas y advertencias"
        maxWidth={500}
      >
        <form onSubmit={handleUpdateDepto}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Piso *" type="number" value={piso} onChange={(e) => setPiso(Number(e.target.value))} required />
            <Input label="Torre" value={torre} onChange={(e) => setTorre(e.target.value)} />
            <Input label="Anexo Citófono" value={anexoCitofono} onChange={(e) => setAnexoCitofono(e.target.value)} />
            <Input label="Teléfono Fijo" value={telefonoFijo} onChange={(e) => setTelefonoFijo(e.target.value)} />
          </div>
          <Input label="Notas Operativas" value={notasOperativas} onChange={(e) => setNotasOperativas(e.target.value)} />
          <Input label="Advertencia de Seguridad" value={advertenciaSeguridad} onChange={(e) => setAdvertenciaSeguridad(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Button variant="ghost" onClick={() => setEditingDepto(null)}>Cancelar</Button>
            <Button variant="primary" type="submit">Actualizar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Asociar Residente */}
      <Modal
        isOpen={Boolean(addingResidentDepto)}
        onClose={() => setAddingResidentDepto(null)}
        title={`Asociar Residente a Depto ${addingResidentDepto?.numero}`}
        subtitle="Agrega habitante o titular para búsqueda rápida"
        maxWidth={500}
      >
        <form onSubmit={handleAddResident}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Nombre *" placeholder="Ej: Marcelo" value={resNombre} onChange={(e) => setResNombre(e.target.value)} required autoFocus />
            <Input label="Apellido *" placeholder="Ej: Rios" value={resApellido} onChange={(e) => setResApellido(e.target.value)} required />
            <Input label="RUT" placeholder="Ej: 14.567.890-1" value={resRut} onChange={(e) => setResRut(e.target.value)} />
            <Input label="Teléfono Móvil *" placeholder="Ej: +56 9 8899 0011" value={resTelefono} onChange={(e) => setResTelefono(e.target.value)} required />
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="Email" placeholder="ejemplo@correo.cl" value={resEmail} onChange={(e) => setResEmail(e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={resEsTitular} onChange={(e) => setResEsTitular(e.target.checked)} />
            <span style={{ fontSize: 12 }}>Es titular principal del departamento</span>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Button variant="ghost" onClick={() => setAddingResidentDepto(null)}>Cancelar</Button>
            <Button variant="primary" type="submit">Asociar Residente</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
