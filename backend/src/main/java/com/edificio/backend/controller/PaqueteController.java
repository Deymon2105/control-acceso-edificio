package com.edificio.backend.controller;

import com.edificio.backend.model.dto.PaqueteDto;
import com.edificio.backend.model.request.CrearPaqueteRequest;
import com.edificio.backend.model.request.EntregarPaqueteRequest;
import com.edificio.backend.service.PaqueteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paquetes")
@RequiredArgsConstructor
public class PaqueteController {

    private final PaqueteService paqueteService;

    @PostMapping
    public ResponseEntity<PaqueteDto> registrar(
            @Valid @RequestBody CrearPaqueteRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "CONSERJE";
        return ResponseEntity.status(HttpStatus.CREATED).body(paqueteService.registrarPaquete(request, username));
    }

    @PutMapping("/{id}/entregar")
    public ResponseEntity<PaqueteDto> entregar(
            @PathVariable Long id,
            @Valid @RequestBody EntregarPaqueteRequest request
    ) {
        return ResponseEntity.ok(paqueteService.entregarPaquete(id, request));
    }

    @GetMapping("/en-custodia")
    public ResponseEntity<List<PaqueteDto>> listarEnCustodia() {
        return ResponseEntity.ok(paqueteService.listarEnCustodia());
    }

    @GetMapping("/departamento/{departamentoId}")
    public ResponseEntity<List<PaqueteDto>> listarPorDepartamento(@PathVariable Long departamentoId) {
        return ResponseEntity.ok(paqueteService.listarPorDepartamento(departamentoId));
    }

    @GetMapping
    public ResponseEntity<List<PaqueteDto>> listarHistorico() {
        return ResponseEntity.ok(paqueteService.listarHistorico());
    }
}
