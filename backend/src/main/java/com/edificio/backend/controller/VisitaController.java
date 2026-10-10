package com.edificio.backend.controller;

import com.edificio.backend.model.dto.BuscarRutResponseDto;
import com.edificio.backend.model.dto.VisitaDto;
import com.edificio.backend.model.entity.EstadoVisita;
import com.edificio.backend.model.request.RechazarVisitaRequest;
import com.edificio.backend.model.request.RegistrarVisitaRequest;
import com.edificio.backend.service.VisitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/visitas")
@RequiredArgsConstructor
public class VisitaController {

    private final VisitaService visitaService;

    @GetMapping("/buscar-rut/{rut}")
    public ResponseEntity<BuscarRutResponseDto> buscarPorRut(@PathVariable String rut) {
        return ResponseEntity.ok(visitaService.buscarPorRut(rut));
    }

    @PostMapping
    public ResponseEntity<VisitaDto> registrar(
            @Valid @RequestBody RegistrarVisitaRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "CONSERJE";
        VisitaDto dto = visitaService.registrarVisita(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}/autorizar")
    public ResponseEntity<VisitaDto> autorizar(@PathVariable Long id) {
        return ResponseEntity.ok(visitaService.autorizarVisita(id));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<VisitaDto> rechazar(
            @PathVariable Long id,
            @Valid @RequestBody RechazarVisitaRequest request
    ) {
        return ResponseEntity.ok(visitaService.rechazarVisita(id, request));
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<VisitaDto> finalizar(@PathVariable Long id) {
        return ResponseEntity.ok(visitaService.finalizarVisita(id));
    }

    @GetMapping("/activas")
    public ResponseEntity<List<VisitaDto>> listarActivas() {
        return ResponseEntity.ok(visitaService.listarVisitasActivas());
    }

    @GetMapping
    public ResponseEntity<List<VisitaDto>> listarHistorico(
            @RequestParam(required = false) Long departamentoId,
            @RequestParam(required = false) EstadoVisita estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant hasta
    ) {
        return ResponseEntity.ok(visitaService.listarHistorico(departamentoId, estado, desde, hasta));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitaDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(visitaService.obtenerPorId(id));
    }
}
