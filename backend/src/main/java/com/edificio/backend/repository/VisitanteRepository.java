package com.edificio.backend.repository;

import com.edificio.backend.model.entity.Visitante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VisitanteRepository extends JpaRepository<Visitante, Long> {

    @Query("SELECT v FROM Visitante v WHERE " +
           "REPLACE(REPLACE(LOWER(v.rut), '.', ''), '-', '') = :rutLimpio OR " +
           "LOWER(v.rut) = :rutOriginal")
    Optional<Visitante> buscarPorRut(@Param("rutLimpio") String rutLimpio, @Param("rutOriginal") String rutOriginal);
}
