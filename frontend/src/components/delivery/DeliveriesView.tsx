import React, { useState, useEffect } from 'react'
import { Truck, Package, History, RefreshCw } from 'lucide-react'
import { deliveriesApi, paquetesApi } from '../../api/endpoints'
import type { DeliveryPisoDto, PaqueteDto } from '../../types/models'
import { DeliveriesPisoTable } from './DeliveriesPisoTable'
import { PaquetesCustodiaTable } from './PaquetesCustodiaTable'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { StatCard } from '../ui/StatCard'

export const DeliveriesView: React.FC = () => {
  const [subTab, setSubTab] = useState<'piso' | 'paquetes' | 'historial'>('piso')
  const [deliveries, setDeliveries] = useState<DeliveryPisoDto[]>([])
  const [paquetes, setPaquetes] = useState<PaqueteDto[]>([])
  const [historicoDeliveries, setHistoricoDeliveries] = useState<DeliveryPisoDto[]>([])
  const [historicoPaquetes, setHistoricoPaquetes] = useState<PaqueteDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [dActivos, pCustodia] = await Promise.all([
        deliveriesApi.listarActivos(),
        paquetesApi.listarEnCustodia(),
      ])
      setDeliveries(dActivos)
      setPaquetes(pCustodia)

      if (subTab === 'historial') {
        const [dHist, pHist] = await Promise.all([
          deliveriesApi.listarHistorico(),
          paquetesApi.listarHistorico(),
        ])
        setHistoricoDeliveries(dHist)
        setHistoricoPaquetes(pHist)
      }
    } catch (err) {
      console.error('Error al cargar deliveries/paquetes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [subTab])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const [dActivos, pCustodia] = await Promise.all([
          deliveriesApi.listarActivos(),
          paquetesApi.listarEnCustodia(),
        ])
        if (!ignore) {
          setDeliveries(dActivos)
          setPaquetes(pCustodia)
        }

        if (subTab === 'historial') {
          const [dHist, pHist] = await Promise.all([
            deliveriesApi.listarHistorico(),
            paquetesApi.listarHistorico(),
          ])
          if (!ignore) {
            setHistoricoDeliveries(dHist)
            setHistoricoPaquetes(pHist)
          }
        }
        if (!ignore) setIsLoading(false)
      } catch (err) {
        if (!ignore) {
          console.error('Error al cargar deliveries/paquetes:', err)
          setIsLoading(false)
        }
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [subTab])

  // Count active warnings (> 15m)
  const deliveriesConAlerta = deliveries.filter((d) => {
    const start = new Date(d.horaIngreso).getTime()
    const now = new Date().getTime()
    return Math.floor((now - start) / 60000) > 15
  }).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        <StatCard
          title="Deliveries en Recepción"
          value={deliveries.length}
          subtitle="Repartidores esperando en mesón"
          icon={<Truck size={22} />}
          colorTheme="amber"
        />

        <StatCard
          title="Paquetes en Custodia"
          value={paquetes.length}
          subtitle="Pendientes de retiro"
          icon={<Package size={22} />}
          colorTheme="green"
        />
      </div>
      {/* Subtab selection & Refresh */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setSubTab('piso')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              background: subTab === 'piso' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: subTab === 'piso' ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${subTab === 'piso' ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Truck size={15} />
            Deliveries en Recepción
            <span
              style={{
                fontSize: 11,
                background: subTab === 'piso' ? 'rgba(255,255,255,0.2)' : '#0d1526',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              {deliveries.length}
            </span>
            {deliveriesConAlerta > 0 && (
              <span
                style={{
                  fontSize: 10,
                  background: '#f59e0b',
                  color: '#000',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 4,
                }}
              >
                {deliveriesConAlerta} alerta(s)
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('paquetes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              background: subTab === 'paquetes' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: subTab === 'paquetes' ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${subTab === 'paquetes' ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Package size={15} />
            Custodia de Paquetes
            <span
              style={{
                fontSize: 11,
                background: subTab === 'paquetes' ? 'rgba(255,255,255,0.2)' : '#0d1526',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              {paquetes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('historial')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              background: subTab === 'historial' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: subTab === 'historial' ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${subTab === 'historial' ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <History size={15} />
            Histórico de Entregas
          </button>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
          onClick={loadData}
        >
          Actualizar
        </Button>
      </div>

      {/* Main Subtab views */}
      {subTab === 'piso' && (
        <DeliveriesPisoTable deliveries={deliveries} onRefresh={loadData} isLoading={isLoading} />
      )}

      {subTab === 'paquetes' && (
        <PaquetesCustodiaTable paquetes={paquetes} onRefresh={loadData} isLoading={isLoading} />
      )}

      {subTab === 'historial' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Histórico Deliveries */}
          <div className="table-container">
            <div style={{ padding: '12px 16px', background: '#111a2e', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>
              Historial Deliveries Despachados
            </div>
            <table className="dense-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Repartidor</th>
                  <th>Depto</th>
                  <th>Ingreso</th>
                  <th>Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historicoDeliveries.slice(0, 10).map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.empresa}</strong></td>
                    <td>{d.nombreRepartidor}</td>
                    <td>Depto {d.departamentoNumero}</td>
                    <td>{new Date(d.horaIngreso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{d.horaSalida ? new Date(d.horaSalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td><Badge variant={d.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Histórico Paquetes */}
          <div className="table-container">
            <div style={{ padding: '12px 16px', background: '#111a2e', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>
              Historial Encomiendas Entregadas
            </div>
            <table className="dense-table">
              <thead>
                <tr>
                  <th>Ubicación</th>
                  <th>Depto</th>
                  <th>Empresa</th>
                  <th>Retirado Por</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historicoPaquetes.slice(0, 10).map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.codigoUbicacion}</code></td>
                    <td>Depto {p.departamentoNumero}</td>
                    <td>{p.empresaTransporte}</td>
                    <td>{p.retiradoPor || 'No registrado'}</td>
                    <td><Badge variant={p.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
