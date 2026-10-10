import React, { useState, useEffect } from 'react'
import { FileText, RefreshCw, Download } from 'lucide-react'
import { visitasApi, directorioApi } from '../../api/endpoints'
import type { VisitaDto, DepartamentoDto } from '../../types/models'
import type { EstadoVisita } from '../../types/enums'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export const AdminAuditoria: React.FC = () => {
  const { showSuccess, showError } = useToast()
  const [visitas, setVisitas] = useState<VisitaDto[]>([])
  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [deptoFilter, setDeptoFilter] = useState<number | undefined>(undefined)
  const [estadoFilter, setEstadoFilter] = useState<EstadoVisita | undefined>(undefined)
  const [desdeFilter, setDesdeFilter] = useState<string>('')
  const [hastaFilter, setHastaFilter] = useState<string>('')

  const loadHistorico = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [vData, dData] = await Promise.all([
        visitasApi.listarHistorico({
          departamentoId: deptoFilter,
          estado: estadoFilter,
          desde: desdeFilter ? new Date(desdeFilter).toISOString() : undefined,
          hasta: hastaFilter ? new Date(hastaFilter).toISOString() : undefined,
        }),
        directorioApi.listarTodos(),
      ])
      setVisitas(vData)
      setDepartamentos(dData)
    } catch (err) {
      console.error(err)
      showError('Error al cargar reporte de auditoría')
    } finally {
      setIsLoading(false)
    }
  }, [deptoFilter, estadoFilter, desdeFilter, hastaFilter, showError])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const [vData, dData] = await Promise.all([
          visitasApi.listarHistorico({
            departamentoId: deptoFilter,
            estado: estadoFilter,
            desde: desdeFilter ? new Date(desdeFilter).toISOString() : undefined,
            hasta: hastaFilter ? new Date(hastaFilter).toISOString() : undefined,
          }),
          directorioApi.listarTodos(),
        ])
        if (!ignore) {
          setVisitas(vData)
          setDepartamentos(dData)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          showError('Error al cargar reporte de auditoría')
          setIsLoading(false)
        }
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [deptoFilter, estadoFilter, desdeFilter, hastaFilter, showError])

  const exportAuditCsv = () => {
    if (visitas.length === 0) {
      showError('No hay datos para exportar')
      return
    }

    const headers = 'ID,RUT,Visitante,Telefono,Depto,Piso,Estado,Ingreso,Salida,Minutos,RegistradoPor,Observaciones\n'
    const rows = visitas
      .map(
        (v) =>
          `"${v.id}","${v.rut}","${v.nombreCompleto}","${v.telefono || ''}","${v.departamentoNumero}","${v.piso}","${v.estado}","${v.checkInAt || ''}","${v.checkOutAt || ''}","${v.minutosPermanencia || ''}","${v.registradoPor}","${(v.observaciones || '').replace(/"/g, '""')}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `auditoria-visitas-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showSuccess('Auditoría exportada a CSV exitosamente')
  }

  const formatFecha = (dStr: string | null) => {
    if (!dStr) return '-'
    const d = new Date(dStr)
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header and Filter Controls */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Reportes de Auditoría y Trazabilidad Histórica</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {visitas.length} registros encontrados bajo los criterios especificados
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              variant="cyan"
              icon={<Download size={14} />}
              onClick={exportAuditCsv}
            >
              Exportar CSV
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
              onClick={loadHistorico}
            >
              Filtrar
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {/* Depto selector */}
          <select
            className="form-select"
            value={deptoFilter || ''}
            onChange={(e) => setDeptoFilter(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Todos los Departamentos</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                Depto {d.numero} (Piso {d.piso})
              </option>
            ))}
          </select>

          {/* Estado selector */}
          <select
            className="form-select"
            value={estadoFilter || ''}
            onChange={(e) => setEstadoFilter(e.target.value ? (e.target.value as EstadoVisita) : undefined)}
          >
            <option value="">Todos los Estados</option>
            <option value="AUTORIZADO">AUTORIZADO</option>
            <option value="EN_ESPERA">EN_ESPERA</option>
            <option value="FINALIZADO">FINALIZADO</option>
            <option value="RECHAZADO">RECHAZADO</option>
          </select>

          {/* Fecha desde */}
          <input
            type="date"
            className="form-input"
            value={desdeFilter}
            onChange={(e) => setDesdeFilter(e.target.value)}
            title="Desde fecha"
          />

          {/* Fecha hasta */}
          <input
            type="date"
            className="form-input"
            value={hastaFilter}
            onChange={(e) => setHastaFilter(e.target.value)}
            title="Hasta fecha"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="dense-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>RUT</th>
              <th>Visitante</th>
              <th>Depto</th>
              <th>Estado</th>
              <th>Ingreso</th>
              <th>Salida</th>
              <th>Permanencia</th>
              <th>Registrado Por</th>
              <th>Observaciones / Motivo</th>
            </tr>
          </thead>
          <tbody>
            {visitas.length > 0 ? (
              visitas.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{v.id}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{v.rut}</span>
                  </td>
                  <td>
                    <strong>{v.nombreCompleto}</strong>
                    {v.telefono && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.telefono}</div>}
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      Depto {v.departamentoNumero}
                    </span>
                  </td>
                  <td>
                    <Badge variant={v.estado} />
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{formatFecha(v.checkInAt)}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{formatFecha(v.checkOutAt)}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {v.minutosPermanencia !== null ? `${v.minutosPermanencia} min` : '-'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.registradoPor}</span>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {v.motivoRechazo ? (
                        <span style={{ color: 'var(--status-danger)' }}>Rechazo: {v.motivoRechazo}</span>
                      ) : (
                        v.observaciones || '-'
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                  <FileText size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div>No hay registros que coincidan con los filtros de auditoría</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
