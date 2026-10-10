package com.edificio.backend.repository;

import com.edificio.backend.model.entity.EstadoPaquete;
import com.edificio.backend.model.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaqueteRepository extends JpaRepository<Paquete, Long> {

    List<Paquete> findByEstadoOrderByFechaRecepcionDesc(EstadoPaquete estado);

    List<Paquete> findByDepartamentoIdOrderByFechaRecepcionDesc(Long departamentoId);

    List<Paquete> findAllByOrderByFechaRecepcionDesc();

    long countByEstado(EstadoPaquete estado);
}
