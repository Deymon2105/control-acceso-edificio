package com.edificio.backend;

import com.edificio.backend.model.dto.VerificacionRestriccionDto;
import com.edificio.backend.service.RestriccionSeguridadService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RestriccionSeguridadTest {

    @Autowired
    private RestriccionSeguridadService restriccionService;

    @Test
    @DisplayName("Debe detectar orden judicial de bloqueo total incluso si se ingresa RUT sin puntos ni guion")
    void testVerificarRutNormalizado() {
        // En DataInitializer el RUT guardado es "11.111.111-1"
        VerificacionRestriccionDto verificacion1 = restriccionService.verificarRut("11.111.111-1");
        assertTrue(verificacion1.tieneRestriccion());
        assertTrue(verificacion1.esBloqueoTotal());
        assertTrue(verificacion1.mensajeAlerta().contains("BLOQUEO MECÁNICO ACTIVO"));

        // Prueba con RUT sin formato: "111111111"
        VerificacionRestriccionDto verificacion2 = restriccionService.verificarRut("111111111");
        assertTrue(verificacion2.tieneRestriccion());
        assertTrue(verificacion2.esBloqueoTotal());
    }

    @Test
    @DisplayName("Debe retornar sin restricción para RUT limpio")
    void testRutLimpio() {
        VerificacionRestriccionDto verificacion = restriccionService.verificarRut("9.999.999-9");
        assertFalse(verificacion.tieneRestriccion());
        assertFalse(verificacion.esBloqueoTotal());
    }
}
