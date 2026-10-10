package com.edificio.backend.repository;

import com.edificio.backend.model.entity.EstadoVisita;
import com.edificio.backend.model.entity.RegistroVisita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface RegistroVisitaRepository extends JpaRepository<RegistroVisita, Long> {

    List<RegistroVisita> findByEstadoInOrderByFechaCreacionDesc(Collection<EstadoVisita> estados);

    List<RegistroVisita> findByEstadoOrderByCheckInAtDesc(EstadoVisita estado);

    long countByEstado(EstadoVisita estado);

    @Query("SELECT r FROM RegistroVisita r WHERE " +
           "(:departamentoId IS NULL OR r.departamento.id = :departamentoId) AND " +
           "(:estado IS NULL OR r.estado = :estado) AND " +
           "(:desde IS NULL OR r.fechaCreacion >= :desde) AND " +
           "(:hasta IS NULL OR r.fechaCreacion <= :hasta) " +
           "ORDER BY r.fechaCreacion DESC")
    List<RegistroVisita> buscarConFiltros(
            @Param("departamentoId") Long departamentoId,
            @Param("estado") EstadoVisita estado,
            @Param("desde") Instant desde,
            @Param("hasta") Instant hasta
    );
}
