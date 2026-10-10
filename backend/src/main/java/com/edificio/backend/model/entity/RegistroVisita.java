package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "registros_visitas", indexes = {
        @Index(name = "idx_visita_estado", columnList = "estado"),
        @Index(name = "idx_visita_checkin", columnList = "checkInAt"),
        @Index(name = "idx_visita_fecha", columnList = "fechaCreacion")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroVisita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "visitante_id", nullable = false)
    private Visitante visitante;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoVisita estado;

    private Instant checkInAt;

    private Instant checkOutAt;

    @Column(length = 300)
    private String motivoRechazo;

    @Column(length = 500)
    private String observaciones;

    @Column(length = 80)
    private String registradoPor;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();
}
