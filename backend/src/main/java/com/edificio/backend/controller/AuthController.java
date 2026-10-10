package com.edificio.backend.controller;

import com.edificio.backend.model.dto.LoginResponseDto;
import com.edificio.backend.model.dto.UsuarioDto;
import com.edificio.backend.model.request.LoginRequest;
import com.edificio.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequest request) {
        LoginResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDto> me() {
        UsuarioDto usuario = authService.getCurrentUser();
        return ResponseEntity.ok(usuario);
    }
}
