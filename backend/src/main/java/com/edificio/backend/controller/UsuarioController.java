package com.edificio.backend.controller;

import com.edificio.backend.model.dto.UsuarioDto;
import com.edificio.backend.model.request.CambiarPasswordRequest;
import com.edificio.backend.model.request.CrearUsuarioRequest;
import com.edificio.backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioDto>> listar() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioDto> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioDto nuevo = usuarioService.crearUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> cambiarPassword(
            @PathVariable Long id,
            @Valid @RequestBody CambiarPasswordRequest request
    ) {
        usuarioService.cambiarPassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<UsuarioDto> cambiarEstado(
            @PathVariable Long id,
            @RequestParam boolean activo
    ) {
        return ResponseEntity.ok(usuarioService.cambiarEstado(id, activo));
    }
}
