package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.Visitante;

public record BuscarRutResponseDto(
        String rut,
        boolean existeHistorico,
        String nombre,
        String apellido,
        String nombreCompleto,
        String telefono,
        int totalVisitasHistoricas,
        VerificacionRestriccionDto restriccion
) {
    public static BuscarRutResponseDto deVisitante(Visitante v, VerificacionRestriccionDto restriccion) {
        return new BuscarRutResponseDto(
                v.getRut(),
                true,
                v.getNombre(),
                v.getApellido(),
                v.getNombreCompleto(),
                v.getTelefono(),
                v.getTotalVisitas(),
                restriccion
        );
    }

    public static BuscarRutResponseDto sinHistorial(String rut, VerificacionRestriccionDto restriccion) {
        return new BuscarRutResponseDto(
                rut,
                false,
                null,
                null,
                null,
                null,
                0,
                restriccion
        );
    }
}
