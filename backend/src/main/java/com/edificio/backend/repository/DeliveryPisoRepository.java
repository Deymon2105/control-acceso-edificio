package com.edificio.backend.repository;

import com.edificio.backend.model.entity.DeliveryPiso;
import com.edificio.backend.model.entity.EstadoDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryPisoRepository extends JpaRepository<DeliveryPiso, Long> {

    List<DeliveryPiso> findByEstadoOrderByHoraIngresoDesc(EstadoDelivery estado);

    List<DeliveryPiso> findAllByOrderByHoraIngresoDesc();

    long countByEstado(EstadoDelivery estado);
}
