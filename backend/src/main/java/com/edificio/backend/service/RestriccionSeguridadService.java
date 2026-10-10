package com.edificio.backend.service;

import com.edificio.backend.exception.ResourceNotFoundException;
import com.edificio.backend.model.dto.RestriccionDto;
import com.edificio.backend.model.dto.VerificacionRestriccionDto;
import com.edificio.backend.model.entity.Departamento;
import com.edificio.backend.model.entity.RestriccionSeguridad;
import com.edificio.backend.model.request.CrearRestriccionRequest;
import com.edificio.backend.repository.DepartamentoRepository;
import com.edificio.backend.repository.RestriccionSeguridadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RestriccionSeguridadService {

    private final RestriccionSeguridadRepository restriccionRepository;
    private final DepartamentoRepository departamentoRepository;

    public static String normalizarRut(String rut) {
        if (!StringUtils.hasText(rut)) return "";
        return rut.replace(".", "").replace("-", "").trim().toUpperCase();
    }

    @Transactional(readOnly = true)
    public VerificacionRestriccionDto verificarRut(String rut) {
        if (!StringUtils.hasText(rut)) {
            return VerificacionRestriccionDto.sinRestriccion(rut);
        }

        String limpio = normalizarRut(rut);
        Optional<RestriccionSeguridad> restriccionOpt = restriccionRepository.buscarPorRutActivo(limpio, rut.trim());

        return restriccionOpt
                .map(r -> VerificacionRestriccionDto.conRestriccion(RestriccionDto.fromEntity(r)))
                .orElseGet(() -> VerificacionRestriccionDto.sinRestriccion(rut));
    }

    @Transactional(readOnly = true)
    public List<RestriccionDto> listarActivas() {
        return restriccionRepository.findByActivoTrueOrderByFechaRegistroDesc().stream()
                .map(RestriccionDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RestriccionDto> buscar(String query) {
        if (!StringUtils.hasText(query)) {
            return listarActivas();
        }
        return restriccionRepository.buscarPorRutONombre(query.trim()).stream()
                .map(RestriccionDto::fromEntity)
                .toList();
    }

    @Transactional
    public RestriccionDto crearRestriccion(CrearRestriccionRequest request, String registradoPor) {
        Departamento depto = null;
        if (request.departamentoId() != null) {
            depto = departamentoRepository.findById(request.departamentoId()).orElse(null);
        }

        RestriccionSeguridad r = RestriccionSeguridad.builder()
                .rut(request.rut().trim())
                .nombreCompleto(request.nombreCompleto().trim())
                .motivo(request.motivo().trim())
                .tipoRestriccion(request.tipoRestriccion())
                .departamento(depto)
                .registradoPor(registradoPor)
                .activo(true)
                .build();

        return RestriccionDto.fromEntity(restriccionRepository.save(r));
    }

    @Transactional
    public void desactivar(Long id) {
        RestriccionSeguridad r = restriccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restricción no encontrada con ID: " + id));
        r.setActivo(false);
        restriccionRepository.save(r);
    }
}
