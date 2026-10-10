package com.edificio.backend.repository;

import com.edificio.backend.model.entity.Residente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResidenteRepository extends JpaRepository<Residente, Long> {
    List<Residente> findByDepartamentoIdAndActivoTrue(Long departamentoId);
    Optional<Residente> findByRut(String rut);
}
