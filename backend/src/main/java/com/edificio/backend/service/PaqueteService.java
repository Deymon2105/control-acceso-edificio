package com.edificio.backend.service;

import com.edificio.backend.exception.BusinessRuleException;
import com.edificio.backend.exception.ResourceNotFoundException;
import com.edificio.backend.model.dto.PaqueteDto;
import com.edificio.backend.model.entity.Departamento;
import com.edificio.backend.model.entity.EstadoPaquete;
import com.edificio.backend.model.entity.Paquete;
import com.edificio.backend.model.request.CrearPaqueteRequest;
import com.edificio.backend.model.request.EntregarPaqueteRequest;
import com.edificio.backend.repository.DepartamentoRepository;
import com.edificio.backend.repository.PaqueteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaqueteService {

    private final PaqueteRepository paqueteRepository;
    private final DepartamentoRepository departamentoRepository;

    @Transactional
    public PaqueteDto registrarPaquete(CrearPaqueteRequest request, String recepcionadoPor) {
        Departamento depto = departamentoRepository.findById(request.departamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado con ID: " + request.departamentoId()));

        String codigoUbicacion = request.codigoUbicacion();
        if (!StringUtils.hasText(codigoUbicacion)) {
            long total = paqueteRepository.count() + 1;
            codigoUbicacion = String.format("#PAQ-%s-%02d", depto.getNumero(), (total % 100));
        }

        Paquete paquete = Paquete.builder()
                .codigoUbicacion(codigoUbicacion.trim())
                .codigoSeguimiento(StringUtils.hasText(request.codigoSeguimiento()) ? request.codigoSeguimiento().trim() : null)
                .empresaTransporte(request.empresaTransporte().trim())
                .departamento(depto)
                .descripcion(request.descripcion())
                .fechaRecepcion(Instant.now())
                .estado(EstadoPaquete.RECIBIDO_EN_CONSERJERIA)
                .recepcionadoPor(recepcionadoPor)
                .notas(request.notas())
                .build();

        return PaqueteDto.fromEntity(paqueteRepository.save(paquete));
    }

    @Transactional
    public PaqueteDto entregarPaquete(Long id, EntregarPaqueteRequest request) {
        Paquete paquete = paqueteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paquete no encontrado con ID: " + id));

        if (paquete.getEstado() == EstadoPaquete.ENTREGADO_A_RESIDENTE) {
            throw new BusinessRuleException("El paquete ya fue entregado previamente a: " + paquete.getRetiradoPor());
        }

        paquete.setEstado(EstadoPaquete.ENTREGADO_A_RESIDENTE);
        paquete.setFechaEntrega(Instant.now());
        paquete.setRetiradoPor(request.retiradoPor().trim());
        if (StringUtils.hasText(request.notas())) {
            paquete.setNotas(paquete.getNotas() != null ? paquete.getNotas() + " | " + request.notas().trim() : request.notas().trim());
        }

        return PaqueteDto.fromEntity(paqueteRepository.save(paquete));
    }

    @Transactional(readOnly = true)
    public List<PaqueteDto> listarEnCustodia() {
        return paqueteRepository.findByEstadoOrderByFechaRecepcionDesc(EstadoPaquete.RECIBIDO_EN_CONSERJERIA).stream()
                .map(PaqueteDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaqueteDto> listarPorDepartamento(Long deptoId) {
        return paqueteRepository.findByDepartamentoIdOrderByFechaRecepcionDesc(deptoId).stream()
                .map(PaqueteDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaqueteDto> listarHistorico() {
        return paqueteRepository.findAllByOrderByFechaRecepcionDesc().stream()
                .map(PaqueteDto::fromEntity)
                .toList();
    }
}
