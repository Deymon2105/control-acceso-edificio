package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "registros_bitacora", indexes = {
        @Index(name = "idx_bitacora_fecha", columnList = "fechaHora"),
        @Index(name = "idx_bitacora_categoria", columnList = "categoria")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroBitacora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant fechaHora = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoriaBitacora categoria;

    @Column(nullable = false, length = 1000)
    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private boolean esAlerta = false;

    @Column(nullable = false, length = 80)
    private String usuarioNombre;

    @Column(length = 50)
    private String turno;
}
