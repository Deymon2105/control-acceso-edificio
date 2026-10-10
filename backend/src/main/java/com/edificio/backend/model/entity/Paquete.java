package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "paquetes_custodia", indexes = {
        @Index(name = "idx_paquete_estado", columnList = "estado"),
        @Index(name = "idx_paquete_codigo", columnList = "codigoUbicacion")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paquete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String codigoUbicacion;

    @Column(length = 60)
    private String codigoSeguimiento;

    @Column(nullable = false, length = 80)
    private String empresaTransporte;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Column(length = 300)
    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private Instant fechaRecepcion = Instant.now();

    private Instant fechaEntrega;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private EstadoPaquete estado = EstadoPaquete.RECIBIDO_EN_CONSERJERIA;

    @Column(length = 120)
    private String retiradoPor;

    @Column(length = 80)
    private String recepcionadoPor;

    @Column(length = 300)
    private String notas;
}
