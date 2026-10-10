package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "deliveries_piso", indexes = {
        @Index(name = "idx_delivery_estado", columnList = "estado"),
        @Index(name = "idx_delivery_ingreso", columnList = "horaIngreso")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String empresa;

    @Column(nullable = false, length = 120)
    private String nombreRepartidor;

    @Column(length = 25)
    private String rutRepartidor;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Builder.Default
    @Column(nullable = false)
    private Instant horaIngreso = Instant.now();

    private Instant horaSalida;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private EstadoDelivery estado = EstadoDelivery.EN_TRANSITO;

    @Column(length = 300)
    private String notas;

    @Column(length = 80)
    private String registradoPor;
}
