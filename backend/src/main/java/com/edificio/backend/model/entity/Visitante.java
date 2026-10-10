package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "visitantes", indexes = {
        @Index(name = "idx_visitante_rut", columnList = "rut", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 25)
    private String rut;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String apellido;

    @Column(length = 30)
    private String telefono;

    @Builder.Default
    @Column(nullable = false)
    private int totalVisitas = 1;

    private Instant ultimaVisitaAt;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant fechaRegistro = Instant.now();

    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
}
