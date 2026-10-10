import React, { useState, useEffect } from 'react'
import { Phone, PhoneCall, PhoneOff, CheckCircle2, Volume2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { DirectorioItemDto } from '../../types/models'

interface CitofonoDialModalProps {
  isOpen: boolean
  onClose: () => void
  depto: DirectorioItemDto | null
  onAuthorizeVisit?: (deptoId: number) => void
}

export const CitofonoDialModal: React.FC<CitofonoDialModalProps> = ({
  isOpen,
  onClose,
  depto,
  onAuthorizeVisit,
}) => {
  const [callState, setCallState] = useState<'marcando' | 'timbrando' | 'conectado' | 'finalizado'>('marcando')
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // Sequence: marcando (1.2s) -> timbrando (2s) -> conectado
    const t1 = setTimeout(() => {
      setCallState('timbrando')
    }, 1200)

    const t2 = setTimeout(() => {
      setCallState('conectado')
    }, 3200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    if (callState !== 'conectado') return

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [callState])

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setCallState('finalizado')
    setTimeout(() => {
      onClose()
    }, 400)
  }

  const handleAuthorizeFromCall = () => {
    if (depto && onAuthorizeVisit) {
      onAuthorizeVisit(depto.departamentoId)
    }
    handleEndCall()
  }

  if (!depto) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleEndCall}
      title={`Citofonía • Departamento ${depto.numero}`}
      subtitle={`Anexo: ${depto.anexoCitofono || depto.numero} • Piso ${depto.piso}`}
      icon={<PhoneCall size={20} />}
      maxWidth={480}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button variant="danger" icon={<PhoneOff size={16} />} onClick={handleEndCall}>
            Colgar
          </Button>

          {callState === 'conectado' && onAuthorizeVisit && (
            <Button variant="success" icon={<CheckCircle2 size={16} />} onClick={handleAuthorizeFromCall}>
              Residente Autorizó Ingreso
            </Button>
          )}
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '16px 8px' }}>
        {/* Call status circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background:
              callState === 'conectado'
                ? 'rgba(16, 185, 129, 0.2)'
                : callState === 'timbrando'
                ? 'rgba(14, 165, 233, 0.2)'
                : 'rgba(37, 99, 235, 0.2)',
            border: `2px solid ${
              callState === 'conectado'
                ? 'var(--status-success)'
                : callState === 'timbrando'
                ? 'var(--accent-cyan)'
                : 'var(--accent-blue)'
            }`,
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color:
              callState === 'conectado'
                ? 'var(--status-success)'
                : callState === 'timbrando'
                ? 'var(--accent-cyan)'
                : 'var(--accent-blue)',
            boxShadow:
              callState === 'conectado'
                ? '0 0 20px rgba(16, 185, 129, 0.4)'
                : '0 0 15px rgba(37, 99, 235, 0.3)',
            animation: callState === 'timbrando' ? 'beacon 1.2s infinite' : 'none',
          }}
        >
          {callState === 'conectado' ? (
            <Volume2 size={36} />
          ) : callState === 'timbrando' ? (
            <PhoneCall size={34} />
          ) : (
            <Phone size={34} />
          )}
        </div>

        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          {callState === 'marcando' && 'Conectando con anexo central...'}
          {callState === 'timbrando' && 'Timbrando en departamento...'}
          {callState === 'conectado' && 'Llamada en curso'}
          {callState === 'finalizado' && 'Llamada finalizada'}
        </div>

        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: 4 }}>
          {callState === 'conectado' ? formatTimer(seconds) : `Anexo #${depto.anexoCitofono || depto.numero}`}
        </div>

        <div
          style={{
            marginTop: 20,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: 12,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Titular Registrado:
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
            {depto.nombreTitular}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Móvil: {depto.telefonoTitular}
          </div>

          {depto.notasOperativas && (
            <div
              style={{
                marginTop: 8,
                padding: '6px 10px',
                background: 'rgba(37, 99, 235, 0.08)',
                borderLeft: '3px solid var(--accent-blue)',
                fontSize: 12,
                color: '#93c5fd',
              }}
            >
              <strong>Nota:</strong> {depto.notasOperativas}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
