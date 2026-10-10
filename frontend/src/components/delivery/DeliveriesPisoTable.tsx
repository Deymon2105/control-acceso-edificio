import React, { useState, useEffect } from 'react'
import {
  Truck,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { deliveriesApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { useQuickActions } from '../../context/QuickActionContext'
import type { DeliveryPisoDto } from '../../types/models'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface DeliveriesPisoTableProps {
  deliveries: DeliveryPisoDto[]
  onRefresh: () => void
  isLoading?: boolean
}

export const DeliveriesPisoTable: React.FC<DeliveriesPisoTableProps> = ({
  deliveries,
  onRefresh,
}) => {
  const { showSuccess, showError } = useToast()
  const { openDeliveryModal } = useQuickActions()

  const [_tick, setTick] = useState(0)
  const [processingId, setProcessingId] = useState<number | null>(null)

  // Re-render every 10 seconds to update live minutes accurately
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(timer)
  }, [])

  const handleFinalizar = async (delivery: DeliveryPisoDto) => {
    setProcessingId(delivery.id)
    try {
      await deliveriesApi.finalizar(delivery.id)
      showSuccess(`Salida de repartidor ${delivery.nombreRepartidor} (${delivery.empresa}) registrada`)
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al finalizar delivery'
      showError(msg)
    } finally {
      setProcessingId(null)
    }
  }

  // Calculate live elapsed minutes
  const getElapsedMinutes = (horaIngreso: string) => {
    const start = new Date(horaIngreso).getTime()
    const now = new Date().getTime()
    return Math.max(0, Math.floor((now - start) / 60000))
  }

  const formatHora = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: '#111a2e',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'rgba(14, 165, 233, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Truck size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Deliveries en Recepción / Mesón
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {deliveries.length} repartidor(es) en mesón esperando retiro
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          shortcut="F3"
          icon={<Truck size={14} />}
          onClick={() => openDeliveryModal()}
        >
          + Nuevo Delivery
        </Button>
      </div>

      {/* Table */}
      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="dense-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Repartidor</th>
              <th>Destino</th>
              <th>Hora Llegada</th>
              <th>Tiempo Espera</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length > 0 ? (
              deliveries.map((delivery) => {
                const mins = getElapsedMinutes(delivery.horaIngreso)
                const isExceeded = mins > 15
                const isProcessing = processingId === delivery.id

                return (
                  <tr
                    key={delivery.id}
                    className={isExceeded ? 'row-warning' : ''}
                    style={{
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {/* Empresa */}
                    <td>
                      <span
                        style={{
                          background: 'rgba(37, 99, 235, 0.15)',
                          color: '#93c5fd',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                        }}
                      >
                        {delivery.empresa}
                      </span>
                    </td>

                    {/* Repartidor */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {delivery.nombreRepartidor}
                      </div>
                      {delivery.rutRepartidor && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {delivery.rutRepartidor}
                        </div>
                      )}
                      {delivery.notas && (
                        <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 }}>
                          {delivery.notas}
                        </div>
                      )}
                    </td>

                    {/* Depto / Piso */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: 13,
                            color: 'var(--accent-cyan)',
                          }}
                        >
                          #{delivery.departamentoNumero}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Piso {delivery.piso}
                        </span>
                      </div>
                    </td>

                    {/* Hora Ingreso */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                        <Clock size={13} color="var(--text-muted)" />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                          {formatHora(delivery.horaIngreso)}
                        </span>
                      </div>
                    </td>

                    {/* Permanencia */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {mins} min
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td>
                      <Badge variant="amber" label="EN MESÓN" pulse={mins > 10} />
                    </td>

                    {/* Acciones */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<CheckCircle2 size={13} />}
                          onClick={() => handleFinalizar(delivery)}
                          disabled={isProcessing}
                          title="Marcar salida del repartidor / entrega concretada"
                        >
                          Marcar Salida / Entregado
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <Truck size={28} style={{ opacity: 0.35, marginBottom: 6 }} />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    No hay deliveries en espera en recepción
                  </div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    Presiona <kbd>F3</kbd> para registrar la llegada de un repartidor
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
