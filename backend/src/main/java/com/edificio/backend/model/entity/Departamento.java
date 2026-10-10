package com.edificio.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(nullable = false)
    private Integer piso;

    @Column(length = 50)
    private String torre;

    @Column(length = 20)
    private String anexoCitofono;

    @Column(length = 30)
    private String telefonoFijo;

    @Column(length = 500)
    private String notasOperativas;

    @Column(length = 500)
    private String advertenciaSeguridad;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    @Builder.Default
    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Residente> residentes = new ArrayList<>();
}
