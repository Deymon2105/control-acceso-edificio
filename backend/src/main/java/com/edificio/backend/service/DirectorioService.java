package com.edificio.backend.service;

import com.edificio.backend.exception.BusinessRuleException;
import com.edificio.backend.exception.ResourceNotFoundException;
import com.edificio.backend.model.dto.DepartamentoDto;
import com.edificio.backend.model.dto.DirectorioItemDto;
import com.edificio.backend.model.dto.ResidenteDto;
import com.edificio.backend.model.entity.Departamento;
import com.edificio.backend.model.entity.Residente;
import com.edificio.backend.model.request.ActualizarDepartamentoRequest;
import com.edificio.backend.model.request.CrearDepartamentoRequest;
import com.edificio.backend.model.request.CrearResidenteRequest;
import com.edificio.backend.repository.DepartamentoRepository;
import com.edificio.backend.repository.ResidenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DirectorioService {

    private final DepartamentoRepository departamentoRepository;
    private final ResidenteRepository residenteRepository;

    @Transactional(readOnly = true)
    public List<DirectorioItemDto> buscarDirectorio(String query) {
        List<Departamento> deptos;
        if (!StringUtils.hasText(query)) {
            deptos = departamentoRepository.findByActivoTrueOrderByPisoAscNumeroAsc();
        } else {
            deptos = departamentoRepository.buscarPorNumeroOTorre(query.trim());
        }
        return deptos.stream()
                .map(DirectorioItemDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DirectorioItemDto obtenerPorNumero(String numero) {
        Departamento depto = departamentoRepository.findByNumero(numero.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado con número: " + numero));
        return DirectorioItemDto.fromEntity(depto);
    }

    @Transactional(readOnly = true)
    public DepartamentoDto obtenerPorId(Long id) {
        Departamento depto = departamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado con ID: " + id));
        return DepartamentoDto.fromEntity(depto);
    }

    @Transactional(readOnly = true)
    public List<DepartamentoDto> listarTodos() {
        return departamentoRepository.findAllByOrderByPisoAscNumeroAsc().stream()
                .map(DepartamentoDto::fromEntity)
                .toList();
    }

    @Transactional
    public DepartamentoDto crearDepartamento(CrearDepartamentoRequest request) {
        String num = request.numero().trim();
        if (departamentoRepository.existsByNumero(num)) {
            throw new BusinessRuleException("Ya existe un departamento con el número '" + num + "'.");
        }

        Departamento depto = Departamento.builder()
                .numero(num)
                .piso(request.piso())
                .torre(request.torre() != null ? request.torre().trim() : null)
                .anexoCitofono(StringUtils.hasText(request.anexoCitofono()) ? request.anexoCitofono().trim() : num)
                .telefonoFijo(request.telefonoFijo() != null ? request.telefonoFijo().trim() : null)
                .notasOperativas(request.notasOperativas())
                .advertenciaSeguridad(request.advertenciaSeguridad())
                .activo(true)
                .build();

        return DepartamentoDto.fromEntity(departamentoRepository.save(depto));
    }

    @Transactional
    public DepartamentoDto actualizarDepartamento(Long id, ActualizarDepartamentoRequest request) {
        Departamento depto = departamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado con ID: " + id));

        depto.setPiso(request.piso());
        if (request.torre() != null) depto.setTorre(request.torre().trim());
        if (request.anexoCitofono() != null) depto.setAnexoCitofono(request.anexoCitofono().trim());
        if (request.telefonoFijo() != null) depto.setTelefonoFijo(request.telefonoFijo().trim());
        if (request.notasOperativas() != null) depto.setNotasOperativas(request.notasOperativas());
        if (request.advertenciaSeguridad() != null) depto.setAdvertenciaSeguridad(request.advertenciaSeguridad());
        if (request.activo() != null) depto.setActivo(request.activo());

        return DepartamentoDto.fromEntity(departamentoRepository.save(depto));
    }

    @Transactional
    public ResidenteDto agregarResidente(CrearResidenteRequest request) {
        Departamento depto = departamentoRepository.findById(request.departamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado con ID: " + request.departamentoId()));

        Residente residente = Residente.builder()
                .departamento(depto)
                .nombre(request.nombre().trim())
                .apellido(request.apellido().trim())
                .rut(request.rut() != null ? request.rut().trim() : null)
                .telefono(request.telefono().trim())
                .email(request.email() != null ? request.email().trim() : null)
                .esTitular(Boolean.TRUE.equals(request.esTitular()))
                .activo(true)
                .build();

        return ResidenteDto.fromEntity(residenteRepository.save(residente));
    }

    @Transactional
    public void desactivarResidente(Long id) {
        Residente residente = residenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Residente no encontrado con ID: " + id));
        residente.setActivo(false);
        residenteRepository.save(residente);
    }
}
