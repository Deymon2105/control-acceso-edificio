import type { ApiError } from '../types/models'

export class ApiClientError extends Error {
  public status: number
  public errorDetails: ApiError | null

  constructor(status: number, message: string, errorDetails: ApiError | null = null) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.errorDetails = errorDetails
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null as unknown as T
  }

  if (!response.ok) {
    let errorData: ApiError | null = null
    let errorMsg = `Error en el servidor (${response.status})`

    try {
      errorData = (await response.json()) as ApiError
      if (errorData && errorData.message) {
        errorMsg = errorData.message
      }
    } catch {
      // response wasn't json
      errorMsg = await response.text().catch(() => `Error HTTP ${response.status}`)
    }

    if (response.status === 401) {
      // Token might be expired or invalid
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    throw new ApiClientError(response.status, errorMsg, errorData)
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  downloadCsv: async (endpoint: string): Promise<string> => {
    const token = localStorage.getItem('token')
    const headers = new Headers()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    })
    if (!response.ok) {
      throw new ApiClientError(response.status, 'Error al descargar archivo CSV')
    }
    return response.text()
  },
}
