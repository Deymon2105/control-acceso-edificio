package com.edificio.backend.model.request;

import com.edificio.backend.model.entity.TipoRestriccion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearRestriccionRequest(
        @NotBlank(message = "El RUT es obligatorio")
        String rut,

        @NotBlank(message = "El nombre completo es obligatorio")
        String nombreCompleto,

        @NotBlank(message = "El motivo de la restricción es obligatorio")
        String motivo,

        @NotNull(message = "El tipo de restricción es obligatorio")
        TipoRestriccion tipoRestriccion,

        Long departamentoId
) {}
