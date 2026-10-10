package com.edificio.backend.model.request;

import jakarta.validation.constraints.NotBlank;

public record EntregarPaqueteRequest(
        @NotBlank(message = "El nombre de la persona que retira es obligatorio")
        String retiradoPor,

        String notas
) {}
