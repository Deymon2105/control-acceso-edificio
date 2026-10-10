package com.edificio.backend.model.dto;

import java.util.List;

public record AforoPisoDto(
        String sector,
        Integer piso,
        int cantidadPersonas,
        List<PersonaEnEdificioDto> personas
) {}
