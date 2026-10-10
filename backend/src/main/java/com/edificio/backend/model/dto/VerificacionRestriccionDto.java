package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.TipoRestriccion;

public record VerificacionRestriccionDto(
        boolean tieneRestriccion,
        boolean esBloqueoTotal,
        String rut,
        String mensajeAlerta,
        RestriccionDto detalle
) {
    public static VerificacionRestriccionDto sinRestriccion(String rut) {
        return new VerificacionRestriccionDto(false, false, rut, null, null);
    }

    public static VerificacionRestriccionDto conRestriccion(RestriccionDto detalle) {
        boolean esBloqueo = detalle.tipoRestriccion() == TipoRestriccion.BLOQUEO_TOTAL;
        String mensaje = esBloqueo
                ? "BLOQUEO MECÁNICO ACTIVO - ORDEN O RESTRICCIÓN JUDICIAL VIGENTE: " + detalle.motivo()
                : "ADVERTENCIA DE SEGURIDAD: " + detalle.motivo();
        return new VerificacionRestriccionDto(true, esBloqueo, detalle.rut(), mensaje, detalle);
    }
}
