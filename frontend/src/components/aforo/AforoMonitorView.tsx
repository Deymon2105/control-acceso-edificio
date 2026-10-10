import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  FileSpreadsheet,
  Printer,
  CheckSquare,
  Square,
  PhoneCall,
  RefreshCw,
  Users,
} from 'lucide-react'
import { aforoApi } from '../../api/endpoints'
import type { ResumenAforoDto, PersonaEnEdificioDto } from '../../types/models'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export const AforoMonitorView: React.FC = () => {
  const { showSuccess, showError } = useToast()

  const [resumen, setResumen] = useState<ResumenAforoDto | null>(null)
  const [personas, setPersonas] = useState<PersonaEnEdificioDto[]>([])
  const [evacuadosIds, setEvacuadosIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const loadAforoData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [resumenData, personasData] = await Promise.all([
        aforoApi.obtenerResumen(),
        aforoApi.obtenerPersonas(),
      ])
      setResumen(resumenData)
      setPersonas(personasData)
    } catch (err) {
      console.error('Error al cargar aforo:', err)
      showError('Error al sincronizar datos de aforo en tiempo real')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const [resumenData, personasData] = await Promise.all([
          aforoApi.obtenerResumen(),
          aforoApi.obtenerPersonas(),
        ])
        if (!ignore) {
          setResumen(resumenData)
          setPersonas(personasData)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error al cargar aforo:', err)
          showError('Error al sincronizar datos de aforo en tiempo real')
          setIsLoading(false)
        }
      }
    }
    void fetchData()
    const interval = setInterval(fetchData, 8000)
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [showError])

  // Toggle person verified in safe zone
  const toggleEvacuado = (id: number) => {
    setEvacuadosIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const markAllEvacuated = () => {
    setEvacuadosIds(new Set(personas.map((p) => p.id)))
    showSuccess('Todas las personas marcadas como verificadas en Zona Segura')
  }

  // Handle CSV Download
  const handleDownloadCsv = async () => {
    setIsDownloading(true)
    try {
      const csvContent = await aforoApi.descargarManifiestoCsv()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `manifiesto-aforo-evacuacion-${new Date().toISOString().slice(0, 19)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showSuccess('Manifiesto CSV de evacuación descargado exitosamente')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al exportar CSV'
      showError(msg)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const totalEvacuados = evacuadosIds.size
  const totalPersonas = personas.length
  const pendientes = Math.max(0, totalPersonas - totalEvacuados)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Critical Emergency Protocol Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(127, 29, 29, 0.3) 100%)',
          border: '2px solid var(--status-danger)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: 'var(--shadow-glow-red)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
              animation: 'beacon 1.5s infinite',
            }}
          >
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fee2e2', margin: 0, letterSpacing: '0.03em' }}>
                MONITOR DE AFORO EN VIVO • PROTOCOLO DE EVACUACIÓN
              </h2>
              <span
                style={{
                  fontSize: 10,
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                VISTA TÁCTICA DE SINIESTRO
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#fecaca', marginTop: 3 }}>
              Censo forense e instantáneo para Bomberos, Carabineros y Prevención de Riesgos.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="no-print">
          <Button
            size="sm"
            variant="cyan"
            icon={<FileSpreadsheet size={15} />}
            onClick={handleDownloadCsv}
            disabled={isDownloading}
            isLoading={isDownloading}
          >
            Exportar CSV Forense
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={<Printer size={15} />}
            onClick={handlePrint}
          >
            Imprimir Manifiesto Táctico
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            onClick={loadAforoData}
          >
            Sincronizar
          </Button>
        </div>
      </div>

      {/* KPI Emergency Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {/* Total Personas Dentro */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '16px',
            borderLeft: '4px solid var(--status-danger)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Personas Externas en Torre
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ef4444', margin: '4px 0' }}>
            {resumen?.totalPersonasEnEdificio ?? totalPersonas}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Visitas + Deliveries activos en pisos
          </div>
        </div>

        {/* Visitas Dentro */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            borderLeft: '4px solid var(--accent-cyan)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Visitas Autorizadas a Piso
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', margin: '4px 0' }}>
            {resumen?.totalVisitas ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            En departamentos particulares
          </div>
        </div>

        {/* Deliveries Dentro */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            borderLeft: '4px solid var(--status-warning)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Deliveries en Tránsito
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-warning)', margin: '4px 0' }}>
            {resumen?.totalDeliveries ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Repartidores temporales
          </div>
        </div>

        {/* Check de Zona Segura */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            borderLeft: '4px solid var(--status-success)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Verificados en Zona Segura
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', margin: '4px 0' }}>
            {totalEvacuados} / {totalPersonas}
          </div>
          <div style={{ fontSize: 11, color: pendientes > 0 ? '#fca5a5' : 'var(--status-success)' }}>
            {pendientes > 0 ? `${pendientes} persona(s) por verificar` : 'Todos en zona segura'}
          </div>
        </div>
      </div>

      {/* Floor Breakdown Section */}
      {resumen?.desglosePisos && resumen.desglosePisos.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
            Desglose Táctico por Pisos y Sectores
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {resumen.desglosePisos.map((p) => (
              <div
                key={p.piso}
                style={{
                  background: '#0d1526',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {p.sector || (p.piso === 0 ? 'Planta Baja' : `Piso ${p.piso}`)}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: 15,
                      color: p.cantidadPersonas > 0 ? '#f87171' : 'var(--text-muted)',
                    }}
                  >
                    {p.cantidadPersonas} pers.
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  {p.personas?.length || p.cantidadPersonas} persona(s) registrada(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Evacuation Manifest Table */}
      <div
        className="printable-area"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#111a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
          }}
        >
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase' }}>
              Manifiesto Maestro de Evacuación Nominal
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Ubicación exacta, datos de identidad y canal de citofonía directa por persona
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            icon={<CheckSquare size={14} />}
            onClick={markAllEvacuated}
            className="no-print"
          >
            Marcar Todos como Evacuados
          </Button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="dense-table">
            <thead>
              <tr>
                <th style={{ width: 40 }} className="no-print">Check</th>
                <th>Estado Evacuación</th>
                <th>Tipo</th>
                <th>Nombre Completo</th>
                <th>RUT / Identificación</th>
                <th>Piso / Sector</th>
                <th>Depto Destino</th>
                <th>Anexo Citófono</th>
                <th>Hora Ingreso</th>
                <th>Permanencia</th>
              </tr>
            </thead>
            <tbody>
              {personas.length > 0 ? (
                personas.map((persona) => {
                  const isSafe = evacuadosIds.has(persona.id)

                  return (
                    <tr
                      key={`${persona.tipo}-${persona.id}`}
                      style={{
                        backgroundColor: isSafe ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.05)',
                      }}
                    >
                      {/* Checkbox */}
                      <td className="no-print">
                        <button
                          type="button"
                          onClick={() => toggleEvacuado(persona.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isSafe ? 'var(--status-success)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 2,
                          }}
                          title={isSafe ? 'Desmarcar' : 'Confirmar en Zona Segura'}
                        >
                          {isSafe ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </td>

                      {/* Estado Evacuación */}
                      <td>
                        {isSafe ? (
                          <Badge variant="green" label="EN ZONA SEGURA" />
                        ) : (
                          <Badge variant="red" label="PENDIENTE EN TORRE" pulse={true} />
                        )}
                      </td>

                      {/* Tipo */}
                      <td>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: persona.tipo === 'VISITA' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: persona.tipo === 'VISITA' ? 'var(--accent-cyan)' : 'var(--status-warning)',
                          }}
                        >
                          {persona.tipo}
                        </span>
                      </td>

                      {/* Nombre */}
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{persona.nombreCompleto}</strong>
                      </td>

                      {/* RUT */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {persona.rut}
                        </span>
                      </td>

                      {/* Piso */}
                      <td>
                        <strong style={{ color: '#f87171' }}>Piso {persona.piso}</strong>
                        {persona.torre && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> ({persona.torre})</span>}
                      </td>

                      {/* Depto */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--accent-cyan)',
                          }}
                        >
                          Depto #{persona.departamentoNumero}
                        </span>
                      </td>

                      {/* Anexo Citófono */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                          <PhoneCall size={12} color="var(--accent-cyan)" />
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            #{persona.anexoCitofono || persona.departamentoNumero}
                          </span>
                        </div>
                      </td>

                      {/* Hora Ingreso */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                          {new Date(persona.horaIngreso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Permanencia */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {persona.minutosPermanencia} min
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      No hay personas externas dentro del edificio en este momento
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
