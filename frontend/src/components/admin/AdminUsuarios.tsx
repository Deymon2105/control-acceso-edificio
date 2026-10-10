import React, { useState, useEffect } from 'react'
import { UserPlus, KeyRound } from 'lucide-react'
import { usuariosApi } from '../../api/endpoints'
import type { UsuarioDto } from '../../types/models'
import type { RolUsuario } from '../../types/enums'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'

export const AdminUsuarios: React.FC = () => {
  const { showSuccess, showError } = useToast()
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([])
  const [_isLoading, setIsLoading] = useState(false)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [passwordTargetUser, setPasswordTargetUser] = useState<UsuarioDto | null>(null)

  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [rol, setRol] = useState<RolUsuario>('CONSERJE')

  // Change password states
  const [passActual, setPassActual] = useState('')
  const [passNuevo, setPassNuevo] = useState('')

  const loadUsuarios = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await usuariosApi.listar()
      setUsuarios(data)
    } catch (err) {
      console.error(err)
      showError('Error al listar usuarios')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const data = await usuariosApi.listar()
        if (!ignore) {
          setUsuarios(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          showError('Error al listar usuarios')
          setIsLoading(false)
        }
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [showError])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password || !nombreCompleto.trim()) {
      showError('Todos los campos son requeridos')
      return
    }

    try {
      await usuariosApi.crear({
        username: username.trim(),
        password,
        nombreCompleto: nombreCompleto.trim(),
        rol,
      })
      showSuccess(`Usuario ${username} creado exitosamente`)
      setIsCreateOpen(false)
      setUsername('')
      setPassword('')
      setNombreCompleto('')
      loadUsuarios()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al crear usuario')
    }
  }

  const handleToggleEstado = async (u: UsuarioDto) => {
    try {
      await usuariosApi.cambiarEstado(u.id, !u.activo)
      showSuccess(`Usuario ${u.username} ${!u.activo ? 'activado' : 'desactivado'}`)
      loadUsuarios()
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordTargetUser || !passActual || !passNuevo) {
      showError('Todos los campos de contraseña son requeridos')
      return
    }

    try {
      await usuariosApi.cambiarPassword(passwordTargetUser.id, {
        passwordActual: passActual,
        nuevoPassword: passNuevo,
      })
      showSuccess(`Contraseña cambiada para ${passwordTargetUser.username}`)
      setPasswordTargetUser(null)
      setPassActual('')
      setPassNuevo('')
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Gestión de Personal y Cuentas de Conserjería</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Creación de credenciales, roles de conserje/administrador y claves de acceso
          </span>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<UserPlus size={15} />}
          onClick={() => setIsCreateOpen(true)}
        >
          + Nuevo Usuario
        </Button>
      </div>

      <div className="table-container">
        <table className="dense-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Rol en Sistema</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Fecha Creación</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {u.username}
                  </strong>
                </td>
                <td>{u.nombreCompleto}</td>
                <td>
                  <Badge variant={u.rol === 'ADMIN' ? 'ADMIN' : 'CONSERJE'} />
                </td>
                <td>
                  {u.activo ? (
                    <Badge variant="green" label="ACTIVO" />
                  ) : (
                    <Badge variant="gray" label="SUSPENDIDO" />
                  )}
                </td>
                <td>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-CL') : 'Sin accesos'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(u.fechaCreacion).toLocaleDateString('es-CL')}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<KeyRound size={13} />}
                      onClick={() => setPasswordTargetUser(u)}
                      title="Cambiar contraseña"
                    >
                      Clave
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggleEstado(u)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Nuevo Usuario del Sistema"
        subtitle="Asignar cuenta para conserje u operador de mesón"
        maxWidth={480}
      >
        <form onSubmit={handleCreateUser}>
          <Input
            label="Nombre Completo *"
            placeholder="Ej: Conserje Turno Tarde"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Nombre de Usuario (Login) *"
            placeholder="Ej: conserje_tarde"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Contraseña Inicial *"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">
              <span>Rol de Acceso *</span>
            </label>
            <select
              className="form-select"
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
            >
              <option value="CONSERJE">CONSERJE (Operador de mesón)</option>
              <option value="ADMIN">ADMIN (Administrador general)</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Crear Cuenta</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cambiar Clave */}
      <Modal
        isOpen={Boolean(passwordTargetUser)}
        onClose={() => setPasswordTargetUser(null)}
        title={`Cambiar Contraseña de ${passwordTargetUser?.username}`}
        subtitle="Actualización de credenciales de seguridad"
        maxWidth={440}
      >
        <form onSubmit={handleChangePassword}>
          <Input
            label="Contraseña Actual del Administrador *"
            type="password"
            value={passActual}
            onChange={(e) => setPassActual(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Nueva Contraseña *"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={passNuevo}
            onChange={(e) => setPassNuevo(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" onClick={() => setPasswordTargetUser(null)}>Cancelar</Button>
            <Button variant="primary" type="submit">Actualizar Clave</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
