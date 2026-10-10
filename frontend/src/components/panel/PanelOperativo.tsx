import React, { useState, useEffect } from 'react'
import {
  Users,
  Clock,
} from 'lucide-react'
import { visitasApi } from '../../api/endpoints'
import type { VisitaDto } from '../../types/models'
import { useQuickActions } from '../../context/QuickActionContext'
import { StatCard } from '../ui/StatCard'
import { VisitasTable } from '../visitas/VisitasTable'
import { DirectorioPanel } from '../directorio/DirectorioPanel'

export const PanelOperativo: React.FC = () => {
  const { openVisitaModal } = useQuickActions()

  const [visitas, setVisitas] = useState<VisitaDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsLoading(true)
    try {
      const vData = await visitasApi.listarActivas()
      setVisitas(vData)
    } catch (err) {
      console.error('Error al cargar datos del panel:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const vData = await visitasApi.listarActivas()
        if (!ignore) {
          setVisitas(vData)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error al cargar datos del panel:', err)
          setIsLoading(false)
        }
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 12000)
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [])

  // Derived metrics
  const visitasEnEspera = visitas.filter((v) => v.estado === 'EN_ESPERA').length
  const visitasAutorizadas = visitas.filter((v) => v.estado === 'AUTORIZADO').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 2-Column Desktop-first operational layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Primary Operation (Contadores, Visitas Activas, Deliveries en Circulación) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* KPI Stat Cards Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <StatCard
              title="Visitas en Edificio"
              value={visitasAutorizadas}
              subtitle="Personas autorizadas en piso"
              icon={<Users size={22} />}
              colorTheme="cyan"
              onClick={() => openVisitaModal()}
            />

            <StatCard
              title="En Espera (Mesón)"
              value={visitasEnEspera}
              subtitle={visitasEnEspera > 0 ? 'Llamando por citófono' : 'Sin espera en mesón'}
              icon={<Clock size={22} />}
              colorTheme="blue"
              isAlert={visitasEnEspera > 0}
            />
          </div>

          {/* Active Visits Table */}
          <VisitasTable visitas={visitas} onRefresh={loadData} isLoading={isLoading} />
        </div>

        {/* Right Column: Directory & Intercom (Ficha residente, discado anexo, advertencias de depto) */}
        <div style={{ position: 'sticky', top: 80 }}>
          <DirectorioPanel />
        </div>
      </div>
    </div>
  )
}
