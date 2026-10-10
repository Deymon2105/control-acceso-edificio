package com.edificio.backend.repository;

import com.edificio.backend.model.entity.RestriccionSeguridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestriccionSeguridadRepository extends JpaRepository<RestriccionSeguridad, Long> {

    List<RestriccionSeguridad> findByActivoTrueOrderByFechaRegistroDesc();

    @Query("SELECT r FROM RestriccionSeguridad r WHERE r.activo = true AND " +
           "(REPLACE(REPLACE(LOWER(r.rut), '.', ''), '-', '') = :rutLimpio OR " +
           "LOWER(r.rut) = :rutOriginal)")
    Optional<RestriccionSeguridad> buscarPorRutActivo(@Param("rutLimpio") String rutLimpio, @Param("rutOriginal") String rutOriginal);

    @Query("SELECT r FROM RestriccionSeguridad r WHERE r.activo = true AND " +
           "(LOWER(r.rut) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.nombreCompleto) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<RestriccionSeguridad> buscarPorRutONombre(@Param("query") String query);
}
