package com.edificio.backend.model.request;

import com.edificio.backend.model.entity.EstadoVisita;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrarVisitaRequest(
        @NotBlank(message = "El RUT o documento del visitante es obligatorio")
        String rut,

        @NotBlank(message = "El nombre del visitante es obligatorio")
        String nombre,

        @NotBlank(message = "El apellido del visitante es obligatorio")
        String apellido,

        String telefono,

        @NotNull(message = "El departamento de destino es obligatorio")
        Long departamentoId,

        EstadoVisita estadoInicial,

        String observaciones
) {}
