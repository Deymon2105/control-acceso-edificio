package com.edificio.backend;

import com.edificio.backend.exception.BusinessRuleException;
import com.edificio.backend.exception.SecurityRestrictionException;
import com.edificio.backend.model.dto.BuscarRutResponseDto;
import com.edificio.backend.model.dto.VisitaDto;
import com.edificio.backend.model.entity.Departamento;
import com.edificio.backend.model.entity.EstadoVisita;
import com.edificio.backend.model.request.RechazarVisitaRequest;
import com.edificio.backend.model.request.RegistrarVisitaRequest;
import com.edificio.backend.repository.DepartamentoRepository;
import com.edificio.backend.repository.RegistroVisitaRepository;
import com.edificio.backend.service.VisitaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class VisitaServiceTest {

    @Autowired
    private VisitaService visitaService;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Autowired
    private RegistroVisitaRepository registroVisitaRepository;

    @Test
    @DisplayName("Debe registrar visita en espera y luego autorizarla registrando checkInAt")
    void testFlujoVisitaAutorizada() {
        Departamento depto = departamentoRepository.findByNumero("104").orElseThrow();

        RegistrarVisitaRequest request = new RegistrarVisitaRequest(
                "19.876.543-2",
                "Juan",
                "Pérez",
                "+56 9 1122 3344",
                depto.getId(),
                EstadoVisita.EN_ESPERA,
                "Visita de prueba"
        );

        VisitaDto creada = visitaService.registrarVisita(request, "conserje_test");
        assertNotNull(creada.id());
        assertEquals(EstadoVisita.EN_ESPERA, creada.estado());
        assertNull(creada.checkInAt());

        // Autorizar
        VisitaDto autorizada = visitaService.autorizarVisita(creada.id());
        assertEquals(EstadoVisita.AUTORIZADO, autorizada.estado());
        assertNotNull(autorizada.checkInAt());

        // Finalizar
        VisitaDto finalizada = visitaService.finalizarVisita(autorizada.id());
        assertEquals(EstadoVisita.FINALIZADO, finalizada.estado());
        assertNotNull(finalizada.checkOutAt());
    }

    @Test
    @DisplayName("Debe rechazar visita en espera y guardar motivo")
    void testRechazarVisita() {
        Departamento depto = departamentoRepository.findByNumero("101").orElseThrow();

        RegistrarVisitaRequest request = new RegistrarVisitaRequest(
                "20.123.456-7",
                "Pedro",
                "González",
                null,
                depto.getId(),
                EstadoVisita.EN_ESPERA,
                "Revisión"
        );

        VisitaDto creada = visitaService.registrarVisita(request, "conserje_test");

        RechazarVisitaRequest rechazo = new RechazarVisitaRequest("Residente no contestó citófono");
        VisitaDto rechazada = visitaService.rechazarVisita(creada.id(), rechazo);

        assertEquals(EstadoVisita.RECHAZADO, rechazada.estado());
        assertEquals("Residente no contestó citófono", rechazada.motivoRechazo());
    }

    @Test
    @DisplayName("No debe permitir finalizar una visita que no ha sido autorizada")
    void testTransicionInvalidaFinalizar() {
        Departamento depto = departamentoRepository.findByNumero("101").orElseThrow();

        RegistrarVisitaRequest request = new RegistrarVisitaRequest(
                "21.456.789-1",
                "Rosa",
                "Vargas",
                null,
                depto.getId(),
                EstadoVisita.EN_ESPERA,
                "Trámite"
        );

        VisitaDto creada = visitaService.registrarVisita(request, "conserje_test");

        assertThrows(BusinessRuleException.class, () -> visitaService.finalizarVisita(creada.id()));
    }

    @Test
    @DisplayName("Debe bloquear intento de visita si el RUT tiene orden judicial / restricción BLOQUEO_TOTAL")
    void testBloqueoSeguridadRUT() {
        Departamento depto = departamentoRepository.findByNumero("202").orElseThrow();

        // 11.111.111-1 tiene orden judicial precargada en DataInitializer
        RegistrarVisitaRequest request = new RegistrarVisitaRequest(
                "11.111.111-1",
                "Manuel",
                "Castro",
                null,
                depto.getId(),
                EstadoVisita.EN_ESPERA,
                "Intento de acceso"
        );

        SecurityRestrictionException ex = assertThrows(SecurityRestrictionException.class,
                () -> visitaService.registrarVisita(request, "conserje_test"));

        assertTrue(ex.getMessage().contains("ALERTA DE SEGURIDAD CRÍTICA"));
    }

    @Test
    @DisplayName("Debe autocompletar datos de visitante recurrente e incrementar contador")
    void testAutocompletadoRecurrente() {
        // Sebastián Pinto ya está precargado con RUT 17.345.678-9
        BuscarRutResponseDto busqueda = visitaService.buscarPorRut("17.345.678-9");

        assertTrue(busqueda.existeHistorico());
        assertEquals("Sebastián", busqueda.nombre());
        assertEquals("Pinto Rojas", busqueda.apellido());
        assertTrue(busqueda.totalVisitasHistoricas() >= 3);
        assertFalse(busqueda.restriccion().tieneRestriccion());
    }
}
