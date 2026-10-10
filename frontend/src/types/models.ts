import type {
  CategoriaBitacora,
  EstadoDelivery,
  EstadoPaquete,
  EstadoVisita,
  RolUsuario,
  TipoRestriccion,
} from './enums'

export type {
  CategoriaBitacora,
  EstadoDelivery,
  EstadoPaquete,
  EstadoVisita,
  RolUsuario,
  TipoRestriccion,
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

export interface UsuarioDto {
  id: number
  username: string
  nombreCompleto: string
  rol: RolUsuario
  activo: boolean
  ultimoAcceso: string | null
  fechaCreacion: string
}

export interface LoginResponseDto {
  token: string
  username: string
  nombreCompleto: string
  rol: RolUsuario
}

export interface ResidenteDto {
  id: number
  departamentoId: number
  departamentoNumero: string
  nombre: string
  apellido: string
  nombreCompleto: string
  rut: string | null
  telefono: string
  email: string | null
  esTitular: boolean
  activo: boolean
}

export interface DepartamentoDto {
  id: number
  numero: string
  piso: number
  torre: string | null
  anexoCitofono: string | null
  telefonoFijo: string | null
  notasOperativas: string | null
  advertenciaSeguridad: string | null
  activo: boolean
  residentes: ResidenteDto[]
}

export interface DirectorioItemDto {
  departamentoId: number
  numero: string
  piso: number
  torre: string | null
  anexoCitofono: string | null
  telefonoFijo: string | null
  nombreTitular: string
  telefonoTitular: string
  notasOperativas: string | null
  advertenciaSeguridad: string | null
  todosResidentes: ResidenteDto[]
}

export interface RestriccionDto {
  id: number
  rut: string
  nombreCompleto: string
  motivo: string
  tipoRestriccion: TipoRestriccion
  departamentoId: number | null
  departamentoNumero: string | null
  activo: boolean
  fechaRegistro: string
  registradoPor: string
}

export interface VerificacionRestriccionDto {
  tieneRestriccion: boolean
  esBloqueoTotal: boolean
  rut: string
  mensajeAlerta: string | null
  detalle: RestriccionDto | null
}

export interface VisitanteDto {
  id: number
  rut: string
  nombre: string
  apellido: string
  nombreCompleto: string
  telefono: string | null
  totalVisitas: number
  ultimaVisitaAt: string | null
}

export interface BuscarRutResponseDto {
  rut: string
  existeHistorico: boolean
  nombre: string | null
  apellido: string | null
  nombreCompleto: string | null
  telefono: string | null
  totalVisitasHistoricas: number
  restriccion: VerificacionRestriccionDto
}

export interface VisitaDto {
  id: number
  visitanteId: number
  rut: string
  nombreCompleto: string
  telefono: string | null
  departamentoId: number
  departamentoNumero: string
  piso: number
  estado: EstadoVisita
  checkInAt: string | null
  checkOutAt: string | null
  minutosPermanencia: number | null
  motivoRechazo: string | null
  observaciones: string | null
  registradoPor: string
  fechaCreacion: string
}

export interface DeliveryPisoDto {
  id: number
  empresa: string
  nombreRepartidor: string
  rutRepartidor: string | null
  departamentoId: number
  departamentoNumero: string
  piso: number
  horaIngreso: string
  horaSalida: string | null
  estado: EstadoDelivery
  minutosTranscurridos: number
  tiempoExcedido: boolean
  notas: string | null
  registradoPor: string
}

export interface PaqueteDto {
  id: number
  codigoUbicacion: string
  codigoSeguimiento: string | null
  empresaTransporte: string
  departamentoId: number
  departamentoNumero: string
  descripcion: string | null
  fechaRecepcion: string
  fechaEntrega: string | null
  estado: EstadoPaquete
  retiradoPor: string | null
  recepcionadoPor: string
  notas: string | null
}

export interface AforoPisoDto {
  sector: string
  piso: number
  cantidadPersonas: number
  personas: PersonaEnEdificioDto[]
}

export interface ResumenAforoDto {
  totalPersonasEnEdificio: number
  totalVisitas: number
  totalDeliveries: number
  fechaCalculo: string
  desglosePisos: AforoPisoDto[]
}

export interface PersonaEnEdificioDto {
  id: number
  tipo: 'VISITA' | 'DELIVERY'
  nombreCompleto: string
  rut: string
  departamentoNumero: string
  piso: number
  torre: string | null
  horaIngreso: string
  minutosPermanencia: number
  anexoCitofono: string | null
}

export interface RegistroBitacoraDto {
  id: number
  fechaHora: string
  categoria: CategoriaBitacora
  descripcion: string
  esAlerta: boolean
  usuarioNombre: string
  turno: string
}

// Requests
export interface LoginRequest {
  username: string
  password: string
}

export interface RegistrarVisitaRequest {
  rut: string
  nombre: string
  apellido: string
  telefono?: string
  departamentoId: number
  estadoInicial?: EstadoVisita
  observaciones?: string
}

export interface RechazarVisitaRequest {
  motivoRechazo: string
}

export interface CrearDeliveryPisoRequest {
  empresa: string
  nombreRepartidor: string
  rutRepartidor?: string
  departamentoId: number
  notas?: string
}

export interface CrearPaqueteRequest {
  codigoUbicacion?: string
  codigoSeguimiento?: string
  empresaTransporte: string
  departamentoId: number
  descripcion?: string
  notas?: string
}

export interface EntregarPaqueteRequest {
  retiradoPor: string
  notas?: string
}

export interface CrearBitacoraRequest {
  categoria: CategoriaBitacora
  descripcion: string
  esAlerta?: boolean
  turno?: string
}

export interface CrearDepartamentoRequest {
  numero: string
  piso: number
  torre?: string
  anexoCitofono?: string
  telefonoFijo?: string
  notasOperativas?: string
  advertenciaSeguridad?: string
}

export interface ActualizarDepartamentoRequest {
  piso: number
  torre?: string
  anexoCitofono?: string
  telefonoFijo?: string
  notasOperativas?: string
  advertenciaSeguridad?: string
  activo?: boolean
}

export interface CrearResidenteRequest {
  departamentoId: number
  nombre: string
  apellido: string
  rut?: string
  telefono: string
  email?: string
  esTitular?: boolean
}

export interface CrearRestriccionRequest {
  rut: string
  nombreCompleto: string
  motivo: string
  tipoRestriccion: TipoRestriccion
  departamentoId?: number
}

export interface CrearUsuarioRequest {
  username: string
  password: string
  nombreCompleto: string
  rol: RolUsuario
}

export interface CambiarPasswordRequest {
  passwordActual: string
  nuevoPassword: string
}
