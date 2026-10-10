package com.edificio.backend.model.request;

import jakarta.validation.constraints.NotBlank;

public record RechazarVisitaRequest(
        @NotBlank(message = "El motivo de rechazo es obligatorio")
        String motivoRechazo
) {}
