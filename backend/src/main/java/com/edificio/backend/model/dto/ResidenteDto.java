package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.Residente;

public record ResidenteDto(
        Long id,
        String nombre,
        String apellido,
        String nombreCompleto,
        String rut,
        String telefono,
        String email,
        boolean esTitular,
        boolean activo
) {
    public static ResidenteDto fromEntity(Residente residente) {
        return new ResidenteDto(
                residente.getId(),
                residente.getNombre(),
                residente.getApellido(),
                residente.getNombreCompleto(),
                residente.getRut(),
                residente.getTelefono(),
                residente.getEmail(),
                residente.isEsTitular(),
                residente.isActivo()
        );
    }
}
