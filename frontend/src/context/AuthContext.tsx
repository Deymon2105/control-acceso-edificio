import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { LoginRequest, UsuarioDto } from '../types/models'
import { authApi } from '../api/endpoints'

interface AuthContextType {
  user: UsuarioDto | null
  token: string | null
  isLoading: boolean
  isAdmin: boolean
  isConserje: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<UsuarioDto | null>(() => {
    const cached = localStorage.getItem('user_profile')
    return cached ? (JSON.parse(cached) as UsuarioDto) : null
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_profile')
    setToken(null)
    setUser(null)
  }, [])

  const login = async (credentials: LoginRequest) => {
    const res = await authApi.login(credentials)
    localStorage.setItem('token', res.token)
    setToken(res.token)

    try {
      const me = await authApi.me()
      setUser(me)
      localStorage.setItem('user_profile', JSON.stringify(me))
    } catch {
      // Fallback user from login response if /me fails
      const fallbackUser: UsuarioDto = {
        id: 0,
        username: res.username,
        nombreCompleto: res.nombreCompleto,
        rol: res.rol,
        activo: true,
        ultimoAcceso: new Date().toISOString(),
        fechaCreacion: new Date().toISOString(),
      }
      setUser(fallbackUser)
      localStorage.setItem('user_profile', JSON.stringify(fallbackUser))
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const me = await authApi.me()
        setUser(me)
        localStorage.setItem('user_profile', JSON.stringify(me))
      } catch (err) {
        console.warn('Sesión previa inválida o expirada:', err)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const handleUnauthorized = () => {
      logout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [logout])

  const isAdmin = user?.rol === 'ADMIN'
  const isConserje = user?.rol === 'CONSERJE' || isAdmin

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isConserje,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  return context
}
