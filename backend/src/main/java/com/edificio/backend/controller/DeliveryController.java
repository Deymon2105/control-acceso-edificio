package com.edificio.backend.controller;

import com.edificio.backend.model.dto.DeliveryPisoDto;
import com.edificio.backend.model.request.CrearDeliveryPisoRequest;
import com.edificio.backend.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<DeliveryPisoDto> registrar(
            @Valid @RequestBody CrearDeliveryPisoRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "CONSERJE";
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryService.registrarDelivery(request, username));
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<DeliveryPisoDto> finalizar(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.finalizarDelivery(id));
    }

    @GetMapping("/activos")
    public ResponseEntity<List<DeliveryPisoDto>> listarActivos() {
        return ResponseEntity.ok(deliveryService.listarActivos());
    }

    @GetMapping
    public ResponseEntity<List<DeliveryPisoDto>> listarHistorico() {
        return ResponseEntity.ok(deliveryService.listarHistorico());
    }
}
