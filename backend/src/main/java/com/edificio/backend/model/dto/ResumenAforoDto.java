package com.edificio.backend.model.dto;

import java.time.Instant;
import java.util.List;

public record ResumenAforoDto(
        int totalPersonasEnEdificio,
        int totalVisitas,
        int totalDeliveries,
        Instant fechaCalculo,
        List<AforoPisoDto> desglosePisos
) {}
