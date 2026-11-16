package com.edificio.backend;

import com.edificio.backend.model.dto.RegistroBitacoraDto;
import com.edificio.backend.model.entity.CategoriaBitacora;
import com.edificio.backend.model.request.CrearBitacoraRequest;
import com.edificio.backend.service.BitacoraService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class BitacoraServiceTest {

    @Autowired
    private BitacoraService bitacoraService;

    @Test
    @DisplayName("Debe registrar y luego eliminar una novedad de la bitacora")
    void testRegistrarYEliminarNovedad() {
        CrearBitacoraRequest request = new CrearBitacoraRequest(
                CategoriaBitacora.GENERAL,
                "Registro de prueba que sera eliminado",
                false,
                "Tarde"
        );

        RegistroBitacoraDto creada = bitacoraService.registrarNovedad(request, "conserje_test");
        assertNotNull(creada.id());

        // Eliminar
        bitacoraService.eliminarRegistro(creada.id());

        // Verificar que ya no exista
        List<RegistroBitacoraDto> lista = bitacoraService.listarNovedades(null, null);
        assertTrue(lista.stream().noneMatch(r -> r.id().equals(creada.id())));
    }
}
