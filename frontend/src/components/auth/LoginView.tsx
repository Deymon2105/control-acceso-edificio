import React, { useState } from 'react'
import { Building2, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export const LoginView: React.FC = () => {
  const { login } = useAuth()
  const { showError, showSuccess } = useToast()

  const [username, setUsername] = useState('conserje')
  const [password, setPassword] = useState('conserje123')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      showError('Por favor ingresa usuario y contraseña')
      return
    }

    setIsLoading(true)
    try {
      await login({ username: username.trim(), password })
      showSuccess(`Bienvenido al sistema de control de acceso`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Credenciales inválidas'
      showError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 30%, #162544 0%, #0a0f1e 70%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-lg)',
          padding: '32px',
          animation: 'modal-appear 0.25s ease-out',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
            }}
          >
            <Building2 size={32} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em', margin: 0 }}>
            DEPTO PRIMERA AVENIDA
          </h2>
          <div style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600, marginTop: 2, letterSpacing: '0.05em' }}>
            CONTROL DE ACCESO & CONSERJERÍA
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            Ingresa con tus credenciales de operador de mesón o administración.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Usuario"
            placeholder="Ej: conserje o admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            prefixIcon={<User size={16} />}
            required
            autoFocus
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefixIcon={<Lock size={16} />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', marginTop: 8 }}
            size="lg"
            isLoading={isLoading}
            icon={<ArrowRight size={16} />}
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* Demo Fast Login Pills */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
            Acceso Rápido de Prueba (Demo):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => fillCredentials('conserje', 'conserje123')}
              style={{
                background: '#0d1526',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>Conserje</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>conserje / conserje123</div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin123')}
              style={{
                background: '#0d1526',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>Administrador</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>admin / admin123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
