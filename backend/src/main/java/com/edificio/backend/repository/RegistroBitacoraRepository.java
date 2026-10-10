package com.edificio.backend.repository;

import com.edificio.backend.model.entity.CategoriaBitacora;
import com.edificio.backend.model.entity.RegistroBitacora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroBitacoraRepository extends JpaRepository<RegistroBitacora, Long> {

    List<RegistroBitacora> findAllByOrderByFechaHoraDesc();

    List<RegistroBitacora> findByCategoriaOrderByFechaHoraDesc(CategoriaBitacora categoria);

    List<RegistroBitacora> findByEsAlertaTrueOrderByFechaHoraDesc();
}
