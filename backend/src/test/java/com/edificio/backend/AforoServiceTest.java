package com.edificio.backend;

import com.edificio.backend.model.dto.PersonaEnEdificioDto;
import com.edificio.backend.model.dto.ResumenAforoDto;
import com.edificio.backend.service.AforoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AforoServiceTest {

    @Autowired
    private AforoService aforoService;

    @Test
    @DisplayName("Debe contabilizar correctamente personas dentro del edificio (visitas autorizadas y deliveries en tránsito)")
    void testAforoActivo() {
        ResumenAforoDto resumen = aforoService.obtenerResumen();

        assertNotNull(resumen);
        assertTrue(resumen.totalPersonasEnEdificio() >= 2, "Debe tener al menos la visita y delivery precargados");
        assertTrue(resumen.totalVisitas() >= 1);
        assertTrue(resumen.totalDeliveries() >= 1);
        assertFalse(resumen.desglosePisos().isEmpty());

        List<PersonaEnEdificioDto> personas = aforoService.obtenerPersonasDentro();
        assertFalse(personas.isEmpty());

        String csv = aforoService.generarManifiestoCsv();
        assertNotNull(csv);
        assertTrue(csv.contains("TIPO,NOMBRE_COMPLETO,RUT,DEPARTAMENTO,PISO"));
        assertTrue(csv.contains("UberEats") || csv.contains("VISITA"));
    }
}
