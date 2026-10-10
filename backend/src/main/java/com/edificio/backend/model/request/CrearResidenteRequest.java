package com.edificio.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearResidenteRequest(
        @NotNull(message = "El ID del departamento es obligatorio")
        Long departamentoId,

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        String apellido,

        String rut,

        @NotBlank(message = "El teléfono móvil es obligatorio")
        String telefono,

        String email,

        Boolean esTitular
) {}
