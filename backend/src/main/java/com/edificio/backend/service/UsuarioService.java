package com.edificio.backend.service;

import com.edificio.backend.exception.BusinessRuleException;
import com.edificio.backend.exception.ResourceNotFoundException;
import com.edificio.backend.model.dto.UsuarioDto;
import com.edificio.backend.model.entity.Usuario;
import com.edificio.backend.model.request.CambiarPasswordRequest;
import com.edificio.backend.model.request.CrearUsuarioRequest;
import com.edificio.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioDto> listarUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return UsuarioDto.fromEntity(usuario);
    }

    @Transactional
    public UsuarioDto crearUsuario(CrearUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.username())) {
            throw new BusinessRuleException("El nombre de usuario '" + request.username() + "' ya está en uso.");
        }

        Usuario usuario = Usuario.builder()
                .username(request.username().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .nombreCompleto(request.nombreCompleto().trim())
                .rol(request.rol())
                .activo(true)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioDto.fromEntity(guardado);
    }

    @Transactional
    public void cambiarPassword(Long id, CambiarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        if (!passwordEncoder.matches(request.passwordActual(), usuario.getPassword())) {
            throw new BusinessRuleException("La contraseña actual no es correcta.");
        }

        usuario.setPassword(passwordEncoder.encode(request.nuevoPassword()));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public UsuarioDto cambiarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        usuario.setActivo(activo);
        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioDto.fromEntity(guardado);
    }
}
