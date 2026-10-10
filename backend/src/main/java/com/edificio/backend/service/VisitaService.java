package com.edificio.backend.service;

import com.edificio.backend.exception.BusinessRuleException;
import com.edificio.backend.exception.ResourceNotFoundException;
import com.edificio.backend.exception.SecurityRestrictionException;
import com.edificio.backend.model.dto.BuscarRutResponseDto;
import com.edificio.backend.model.dto.VerificacionRestriccionDto;
import com.edificio.backend.model.dto.VisitaDto;
import com.edificio.backend.model.entity.Departamento;
import com.edificio.backend.model.entity.EstadoVisita;
import com.edificio.backend.model.entity.RegistroVisita;
import com.edificio.backend.model.entity.Visitante;
import com.edificio.backend.model.request.RechazarVisitaRequest;
import com.edificio.backend.model.request.RegistrarVisitaRequest;
import com.edificio.backend.repository.DepartamentoRepository;
import com.edificio.backend.repository.RegistroVisitaRepository;
import com.edificio.backend.repository.VisitanteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VisitaService {

    private final RegistroVisitaRepository registroVisitaRepository;
    private final VisitanteRepository visitanteRepository;
    private final DepartamentoRepository departamentoRepository;
    private final RestriccionSeguridadService restriccionService;

    @Transactional(readOnly = true)
    public BuscarRutResponseDto buscarPorRut(String rut) {
        if (!StringUtils.hasText(rut)) {
            return BuscarRutResponseDto.sinHistorial(rut, VerificacionRestriccionDto.sinRestriccion(rut));
        }

        VerificacionRestriccionDto restriccion = restriccionService.verificarRut(rut);
        String limpio = RestriccionSeguridadService.normalizarRut(rut);
        Optional<Visitante> visitanteOpt = visitanteRepository.buscarPorRut(limpio, rut.trim());

        return visitanteOpt
                .map(v -> BuscarRutResponseDto.deVisitante(v, restriccion))
                .orElseGet(() -> BuscarRutResponseDto.sinHistorial(rut, restriccion));
    }

    @Transactional
    public VisitaDto registrarVisita(RegistrarVisitaRequest request, String usuarioConserje) {
        String rut = request.rut().trim();
        VerificacionRestriccionDto restriccion = restriccionService.verificarRut(rut);

        // Bloqueo crítico: Si la persona tiene orden judicial o prohibición estricta
        if (restriccion.tieneRestriccion() && restriccion.esBloqueoTotal()) {
            throw new SecurityRestrictionException(
                    rut,
                    restriccion.detalle().motivo(),
                    restriccion.detalle().tipoRestriccion().name()
            );
        }

        Departamento depto = departamentoRepository.findById(request.departamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado con ID: " + request.departamentoId()));

        String limpio = RestriccionSeguridadService.normalizarRut(rut);
        Visitante visitante = visitanteRepository.buscarPorRut(limpio, rut)
                .map(v -> {
                    v.setNombre(request.nombre().trim());
                    v.setApellido(request.apellido().trim());
                    if (StringUtils.hasText(request.telefono())) {
                        v.setTelefono(request.telefono().trim());
                    }
                    v.setTotalVisitas(v.getTotalVisitas() + 1);
                    v.setUltimaVisitaAt(Instant.now());
                    return visitanteRepository.save(v);
                })
                .orElseGet(() -> {
                    Visitante nuevo = Visitante.builder()
                            .rut(rut)
                            .nombre(request.nombre().trim())
                            .apellido(request.apellido().trim())
                            .telefono(StringUtils.hasText(request.telefono()) ? request.telefono().trim() : null)
                            .totalVisitas(1)
                            .ultimaVisitaAt(Instant.now())
                            .build();
                    return visitanteRepository.save(nuevo);
                });

        EstadoVisita estadoInicial = request.estadoInicial() != null ? request.estadoInicial() : EstadoVisita.EN_ESPERA;
        Instant checkIn = (estadoInicial == EstadoVisita.AUTORIZADO) ? Instant.now() : null;

        RegistroVisita registro = RegistroVisita.builder()
                .visitante(visitante)
                .departamento(depto)
                .estado(estadoInicial)
                .checkInAt(checkIn)
                .observaciones(request.observaciones())
                .registradoPor(usuarioConserje)
                .fechaCreacion(Instant.now())
                .build();

        return VisitaDto.fromEntity(registroVisitaRepository.save(registro));
    }

    @Transactional
    public VisitaDto autorizarVisita(Long id) {
        RegistroVisita registro = registroVisitaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visita no encontrada con ID: " + id));

        if (registro.getEstado() != EstadoVisita.EN_ESPERA) {
            throw new BusinessRuleException("Solo se pueden autorizar visitas en estado EN_ESPERA. Estado actual: " + registro.getEstado());
        }

        registro.setEstado(EstadoVisita.AUTORIZADO);
        registro.setCheckInAt(Instant.now());
        return VisitaDto.fromEntity(registroVisitaRepository.save(registro));
    }

    @Transactional
    public VisitaDto rechazarVisita(Long id, RechazarVisitaRequest request) {
        RegistroVisita registro = registroVisitaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visita no encontrada con ID: " + id));

        if (registro.getEstado() != EstadoVisita.EN_ESPERA) {
            throw new BusinessRuleException("Solo se pueden rechazar visitas en estado EN_ESPERA. Estado actual: " + registro.getEstado());
        }

        registro.setEstado(EstadoVisita.RECHAZADO);
        registro.setMotivoRechazo(request.motivoRechazo().trim());
        return VisitaDto.fromEntity(registroVisitaRepository.save(registro));
    }

    @Transactional
    public VisitaDto finalizarVisita(Long id) {
        RegistroVisita registro = registroVisitaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visita no encontrada con ID: " + id));

        if (registro.getEstado() != EstadoVisita.AUTORIZADO) {
            throw new BusinessRuleException("Solo se pueden finalizar visitas en estado AUTORIZADO (dentro del edificio). Estado actual: " + registro.getEstado());
        }

        registro.setEstado(EstadoVisita.FINALIZADO);
        registro.setCheckOutAt(Instant.now());
        return VisitaDto.fromEntity(registroVisitaRepository.save(registro));
    }

    @Transactional(readOnly = true)
    public List<VisitaDto> listarVisitasActivas() {
        return registroVisitaRepository.findByEstadoInOrderByFechaCreacionDesc(
                Arrays.asList(EstadoVisita.EN_ESPERA, EstadoVisita.AUTORIZADO)
        ).stream().map(VisitaDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<VisitaDto> listarHistorico(Long deptoId, EstadoVisita estado, Instant desde, Instant hasta) {
        return registroVisitaRepository.buscarConFiltros(deptoId, estado, desde, hasta).stream()
                .map(VisitaDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public VisitaDto obtenerPorId(Long id) {
        RegistroVisita registro = registroVisitaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visita no encontrada con ID: " + id));
        return VisitaDto.fromEntity(registro);
    }
}
