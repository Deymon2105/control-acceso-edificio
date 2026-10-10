package com.edificio.backend.model.request;

import jakarta.validation.constraints.NotNull;

public record ActualizarDepartamentoRequest(
        @NotNull(message = "El piso es obligatorio")
        Integer piso,

        String torre,

        String anexoCitofono,

        String telefonoFijo,

        String notasOperativas,

        String advertenciaSeguridad,

        Boolean activo
) {}
