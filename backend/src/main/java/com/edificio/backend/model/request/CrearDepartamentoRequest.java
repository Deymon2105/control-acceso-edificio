package com.edificio.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearDepartamentoRequest(
        @NotBlank(message = "El número de departamento es obligatorio")
        @Size(max = 20, message = "El número no puede exceder 20 caracteres")
        String numero,

        @NotNull(message = "El piso es obligatorio")
        Integer piso,

        String torre,

        String anexoCitofono,

        String telefonoFijo,

        String notasOperativas,

        String advertenciaSeguridad
) {}
