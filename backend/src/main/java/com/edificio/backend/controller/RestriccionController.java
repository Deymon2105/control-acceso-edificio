package com.edificio.backend.controller;

import com.edificio.backend.model.dto.RestriccionDto;
import com.edificio.backend.model.dto.VerificacionRestriccionDto;
import com.edificio.backend.model.request.CrearRestriccionRequest;
import com.edificio.backend.service.RestriccionSeguridadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restricciones")
@RequiredArgsConstructor
public class RestriccionController {

    private final RestriccionSeguridadService restriccionService;

    @GetMapping("/verificar/{rut}")
    public ResponseEntity<VerificacionRestriccionDto> verificar(@PathVariable String rut) {
        return ResponseEntity.ok(restriccionService.verificarRut(rut));
    }

    @GetMapping
    public ResponseEntity<List<RestriccionDto>> listar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(restriccionService.buscar(q));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestriccionDto> crear(
            @Valid @RequestBody CrearRestriccionRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "ADMIN";
        return ResponseEntity.status(HttpStatus.CREATED).body(restriccionService.crearRestriccion(request, username));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        restriccionService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
