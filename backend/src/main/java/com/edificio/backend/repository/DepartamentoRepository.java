package com.edificio.backend.repository;

import com.edificio.backend.model.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {

    Optional<Departamento> findByNumero(String numero);

    boolean existsByNumero(String numero);

    List<Departamento> findByActivoTrueOrderByPisoAscNumeroAsc();

    List<Departamento> findAllByOrderByPisoAscNumeroAsc();

    @Query("SELECT d FROM Departamento d WHERE d.activo = true AND " +
           "(LOWER(d.numero) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.torre) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY d.piso ASC, d.numero ASC")
    List<Departamento> buscarPorNumeroOTorre(@Param("query") String query);
}
