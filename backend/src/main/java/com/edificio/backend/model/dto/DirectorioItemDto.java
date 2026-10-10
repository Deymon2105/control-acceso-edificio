package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.Departamento;
import com.edificio.backend.model.entity.Residente;

import java.util.Collections;
import java.util.List;

public record DirectorioItemDto(
        Long departamentoId,
        String numero,
        Integer piso,
        String torre,
        String anexoCitofono,
        String telefonoFijo,
        String nombreTitular,
        String telefonoTitular,
        String notasOperativas,
        String advertenciaSeguridad,
        List<ResidenteDto> todosResidentes
) {
    public static DirectorioItemDto fromEntity(Departamento depto) {
        List<Residente> residentes = depto.getResidentes() != null ? depto.getResidentes() : Collections.emptyList();
        Residente titular = residentes.stream()
                .filter(r -> r.isActivo() && r.isEsTitular())
                .findFirst()
                .orElse(residentes.stream().filter(Residente::isActivo).findFirst().orElse(null));

        List<ResidenteDto> residentesDto = residentes.stream()
                .filter(Residente::isActivo)
                .map(ResidenteDto::fromEntity)
                .toList();

        return new DirectorioItemDto(
                depto.getId(),
                depto.getNumero(),
                depto.getPiso(),
                depto.getTorre(),
                depto.getAnexoCitofono(),
                depto.getTelefonoFijo(),
                titular != null ? titular.getNombreCompleto() : "Sin residente asignado",
                titular != null ? titular.getTelefono() : "Sin teléfono",
                depto.getNotasOperativas(),
                depto.getAdvertenciaSeguridad(),
                residentesDto
        );
    }
}
