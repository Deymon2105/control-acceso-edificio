package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.RolUsuario;

public record LoginResponseDto(
        String token,
        String username,
        String nombreCompleto,
        RolUsuario rol
) {}
