package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "residentes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Residente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String apellido;

    @Column(length = 20)
    private String rut;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(length = 100)
    private String email;

    @Builder.Default
    @Column(nullable = false)
    private boolean esTitular = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
}
