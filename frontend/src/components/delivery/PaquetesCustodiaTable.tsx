import React, { useState } from 'react'
import {
  Package,
  PackageCheck,
  Search,
  Clock,
} from 'lucide-react'
import type { PaqueteDto } from '../../types/models'
import { useQuickActions } from '../../context/QuickActionContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EntregarPaqueteModal } from './EntregarPaqueteModal'

interface PaquetesCustodiaTableProps {
  paquetes: PaqueteDto[]
  onRefresh: () => void
  isLoading?: boolean
}

export const PaquetesCustodiaTable: React.FC<PaquetesCustodiaTableProps> = ({
  paquetes,
  onRefresh,
}) => {
  const { openPaqueteModal } = useQuickActions()
  const [filter, setFilter] = useState('')
  const [deliveringPaquete, setDeliveringPaquete] = useState<PaqueteDto | null>(null)

  const filteredPaquetes = paquetes.filter((p) => {
    const q = filter.toLowerCase()
    return (
      p.departamentoNumero.toLowerCase().includes(q) ||
      p.codigoUbicacion.toLowerCase().includes(q) ||
      p.empresaTransporte.toLowerCase().includes(q) ||
      (p.codigoSeguimiento && p.codigoSeguimiento.toLowerCase().includes(q))
    )
  })

  const formatFecha = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
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
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Encomiendas en Custodia (Conserjería)
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {paquetes.length} paquete(s) pendiente(s) de retiro por residentes
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: 8, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filtrar por depto o código..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: '#0a0f1e',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 10px 6px 28px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
                width: 200,
              }}
            />
          </div>

          <Button
            size="sm"
            variant="secondary"
            shortcut="F4"
            icon={<Package size={14} />}
            onClick={() => openPaqueteModal()}
          >
            + Recepcionar Paquete
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="dense-table">
          <thead>
            <tr>
              <th>Ubicación Física</th>
              <th>Depto Destino</th>
              <th>Empresa & Guía</th>
              <th>Detalle del Paquete</th>
              <th>Fecha Recepción</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredPaquetes.length > 0 ? (
              filteredPaquetes.map((p) => (
                <tr key={p.id}>
                  {/* Ubicación */}
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 12,
                        background: '#0d1526',
                        color: '#c084fc',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: 4,
                        padding: '3px 8px',
                      }}
                    >
                      {p.codigoUbicacion}
                    </span>
                  </td>

                  {/* Depto */}
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 13,
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      Depto #{p.departamentoNumero}
                    </span>
                  </td>

                  {/* Empresa y Seguimiento */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.empresaTransporte}</div>
                    {p.codigoSeguimiento && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Guía: {p.codigoSeguimiento}
                      </div>
                    )}
                  </td>

                  {/* Detalle */}
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {p.descripcion || 'Sin descripción'}
                    </div>
                    {p.notas && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Nota: {p.notas}
                      </div>
                    )}
                  </td>

                  {/* Recepción */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                        {formatFecha(p.fechaRecepcion)}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      Por: {p.recepcionadoPor}
                    </div>
                  </td>

                  {/* Estado */}
                  <td>
                    <Badge variant="RECIBIDO_EN_CONSERJERIA" />
                  </td>

                  {/* Acciones */}
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      size="sm"
                      variant="success"
                      icon={<PackageCheck size={14} />}
                      onClick={() => setDeliveringPaquete(p)}
                      title="Entregar paquete al residente"
                    >
                      Entregar a Residente
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <Package size={28} style={{ opacity: 0.35, marginBottom: 6 }} />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    No hay encomiendas en custodia actualmente
                  </div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    Presiona <kbd>F4</kbd> para registrar un paquete recibido
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deliver Modal */}
      <EntregarPaqueteModal
        paquete={deliveringPaquete}
        isOpen={Boolean(deliveringPaquete)}
        onClose={() => setDeliveringPaquete(null)}
        onSuccess={onRefresh}
      />
    </div>
  )
}
