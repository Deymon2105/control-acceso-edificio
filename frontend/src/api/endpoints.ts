import { apiClient } from './client'
import type {
  ActualizarDepartamentoRequest,
  BuscarRutResponseDto,
  CambiarPasswordRequest,
  CategoriaBitacora,
  CrearBitacoraRequest,
  CrearDeliveryPisoRequest,
  CrearDepartamentoRequest,
  CrearPaqueteRequest,
  CrearResidenteRequest,
  CrearRestriccionRequest,
  CrearUsuarioRequest,
  DeliveryPisoDto,
  DepartamentoDto,
  DirectorioItemDto,
  EntregarPaqueteRequest,
  EstadoVisita,
  LoginRequest,
  LoginResponseDto,
  PaqueteDto,
  PersonaEnEdificioDto,
  RechazarVisitaRequest,
  RegistrarVisitaRequest,
  RegistroBitacoraDto,
  ResidenteDto,
  RestriccionDto,
  ResumenAforoDto,
  UsuarioDto,
  VerificacionRestriccionDto,
  VisitaDto,
} from '../types/models'

// 1. Auth
export const authApi = {
  login: (data: LoginRequest) => apiClient.post<LoginResponseDto>('/auth/login', data),
  me: () => apiClient.get<UsuarioDto>('/auth/me'),
}

// 2. Visitas
export const visitasApi = {
  buscarPorRut: (rut: string) => apiClient.get<BuscarRutResponseDto>(`/visitas/buscar-rut/${encodeURIComponent(rut)}`),
  registrar: (data: RegistrarVisitaRequest) => apiClient.post<VisitaDto>('/visitas', data),
  autorizar: (id: number) => apiClient.put<VisitaDto>(`/visitas/${id}/autorizar`),
  rechazar: (id: number, data: RechazarVisitaRequest) => apiClient.put<VisitaDto>(`/visitas/${id}/rechazar`, data),
  finalizar: (id: number) => apiClient.put<VisitaDto>(`/visitas/${id}/finalizar`),
  listarActivas: () => apiClient.get<VisitaDto[]>('/visitas/activas'),
  listarHistorico: (params?: { departamentoId?: number; estado?: EstadoVisita; desde?: string; hasta?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.departamentoId) searchParams.append('departamentoId', params.departamentoId.toString())
    if (params?.estado) searchParams.append('estado', params.estado)
    if (params?.desde) searchParams.append('desde', params.desde)
    if (params?.hasta) searchParams.append('hasta', params.hasta)
    const queryString = searchParams.toString()
    return apiClient.get<VisitaDto[]>(`/visitas${queryString ? `?${queryString}` : ''}`)
  },
  obtenerPorId: (id: number) => apiClient.get<VisitaDto>(`/visitas/${id}`),
}

// 3. Deliveries
export const deliveriesApi = {
  registrar: (data: CrearDeliveryPisoRequest) => apiClient.post<DeliveryPisoDto>('/deliveries', data),
  finalizar: (id: number) => apiClient.put<DeliveryPisoDto>(`/deliveries/${id}/finalizar`),
  listarActivos: () => apiClient.get<DeliveryPisoDto[]>('/deliveries/activos'),
  listarHistorico: () => apiClient.get<DeliveryPisoDto[]>('/deliveries'),
}

// 4. Paquetes
export const paquetesApi = {
  registrar: (data: CrearPaqueteRequest) => apiClient.post<PaqueteDto>('/paquetes', data),
  entregar: (id: number, data: EntregarPaqueteRequest) => apiClient.put<PaqueteDto>(`/paquetes/${id}/entregar`, data),
  listarEnCustodia: () => apiClient.get<PaqueteDto[]>('/paquetes/en-custodia'),
  listarPorDepartamento: (departamentoId: number) => apiClient.get<PaqueteDto[]>(`/paquetes/departamento/${departamentoId}`),
  listarHistorico: () => apiClient.get<PaqueteDto[]>('/paquetes'),
}

// 5. Directorio y Departamentos
export const directorioApi = {
  buscarDirectorio: (q?: string) => {
    const query = q ? `?q=${encodeURIComponent(q)}` : ''
    return apiClient.get<DirectorioItemDto[]>(`/departamentos/directorio${query}`)
  },
  obtenerPorNumero: (numero: string) => apiClient.get<DirectorioItemDto>(`/departamentos/numero/${encodeURIComponent(numero)}`),
  listarTodos: () => apiClient.get<DepartamentoDto[]>('/departamentos'),
  obtenerPorId: (id: number) => apiClient.get<DepartamentoDto>(`/departamentos/${id}`),
  crear: (data: CrearDepartamentoRequest) => apiClient.post<DepartamentoDto>('/departamentos', data),
  actualizar: (id: number, data: ActualizarDepartamentoRequest) => apiClient.put<DepartamentoDto>(`/departamentos/${id}`, data),
  agregarResidente: (data: CrearResidenteRequest) => apiClient.post<ResidenteDto>('/departamentos/residentes', data),
  desactivarResidente: (id: number) => apiClient.delete<void>(`/departamentos/residentes/${id}`),
}

// 6. Restricciones (Blacklist)
export const restriccionesApi = {
  verificarRut: (rut: string) => apiClient.get<VerificacionRestriccionDto>(`/restricciones/verificar/${encodeURIComponent(rut)}`),
  listar: (q?: string) => {
    const query = q ? `?q=${encodeURIComponent(q)}` : ''
    return apiClient.get<RestriccionDto[]>(`/restricciones${query}`)
  },
  crear: (data: CrearRestriccionRequest) => apiClient.post<RestriccionDto>('/restricciones', data),
  desactivar: (id: number) => apiClient.patch<void>(`/restricciones/${id}/desactivar`),
}

// 7. Aforo & Emergencias
export const aforoApi = {
  obtenerResumen: () => apiClient.get<ResumenAforoDto>('/aforo/actual'),
  obtenerPersonas: () => apiClient.get<PersonaEnEdificioDto[]>('/aforo/personas'),
  descargarManifiestoCsv: () => apiClient.downloadCsv('/aforo/manifiesto-csv'),
}

// 8. Bitácora
export const bitacoraApi = {
  registrar: (data: CrearBitacoraRequest) => apiClient.post<RegistroBitacoraDto>('/bitacora', data),
  eliminar: (id: number) => apiClient.delete<void>(`/bitacora/${id}`),
  listar: (params?: { categoria?: CategoriaBitacora; soloAlertas?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.categoria) searchParams.append('categoria', params.categoria)
    if (params?.soloAlertas !== undefined) searchParams.append('soloAlertas', params.soloAlertas.toString())
    const queryString = searchParams.toString()
    return apiClient.get<RegistroBitacoraDto[]>(`/bitacora${queryString ? `?${queryString}` : ''}`)
  },
}

// 9. Administración de Usuarios
export const usuariosApi = {
  listar: () => apiClient.get<UsuarioDto[]>('/admin/usuarios'),
  obtenerPorId: (id: number) => apiClient.get<UsuarioDto>(`/admin/usuarios/${id}`),
  crear: (data: CrearUsuarioRequest) => apiClient.post<UsuarioDto>('/admin/usuarios', data),
  cambiarPassword: (id: number, data: CambiarPasswordRequest) => apiClient.put<void>(`/admin/usuarios/${id}/password`, data),
  cambiarEstado: (id: number, activo: boolean) => apiClient.patch<UsuarioDto>(`/admin/usuarios/${id}/estado?activo=${activo}`),
}
