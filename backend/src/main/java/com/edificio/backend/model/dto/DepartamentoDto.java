package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.Departamento;

import java.util.Collections;
import java.util.List;

public record DepartamentoDto(
        Long id,
        String numero,
        Integer piso,
        String torre,
        String anexoCitofono,
        String telefonoFijo,
        String notasOperativas,
        String advertenciaSeguridad,
        boolean activo,
        List<ResidenteDto> residentes
) {
    public static DepartamentoDto fromEntity(Departamento depto) {
        List<ResidenteDto> residentesDto = depto.getResidentes() != null
                ? depto.getResidentes().stream()
                .filter(r -> r.isActivo())
                .map(ResidenteDto::fromEntity)
                .toList()
                : Collections.emptyList();

        return new DepartamentoDto(
                depto.getId(),
                depto.getNumero(),
                depto.getPiso(),
                depto.getTorre(),
                depto.getAnexoCitofono(),
                depto.getTelefonoFijo(),
                depto.getNotasOperativas(),
                depto.getAdvertenciaSeguridad(),
                depto.isActivo(),
                residentesDto
        );
    }
}
