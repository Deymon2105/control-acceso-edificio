package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 120)
    private String nombreCompleto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    private Instant ultimoAcceso;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();
}
