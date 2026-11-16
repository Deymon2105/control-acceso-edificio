/**
 * Utilidades de validación para RUT chileno y teléfonos en control de acceso.
 */

/**
 * Valida un RUT chileno verificando el formato chileno (cuerpo + DV).
 * Permite cualquier dígito verificador ingresado por el usuario (0-9 o K),
 * adaptándose al ingreso flexible sin forzar un cálculo de Módulo 11 restrictivo.
 */
export function validarRutChileno(rutInput: string): { valido: boolean; mensaje?: string; rutFormateado?: string } {
  if (!rutInput || !rutInput.trim()) {
    return { valido: false, mensaje: 'El RUT es obligatorio' }
  }

  // Limpiar puntos, guiones y espacios
  const limpio = rutInput.replace(/[.\-\s]/g, '').toUpperCase()

  // Comprobar formato básico de RUT chileno: entre 6 y 8 dígitos para el cuerpo y 1 dígito verificador (0-9 o K)
  // Total entre 7 y 9 caracteres
  if (!/^[0-9]{6,8}[0-9K]$/.test(limpio)) {
    return {
      valido: false,
      mensaje: 'Formato de RUT inválido. Ingrese entre 7 y 8 dígitos más dígito verificador (ej: 17.345.876-8 o 17345876-8)',
    }
  }

  // Formatear RUT estándar XX.XXX.XXX-X o X.XXX.XXX-X
  const rutFormateado = formatearRut(limpio)

  return { valido: true, rutFormateado }
}

/**
 * Formatea un RUT limpio o semilimpio a formato XX.XXX.XXX-X o X.XXX.XXX-X
 */
export function formatearRut(rut: string): string {
  const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (limpio.length < 2) return limpio

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)

  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpoFormateado}-${dv}`
}

/**
 * Formatea un RUT mientras el usuario escribe o pega texto en vivo.
 * Si se ingresa de corrido sin puntos o con guión, agrega los puntos y el guión automáticamente.
 */
export function formatearRutEnVivo(input: string): string {
  if (!input) return ''
  const limpioSinGuion = input.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9)
  if (!limpioSinGuion) return ''

  // Si tiene guión explícito
  if (input.includes('-')) {
    const partes = input.split('-')
    const cuerpoLimpio = partes[0].replace(/\D/g, '').slice(0, 8)
    const dvLimpio = partes[1].replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 1)
    const cuerpoFormateado = cuerpoLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return partes.length > 1 && dvLimpio ? `${cuerpoFormateado}-${dvLimpio}` : `${cuerpoFormateado}-`
  }

  // Si se ingresó de corrido y ya alcanzó los 9 caracteres (cuerpo de 8 + DV)
  if (limpioSinGuion.length === 9) {
    const cuerpo = limpioSinGuion.slice(0, -1)
    const dv = limpioSinGuion.slice(-1)
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${cuerpoFormateado}-${dv}`
  }

  // Mientras escribe el cuerpo (hasta 8 dígitos)
  return limpioSinGuion.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Valida un teléfono chileno. Si está vacío es válido (es opcional).
 * Acepta formatos como:
 * +56 9 3566 0839
 * +56935660839
 * 935660839
 * +56 2 2233 4455
 * 222334455
 */
export function validarTelefonoChileno(telefonoInput?: string | null): { valido: boolean; mensaje?: string } {
  if (!telefonoInput || !telefonoInput.trim()) {
    return { valido: true }
  }

  const valor = telefonoInput.trim()

  // No permitir letras ni caracteres no telefónicos
  if (/[a-zA-Z]/.test(valor)) {
    return {
      valido: false,
      mensaje: 'El teléfono no puede contener letras. Ejemplo: +56 9 3566 0839',
    }
  }

  // Extraer sólo los dígitos
  const digitos = valor.replace(/\D/g, '')

  // Celular con código país 569XXXXXXXX (11 dígitos)
  if (digitos.startsWith('569') && digitos.length === 11) {
    return { valido: true }
  }

  // Celular nacional 9XXXXXXXX (9 dígitos que comienzan con 9)
  if (digitos.startsWith('9') && digitos.length === 9) {
    return { valido: true }
  }

  // Red fija con código país 562XXXXXXXX (10 u 11 dígitos) o fija nacional (8 o 9 dígitos)
  if ((digitos.startsWith('562') && (digitos.length === 10 || digitos.length === 11)) ||
      (digitos.length >= 8 && digitos.length <= 9)) {
    return { valido: true }
  }

  return {
    valido: false,
    mensaje: 'Teléfono inválido. Ingrese un número chileno válido (ej: +56 9 3566 0839)',
  }
}
