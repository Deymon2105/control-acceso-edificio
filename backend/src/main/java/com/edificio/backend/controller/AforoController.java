package com.edificio.backend.controller;

import com.edificio.backend.model.dto.PersonaEnEdificioDto;
import com.edificio.backend.model.dto.ResumenAforoDto;
import com.edificio.backend.service.AforoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/aforo")
@RequiredArgsConstructor
public class AforoController {

    private final AforoService aforoService;

    @GetMapping("/actual")
    public ResponseEntity<ResumenAforoDto> obtenerResumen() {
        return ResponseEntity.ok(aforoService.obtenerResumen());
    }

    @GetMapping("/personas")
    public ResponseEntity<List<PersonaEnEdificioDto>> obtenerPersonas() {
        return ResponseEntity.ok(aforoService.obtenerPersonasDentro());
    }

    @GetMapping(value = "/manifiesto-csv", produces = "text/csv")
    public ResponseEntity<byte[]> descargarManifiestoCsv() {
        String csv = aforoService.generarManifiestoCsv();
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"manifiesto-evacuacion-aforo.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
