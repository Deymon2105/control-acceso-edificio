package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.Visitante;

import java.time.Instant;

public record VisitanteDto(
        Long id,
        String rut,
        String nombre,
        String apellido,
        String nombreCompleto,
        String telefono,
        int totalVisitas,
        Instant ultimaVisitaAt
) {
    public static VisitanteDto fromEntity(Visitante v) {
        return new VisitanteDto(
                v.getId(),
                v.getRut(),
                v.getNombre(),
                v.getApellido(),
                v.getNombreCompleto(),
                v.getTelefono(),
                v.getTotalVisitas(),
                v.getUltimaVisitaAt()
        );
    }
}
