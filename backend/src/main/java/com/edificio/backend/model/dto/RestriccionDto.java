package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.RestriccionSeguridad;
import com.edificio.backend.model.entity.TipoRestriccion;

import java.time.Instant;

public record RestriccionDto(
        Long id,
        String rut,
        String nombreCompleto,
        String motivo,
        TipoRestriccion tipoRestriccion,
        Long departamentoId,
        String departamentoNumero,
        boolean activo,
        Instant fechaRegistro,
        String registradoPor
) {
    public static RestriccionDto fromEntity(RestriccionSeguridad r) {
        return new RestriccionDto(
                r.getId(),
                r.getRut(),
                r.getNombreCompleto(),
                r.getMotivo(),
                r.getTipoRestriccion(),
                r.getDepartamento() != null ? r.getDepartamento().getId() : null,
                r.getDepartamento() != null ? r.getDepartamento().getNumero() : null,
                r.isActivo(),
                r.getFechaRegistro(),
                r.getRegistradoPor()
        );
    }
}
