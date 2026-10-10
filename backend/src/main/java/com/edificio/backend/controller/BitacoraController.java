package com.edificio.backend.controller;

import com.edificio.backend.model.dto.RegistroBitacoraDto;
import com.edificio.backend.model.entity.CategoriaBitacora;
import com.edificio.backend.model.request.CrearBitacoraRequest;
import com.edificio.backend.service.BitacoraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bitacora")
@RequiredArgsConstructor
public class BitacoraController {

    private final BitacoraService bitacoraService;

    @PostMapping
    public ResponseEntity<RegistroBitacoraDto> registrar(
            @Valid @RequestBody CrearBitacoraRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "CONSERJE";
        return ResponseEntity.status(HttpStatus.CREATED).body(bitacoraService.registrarNovedad(request, username));
    }

    @GetMapping
    public ResponseEntity<List<RegistroBitacoraDto>> listar(
            @RequestParam(required = false) CategoriaBitacora categoria,
            @RequestParam(required = false) Boolean soloAlertas
    ) {
        return ResponseEntity.ok(bitacoraService.listarNovedades(categoria, soloAlertas));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        bitacoraService.eliminarRegistro(id);
        return ResponseEntity.noContent().build();
    }
}
