package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.RolUsuario;
import com.edificio.backend.model.entity.Usuario;

import java.time.Instant;

public record UsuarioDto(
        Long id,
        String username,
        String nombreCompleto,
        RolUsuario rol,
        boolean activo,
        Instant ultimoAcceso,
        Instant fechaCreacion
) {
    public static UsuarioDto fromEntity(Usuario usuario) {
        return new UsuarioDto(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNombreCompleto(),
                usuario.getRol(),
                usuario.isActivo(),
                usuario.getUltimoAcceso(),
                usuario.getFechaCreacion()
        );
    }
}
