package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.EstadoPaquete;
import com.edificio.backend.model.entity.Paquete;

import java.time.Instant;

public record PaqueteDto(
        Long id,
        String codigoUbicacion,
        String codigoSeguimiento,
        String empresaTransporte,
        Long departamentoId,
        String departamentoNumero,
        String descripcion,
        Instant fechaRecepcion,
        Instant fechaEntrega,
        EstadoPaquete estado,
        String retiradoPor,
        String recepcionadoPor,
        String notas
) {
    public static PaqueteDto fromEntity(Paquete p) {
        return new PaqueteDto(
                p.getId(),
                p.getCodigoUbicacion(),
                p.getCodigoSeguimiento(),
                p.getEmpresaTransporte(),
                p.getDepartamento().getId(),
                p.getDepartamento().getNumero(),
                p.getDescripcion(),
                p.getFechaRecepcion(),
                p.getFechaEntrega(),
                p.getEstado(),
                p.getRetiradoPor(),
                p.getRecepcionadoPor(),
                p.getNotas()
        );
    }
}
