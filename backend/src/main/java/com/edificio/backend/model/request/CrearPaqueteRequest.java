package com.edificio.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearPaqueteRequest(
        String codigoUbicacion,

        String codigoSeguimiento,

        @NotBlank(message = "La empresa de transporte es obligatoria (ej. Chilexpress, Starken)")
        String empresaTransporte,

        @NotNull(message = "El departamento es obligatorio")
        Long departamentoId,

        String descripcion,

        String notas
) {}
