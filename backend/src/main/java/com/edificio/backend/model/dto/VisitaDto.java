package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.EstadoVisita;
import com.edificio.backend.model.entity.RegistroVisita;

import java.time.Duration;
import java.time.Instant;

public record VisitaDto(
        Long id,
        Long visitanteId,
        String rut,
        String nombreCompleto,
        String telefono,
        Long departamentoId,
        String departamentoNumero,
        Integer piso,
        EstadoVisita estado,
        Instant checkInAt,
        Instant checkOutAt,
        Long minutosPermanencia,
        String motivoRechazo,
        String observaciones,
        String registradoPor,
        Instant fechaCreacion
) {
    public static VisitaDto fromEntity(RegistroVisita r) {
        Long minutos = null;
        if (r.getCheckInAt() != null) {
            Instant fin = r.getCheckOutAt() != null ? r.getCheckOutAt() : Instant.now();
            minutos = Duration.between(r.getCheckInAt(), fin).toMinutes();
        }

        return new VisitaDto(
                r.getId(),
                r.getVisitante().getId(),
                r.getVisitante().getRut(),
                r.getVisitante().getNombreCompleto(),
                r.getVisitante().getTelefono(),
                r.getDepartamento().getId(),
                r.getDepartamento().getNumero(),
                r.getDepartamento().getPiso(),
                r.getEstado(),
                r.getCheckInAt(),
                r.getCheckOutAt(),
                minutos,
                r.getMotivoRechazo(),
                r.getObservaciones(),
                r.getRegistradoPor(),
                r.getFechaCreacion()
        );
    }
}
