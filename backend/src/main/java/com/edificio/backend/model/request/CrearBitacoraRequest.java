package com.edificio.backend.model.request;

import com.edificio.backend.model.entity.CategoriaBitacora;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearBitacoraRequest(
        @NotNull(message = "La categoría de la bitácora es obligatoria")
        CategoriaBitacora categoria,

        @NotBlank(message = "La descripción de la novedad o suceso es obligatoria")
        @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
        String descripcion,

        Boolean esAlerta,

        String turno
) {}
