package com.edificio.backend.model.dto;

import java.time.Instant;

public record PersonaEnEdificioDto(
        Long id,
        String tipo, // "VISITA" o "DELIVERY"
        String nombreCompleto,
        String rut,
        String departamentoNumero,
        Integer piso,
        String torre,
        Instant horaIngreso,
        long minutosPermanencia,
        String anexoCitofono
) {}
