package com.edificio.backend.service;

import com.edificio.backend.exception.BusinessRuleException;
import com.edificio.backend.exception.ResourceNotFoundException;
import com.edificio.backend.model.dto.LoginResponseDto;
import com.edificio.backend.model.dto.UsuarioDto;
import com.edificio.backend.model.entity.Usuario;
import com.edificio.backend.model.request.LoginRequest;
import com.edificio.backend.repository.UsuarioRepository;
import com.edificio.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    @Transactional
    public LoginResponseDto login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + request.username()));

        if (!usuario.isActivo()) {
            throw new BusinessRuleException("La cuenta de usuario está desactivada.");
        }

        usuario.setUltimoAcceso(Instant.now());
        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario.getUsername(), usuario.getRol(), usuario.getNombreCompleto());

        return new LoginResponseDto(
                token,
                usuario.getUsername(),
                usuario.getNombreCompleto(),
                usuario.getRol()
        );
    }

    @Transactional(readOnly = true)
    public UsuarioDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BusinessRuleException("No hay sesión activa.");
        }

        String username = auth.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario actual no encontrado"));

        return UsuarioDto.fromEntity(usuario);
    }
}
