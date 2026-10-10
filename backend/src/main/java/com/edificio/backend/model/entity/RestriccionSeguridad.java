package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "restricciones_seguridad", indexes = {
        @Index(name = "idx_restriccion_rut", columnList = "rut")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestriccionSeguridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 25)
    private String rut;

    @Column(nullable = false, length = 150)
    private String nombreCompleto;

    @Column(nullable = false, length = 500)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoRestriccion tipoRestriccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private Departamento departamento;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant fechaRegistro = Instant.now();

    @Column(length = 80)
    private String registradoPor;
}
