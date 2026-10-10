export type EstadoVisita = 'EN_ESPERA' | 'AUTORIZADO' | 'RECHAZADO' | 'FINALIZADO'

export type EstadoDelivery = 'EN_TRANSITO' | 'FINALIZADO' | 'CANCELADO'

export type EstadoPaquete = 'RECIBIDO_EN_CONSERJERIA' | 'ENTREGADO_A_RESIDENTE'

export type TipoRestriccion = 'BLOQUEO_TOTAL' | 'ADVERTENCIA_CRITICA'

export type CategoriaBitacora =
  | 'INCIDENTE'
  | 'RONDA'
  | 'ENTREGA_TURNO'
  | 'MANTENCION'
  | 'SEGURIDAD'
  | 'GENERAL'

export type RolUsuario = 'ADMIN' | 'CONSERJE'
