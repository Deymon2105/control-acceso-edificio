package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.CategoriaBitacora;
import com.edificio.backend.model.entity.RegistroBitacora;

import java.time.Instant;

public record RegistroBitacoraDto(
        Long id,
        Instant fechaHora,
        CategoriaBitacora categoria,
        String descripcion,
        boolean esAlerta,
        String usuarioNombre,
        String turno
) {
    public static RegistroBitacoraDto fromEntity(RegistroBitacora b) {
        return new RegistroBitacoraDto(
                b.getId(),
                b.getFechaHora(),
                b.getCategoria(),
                b.getDescripcion(),
                b.isEsAlerta(),
                b.getUsuarioNombre(),
                b.getTurno()
        );
    }
}
