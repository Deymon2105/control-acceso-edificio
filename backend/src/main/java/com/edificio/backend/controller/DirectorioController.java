package com.edificio.backend.controller;

import com.edificio.backend.model.dto.DepartamentoDto;
import com.edificio.backend.model.dto.DirectorioItemDto;
import com.edificio.backend.model.dto.ResidenteDto;
import com.edificio.backend.model.request.ActualizarDepartamentoRequest;
import com.edificio.backend.model.request.CrearDepartamentoRequest;
import com.edificio.backend.model.request.CrearResidenteRequest;
import com.edificio.backend.service.DirectorioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departamentos")
@RequiredArgsConstructor
public class DirectorioController {

    private final DirectorioService directorioService;

    @GetMapping("/directorio")
    public ResponseEntity<List<DirectorioItemDto>> buscarDirectorio(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(directorioService.buscarDirectorio(q));
    }

    @GetMapping("/numero/{numero}")
    public ResponseEntity<DirectorioItemDto> obtenerPorNumero(@PathVariable String numero) {
        return ResponseEntity.ok(directorioService.obtenerPorNumero(numero));
    }

    @GetMapping
    public ResponseEntity<List<DepartamentoDto>> listarTodos() {
        return ResponseEntity.ok(directorioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartamentoDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(directorioService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartamentoDto> crear(@Valid @RequestBody CrearDepartamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(directorioService.crearDepartamento(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartamentoDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarDepartamentoRequest request
    ) {
        return ResponseEntity.ok(directorioService.actualizarDepartamento(id, request));
    }

    @PostMapping("/residentes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResidenteDto> agregarResidente(@Valid @RequestBody CrearResidenteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(directorioService.agregarResidente(request));
    }

    @DeleteMapping("/residentes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivarResidente(@PathVariable Long id) {
        directorioService.desactivarResidente(id);
        return ResponseEntity.noContent().build();
    }
}
