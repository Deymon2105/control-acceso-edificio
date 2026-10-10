package com.edificio.backend;

import com.edificio.backend.model.dto.DirectorioItemDto;
import com.edificio.backend.service.DirectorioService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class DirectorioServiceTest {

    @Autowired
    private DirectorioService directorioService;

    @Test
    @DisplayName("Debe encontrar departamento 104 con sus notas operativas y residente titular")
    void testDirectorio104() {
        DirectorioItemDto item = directorioService.obtenerPorNumero("104");

        assertNotNull(item);
        assertEquals("104", item.numero());
        assertEquals(1, item.piso());
        assertEquals("Rodrigo Morales Fuentes", item.nombreTitular());
        assertEquals("+56 9 9123 4567", item.telefonoTitular());
        assertTrue(item.notasOperativas().contains("No llamar después de las 22:00"));
        assertTrue(item.advertenciaSeguridad().contains("asamblea ordinaria"));
        assertEquals(2, item.todosResidentes().size());
    }

    @Test
    @DisplayName("Debe listar directorio filtrado por query predictivo")
    void testBuscarDirectorio() {
        List<DirectorioItemDto> resultados = directorioService.buscarDirectorio("10");

        assertFalse(resultados.isEmpty());
        assertTrue(resultados.stream().anyMatch(d -> d.numero().equals("101")));
        assertTrue(resultados.stream().anyMatch(d -> d.numero().equals("104")));
    }
}
