package com.edificio.backend.service;

import com.edificio.backend.model.dto.RegistroBitacoraDto;
import com.edificio.backend.model.entity.CategoriaBitacora;
import com.edificio.backend.model.entity.RegistroBitacora;
import com.edificio.backend.model.request.CrearBitacoraRequest;
import com.edificio.backend.repository.RegistroBitacoraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BitacoraService {

    private final RegistroBitacoraRepository bitacoraRepository;

    @Transactional
    public RegistroBitacoraDto registrarNovedad(CrearBitacoraRequest request, String usuarioNombre) {
        RegistroBitacora registro = RegistroBitacora.builder()
                .fechaHora(Instant.now())
                .categoria(request.categoria())
                .descripcion(request.descripcion().trim())
                .esAlerta(Boolean.TRUE.equals(request.esAlerta()))
                .usuarioNombre(usuarioNombre)
                .turno(request.turno() != null ? request.turno().trim() : null)
                .build();

        return RegistroBitacoraDto.fromEntity(bitacoraRepository.save(registro));
    }

    @Transactional(readOnly = true)
    public List<RegistroBitacoraDto> listarNovedades(CategoriaBitacora categoria, Boolean soloAlertas) {
        List<RegistroBitacora> lista;

        if (Boolean.TRUE.equals(soloAlertas)) {
            lista = bitacoraRepository.findByEsAlertaTrueOrderByFechaHoraDesc();
        } else if (categoria != null) {
            lista = bitacoraRepository.findByCategoriaOrderByFechaHoraDesc(categoria);
        } else {
            lista = bitacoraRepository.findAllByOrderByFechaHoraDesc();
        }

        return lista.stream()
                .map(RegistroBitacoraDto::fromEntity)
                .toList();
    }

    @Transactional
    public void eliminarRegistro(Long id) {
        if (!bitacoraRepository.existsById(id)) {
            throw new com.edificio.backend.exception.ResourceNotFoundException("Registro de bitácora no encontrado con ID: " + id);
        }
        bitacoraRepository.deleteById(id);
    }
}
