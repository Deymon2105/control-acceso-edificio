package com.edificio.backend.model.dto;

import com.edificio.backend.model.entity.DeliveryPiso;
import com.edificio.backend.model.entity.EstadoDelivery;

import java.time.Duration;
import java.time.Instant;

public record DeliveryPisoDto(
        Long id,
        String empresa,
        String nombreRepartidor,
        String rutRepartidor,
        Long departamentoId,
        String departamentoNumero,
        Integer piso,
        Instant horaIngreso,
        Instant horaSalida,
        EstadoDelivery estado,
        long minutosTranscurridos,
        boolean tiempoExcedido,
        String notas,
        String registradoPor
) {
    public static DeliveryPisoDto fromEntity(DeliveryPiso d) {
        Instant fin = d.getHoraSalida() != null ? d.getHoraSalida() : Instant.now();
        long minutos = Duration.between(d.getHoraIngreso(), fin).toMinutes();
        boolean excedido = d.getEstado() == EstadoDelivery.EN_TRANSITO && minutos > 15;

        return new DeliveryPisoDto(
                d.getId(),
                d.getEmpresa(),
                d.getNombreRepartidor(),
                d.getRutRepartidor(),
                d.getDepartamento().getId(),
                d.getDepartamento().getNumero(),
                d.getDepartamento().getPiso(),
                d.getHoraIngreso(),
                d.getHoraSalida(),
                d.getEstado(),
                minutos,
                excedido,
                d.getNotas(),
                d.getRegistradoPor()
        );
    }
}
