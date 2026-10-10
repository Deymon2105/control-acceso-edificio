import React, { useState, useMemo } from 'react'
import {
  useLegacyTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
} from '@tanstack/react-table/legacy'
import { flexRender } from '@tanstack/react-table'
import {
  Check,
  X,
  LogOut,
  Clock,
  Search,
  UserCheck,
  User,
} from 'lucide-react'
import { visitasApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import { useQuickActions } from '../../context/QuickActionContext'
import type { VisitaDto } from '../../types/models'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { VisitaRejectModal } from './VisitaRejectModal'

interface VisitasTableProps {
  visitas: VisitaDto[]
  onRefresh: () => void
  isLoading?: boolean
}

export const VisitasTable: React.FC<VisitasTableProps> = ({ visitas, onRefresh, isLoading: _isLoading }) => {
  const { showSuccess, showError } = useToast()
  const { openVisitaModal } = useQuickActions()

  const [globalFilter, setGlobalFilter] = useState('')
  const [rejectingVisita, setRejectingVisita] = useState<VisitaDto | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)

  // Handlers
  const handleAutorizar = React.useCallback(async (visita: VisitaDto) => {
    setProcessingId(visita.id)
    try {
      await visitasApi.autorizar(visita.id)
      showSuccess(`Visita de ${visita.nombreCompleto} ha sido autorizada a piso ${visita.piso}`)
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al autorizar visita'
      showError(msg)
    } finally {
      setProcessingId(null)
    }
  }, [onRefresh, showSuccess, showError])

  const handleFinalizar = React.useCallback(async (visita: VisitaDto) => {
    setProcessingId(visita.id)
    try {
      await visitasApi.finalizar(visita.id)
      showSuccess(`Salida registrada para ${visita.nombreCompleto} (Depto ${visita.departamentoNumero})`)
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar salida'
      showError(msg)
    } finally {
      setProcessingId(null)
    }
  }, [onRefresh, showSuccess, showError])

  const formatHora = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  }

  const columns = useMemo<LegacyColumnDef<VisitaDto>[]>(
    () => [
      {
        accessorKey: 'rut',
        header: 'RUT / ID',
        cell: (info) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>
            {String(info.getValue() || '')}
          </span>
        ),
      },
      {
        accessorKey: 'nombreCompleto',
        header: 'Visitante',
        cell: (info) => {
          const row = info.row.original
          return (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{String(info.getValue() || '')}</div>
              {row.telefono && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.telefono}</div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'departamentoNumero',
        header: 'Depto / Piso',
        cell: (info) => {
          const row = info.row.original
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                #{row.departamentoNumero}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Piso {row.piso}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: (info) => {
          const estado = info.row.original.estado
          return <Badge variant={estado} />
        },
      },
      {
        accessorKey: 'checkInAt',
        header: 'Ingreso',
        cell: (info) => {
          const row = info.row.original
          const timeStr = row.checkInAt ? formatHora(row.checkInAt) : formatHora(row.fechaCreacion)
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
              <Clock size={12} color="var(--text-muted)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{timeStr}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'minutosPermanencia',
        header: 'Permanencia',
        cell: (info) => {
          const row = info.row.original
          if (row.estado === 'EN_ESPERA') {
            return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>En mesón</span>
          }
          const mins = row.minutosPermanencia ?? 0
          return (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
                color: mins > 120 ? 'var(--status-warning)' : 'var(--text-secondary)',
              }}
            >
              {mins} min
            </span>
          )
        },
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const visita = info.row.original
          const isProcessing = processingId === visita.id

          if (visita.estado === 'EN_ESPERA') {
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Button
                  size="sm"
                  variant="success"
                  icon={<Check size={13} />}
                  onClick={() => handleAutorizar(visita)}
                  disabled={isProcessing}
                  title="Autorizar ingreso a piso"
                >
                  Autorizar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<X size={13} />}
                  onClick={() => setRejectingVisita(visita)}
                  disabled={isProcessing}
                  title="Rechazar visita"
                >
                  Rechazar
                </Button>
              </div>
            )
          }

          if (visita.estado === 'AUTORIZADO') {
            return (
              <Button
                size="sm"
                variant="secondary"
                icon={<LogOut size={12} />}
                onClick={() => handleFinalizar(visita)}
                disabled={isProcessing}
                title="Registrar salida del edificio"
              >
                Marcar Salida
              </Button>
            )
          }

          return null
        },
      },
    ],
    [processingId, handleAutorizar, handleFinalizar]
  )

  const table = useLegacyTable<VisitaDto>({
    data: visitas,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="ops-panel">
      {/* Table Header Bar */}
      <div className="ops-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCheck size={16} color="var(--text-secondary)" />
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
              Visitas Activas en Edificio
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 8 }}>
              ({visitas.length})
            </span>
          </div>
        </div>

        {/* Filter input & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: 8, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar RUT, nombre o depto..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="form-input"
              style={{
                padding: '5px 8px 5px 26px',
                fontSize: '12px',
                width: 220,
              }}
            />
          </div>

          <Button
            size="sm"
            variant="primary"
            shortcut="F2"
            onClick={() => openVisitaModal()}
          >
            + Nueva Visita
          </Button>
        </div>
      </div>

      {/* Table Body */}
      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="dense-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const visita = row.original
                const isWaiting = visita.estado === 'EN_ESPERA'
                return (
                  <tr
                    key={row.id}
                    style={{
                      backgroundColor: isWaiting ? 'rgba(56, 189, 248, 0.03)' : undefined,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                  <User size={24} style={{ opacity: 0.35, marginBottom: 6, display: 'inline-block' }} />
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    No hay visitas activas en este momento
                  </div>
                  <div style={{ fontSize: '11px', marginTop: 4 }}>
                    Presiona <kbd>F2</kbd> o haz clic en "+ Nueva Visita" para registrar un ingreso
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      <VisitaRejectModal
        visita={rejectingVisita}
        isOpen={Boolean(rejectingVisita)}
        onClose={() => setRejectingVisita(null)}
        onSuccess={onRefresh}
      />
    </div>
  )
}
