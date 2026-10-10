package com.edificio.backend.service;

import com.edificio.backend.exception.BusinessRuleException;
import com.edificio.backend.exception.ResourceNotFoundException;
import com.edificio.backend.model.dto.DeliveryPisoDto;
import com.edificio.backend.model.entity.Departamento;
import com.edificio.backend.model.entity.DeliveryPiso;
import com.edificio.backend.model.entity.EstadoDelivery;
import com.edificio.backend.model.request.CrearDeliveryPisoRequest;
import com.edificio.backend.repository.DepartamentoRepository;
import com.edificio.backend.repository.DeliveryPisoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryPisoRepository deliveryRepository;
    private final DepartamentoRepository departamentoRepository;

    @Transactional
    public DeliveryPisoDto registrarDelivery(CrearDeliveryPisoRequest request, String registradoPor) {
        Departamento depto = departamentoRepository.findById(request.departamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado con ID: " + request.departamentoId()));

        DeliveryPiso delivery = DeliveryPiso.builder()
                .empresa(request.empresa().trim())
                .nombreRepartidor(request.nombreRepartidor().trim())
                .rutRepartidor(request.rutRepartidor() != null ? request.rutRepartidor().trim() : null)
                .departamento(depto)
                .horaIngreso(Instant.now())
                .estado(EstadoDelivery.EN_TRANSITO)
                .notas(request.notas())
                .registradoPor(registradoPor)
                .build();

        return DeliveryPisoDto.fromEntity(deliveryRepository.save(delivery));
    }

    @Transactional
    public DeliveryPisoDto finalizarDelivery(Long id) {
        DeliveryPiso delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery no encontrado con ID: " + id));

        if (delivery.getEstado() != EstadoDelivery.EN_TRANSITO) {
            throw new BusinessRuleException("El delivery ya no se encuentra en tránsito.");
        }

        delivery.setEstado(EstadoDelivery.FINALIZADO);
        delivery.setHoraSalida(Instant.now());
        return DeliveryPisoDto.fromEntity(deliveryRepository.save(delivery));
    }

    @Transactional(readOnly = true)
    public List<DeliveryPisoDto> listarActivos() {
        return deliveryRepository.findByEstadoOrderByHoraIngresoDesc(EstadoDelivery.EN_TRANSITO).stream()
                .map(DeliveryPisoDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryPisoDto> listarHistorico() {
        return deliveryRepository.findAllByOrderByHoraIngresoDesc().stream()
                .map(DeliveryPisoDto::fromEntity)
                .toList();
    }
}
