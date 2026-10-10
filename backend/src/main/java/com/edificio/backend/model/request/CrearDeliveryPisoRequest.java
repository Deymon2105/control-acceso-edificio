package com.edificio.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearDeliveryPisoRequest(
        @NotBlank(message = "La empresa de delivery es obligatoria (ej. UberEats, PedidosYa)")
        String empresa,

        @NotBlank(message = "El nombre del repartidor es obligatorio")
        String nombreRepartidor,

        String rutRepartidor,

        @NotNull(message = "El departamento destino es obligatorio")
        Long departamentoId,

        String notas
) {}
