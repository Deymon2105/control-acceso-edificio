package com.edificio.backend.config;

import com.edificio.backend.model.entity.*;
import com.edificio.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final DepartamentoRepository departamentoRepository;
    private final ResidenteRepository residenteRepository;
    private final RestriccionSeguridadRepository restriccionRepository;
    private final VisitanteRepository visitanteRepository;
    private final RegistroVisitaRepository registroVisitaRepository;
    private final DeliveryPisoRepository deliveryRepository;
    private final PaqueteRepository paqueteRepository;
    private final RegistroBitacoraRepository bitacoraRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Inicializando datos base del sistema de control de acceso...");

        // 1. Usuarios iniciales (admin y conserje)
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombreCompleto("Administrador del Edificio")
                    .rol(RolUsuario.ADMIN)
                    .activo(true)
                    .build();

            Usuario conserje = Usuario.builder()
                    .username("conserje")
                    .password(passwordEncoder.encode("conserje123"))
                    .nombreCompleto("Conserje Turno Día")
                    .rol(RolUsuario.CONSERJE)
                    .activo(true)
                    .build();

            usuarioRepository.saveAll(List.of(admin, conserje));
            log.info("Usuarios creados: admin (admin123) y conserje (conserje123)");
        }

        // 2. Departamentos y Residentes (18 pisos x 4 departamentos = 72 departamentos)
        String[] nombresEjemplo = {"Carlos", "Rodrigo", "Camila", "Gonzalo", "Valentina", "Felipe", "Matías", "Constanza", "Diego", "Francisca", "Sebastián", "Carolina", "Javier", "Daniela", "Ignacio", "Fernanda", "Cristóbal", "Paula"};
        String[] apellidosEjemplo = {"Valenzuela", "Morales", "Pérez", "Araya", "Silva", "González", "Rojas", "Muñoz", "Castillo", "Contreras", "Sepúlveda", "López", "Tapia", "Fuentes", "Carrasco", "Vargas", "Navarro", "Soto"};

        for (int piso = 1; piso <= 18; piso++) {
            for (int deptoNum = 1; deptoNum <= 4; deptoNum++) {
                String num = String.format("%d%02d", piso, deptoNum);
                Departamento depto = departamentoRepository.findByNumero(num).orElse(null);

                if (depto == null) {
                    Departamento nuevo = Departamento.builder()
                            .numero(num)
                            .piso(piso)
                            .torre("Torre Central")
                            .anexoCitofono(num)
                            .telefonoFijo("22" + (2200000 + piso * 100 + deptoNum))
                            .activo(true)
                            .build();

                    if (num.equals("101")) {
                        nuevo.setNotasOperativas("Tiene mascota (perro golden). No tocar timbre fuerte, llamar a móvil.");
                    } else if (num.equals("104")) {
                        nuevo.setNotasOperativas("No llamar después de las 22:00. Autoriza delivery directo a puerta.");
                        nuevo.setAdvertenciaSeguridad("Citación pendiente de asamblea ordinaria de copropietarios.");
                    } else if (num.equals("202")) {
                        nuevo.setAdvertenciaSeguridad("Departamento judicializado. Exigir identificación rigurosa y no permitir ingreso de terceros sin autorización expresa.");
                    }

                    depto = departamentoRepository.save(nuevo);
                }

                // Asegurar residentes si el depto no tiene
                if (residenteRepository.findByDepartamentoIdAndActivoTrue(depto.getId()).isEmpty()) {
                    if (num.equals("104")) {
                        Residente r104_1 = Residente.builder()
                                .departamento(depto)
                                .nombre("Rodrigo")
                                .apellido("Morales Fuentes")
                                .rut("15.987.654-3")
                                .telefono("+56 9 9123 4567")
                                .email("rodrigo.morales@edificio.cl")
                                .esTitular(true)
                                .activo(true)
                                .build();
                        Residente r104_2 = Residente.builder()
                                .departamento(depto)
                                .nombre("Camila")
                                .apellido("Pérez Lagos")
                                .rut("16.123.456-7")
                                .telefono("+56 9 9876 5432")
                                .email("camila.perez@gmail.com")
                                .esTitular(false)
                                .activo(true)
                                .build();
                        residenteRepository.saveAll(List.of(r104_1, r104_2));
                    } else if (num.equals("101")) {
                        Residente r101 = Residente.builder()
                                .departamento(depto)
                                .nombre("Carlos")
                                .apellido("Valenzuela")
                                .rut("13.456.789-0")
                                .telefono("+56 9 8765 4321")
                                .email("carlos.valenzuela@gmail.com")
                                .esTitular(true)
                                .activo(true)
                                .build();
                        residenteRepository.save(r101);
                    } else if (num.equals("202")) {
                        Residente r202 = Residente.builder()
                                .departamento(depto)
                                .nombre("Gonzalo")
                                .apellido("Araya Bravo")
                                .rut("12.345.678-9")
                                .telefono("+56 9 5432 1098")
                                .esTitular(true)
                                .activo(true)
                                .build();
                        residenteRepository.save(r202);
                    } else {
                        String nombre = nombresEjemplo[(piso - 1) % nombresEjemplo.length];
                        String apellido = apellidosEjemplo[((piso - 1) * 4 + deptoNum - 1) % apellidosEjemplo.length];
                        int rutNum = 12000000 + piso * 100000 + deptoNum * 1234;
                        String rut = String.format("%d-%d", rutNum, (rutNum % 9) + 1);

                        Residente titular = Residente.builder()
                                .departamento(depto)
                                .nombre(nombre)
                                .apellido(apellido)
                                .rut(rut)
                                .telefono(String.format("+56 9 %04d %04d", 8000 + piso * 10 + deptoNum, 1000 + piso * 50 + deptoNum * 10))
                                .email((nombre + "." + apellido + "@edificio.cl").toLowerCase())
                                .esTitular(true)
                                .activo(true)
                                .build();

                        residenteRepository.save(titular);
                    }
                }
            }
        }
        log.info("18 pisos (72 departamentos) y residentes cargados exitosamente.");

        // 3. Restricciones de Seguridad (Blacklist)
        if (restriccionRepository.count() == 0) {
            RestriccionSeguridad ordenJudicial = RestriccionSeguridad.builder()
                    .rut("11.111.111-1")
                    .nombreCompleto("Manuel Antonio Castro Riquelme")
                    .motivo("Orden judicial cautelar de alejamiento vigente respecto al departamento 202. Prohibición absoluta de ingreso.")
                    .tipoRestriccion(TipoRestriccion.BLOQUEO_TOTAL)
                    .activo(true)
                    .registradoPor("Administrador")
                    .build();

            RestriccionSeguridad advertencia = RestriccionSeguridad.builder()
                    .rut("22.222.222-2")
                    .nombreCompleto("Esteban Silva Parra")
                    .motivo("Incidente previo en hall de acceso. Verificar identidad y pedir confirmación presencial al residente.")
                    .tipoRestriccion(TipoRestriccion.ADVERTENCIA_CRITICA)
                    .activo(true)
                    .registradoPor("Administrador")
                    .build();

            restriccionRepository.saveAll(List.of(ordenJudicial, advertencia));
            log.info("Lista de restricciones de seguridad (Blacklist) cargada.");
        }

        // 4. Visitante y Visitas activas
        if (registroVisitaRepository.count() == 0) {
            Departamento d104 = departamentoRepository.findByNumero("104").orElse(null);
            Departamento d101 = departamentoRepository.findByNumero("101").orElse(null);

            if (d104 != null) {
                Visitante v1 = Visitante.builder()
                        .rut("17.345.678-9")
                        .nombre("Sebastián")
                        .apellido("Pinto Rojas")
                        .telefono("+56 9 7788 9900")
                        .totalVisitas(3)
                        .ultimaVisitaAt(Instant.now())
                        .build();
                visitanteRepository.save(v1);

                RegistroVisita visitaActiva = RegistroVisita.builder()
                        .visitante(v1)
                        .departamento(d104)
                        .estado(EstadoVisita.AUTORIZADO)
                        .checkInAt(Instant.now().minus(25, ChronoUnit.MINUTES))
                        .observaciones("Reunión de trabajo")
                        .registradoPor("conserje")
                        .build();
                registroVisitaRepository.save(visitaActiva);
            }

            if (d101 != null) {
                Visitante v2 = Visitante.builder()
                        .rut("18.456.789-0")
                        .nombre("Camila")
                        .apellido("Navarro Soto")
                        .telefono("+56 9 6655 4433")
                        .totalVisitas(1)
                        .ultimaVisitaAt(Instant.now())
                        .build();
                visitanteRepository.save(v2);

                RegistroVisita visitaEnEspera = RegistroVisita.builder()
                        .visitante(v2)
                        .departamento(d101)
                        .estado(EstadoVisita.EN_ESPERA)
                        .observaciones("Visita familiar, llamando a citófono")
                        .registradoPor("conserje")
                        .build();
                registroVisitaRepository.save(visitaEnEspera);
            }
        }

        // 5. Deliveries y Paquetes
        if (deliveryRepository.count() == 0) {
            Departamento d104 = departamentoRepository.findByNumero("104").orElse(null);
            if (d104 != null) {
                DeliveryPiso delivery1 = DeliveryPiso.builder()
                        .empresa("UberEats")
                        .nombreRepartidor("Brayan Martínez")
                        .rutRepartidor("25.112.334-5")
                        .departamento(d104)
                        .horaIngreso(Instant.now().minus(18, ChronoUnit.MINUTES)) // > 15 min para probar alerta de tiempo
                        .estado(EstadoDelivery.EN_TRANSITO)
                        .notas("Pedido #9823 comida rápida")
                        .registradoPor("conserje")
                        .build();
                deliveryRepository.save(delivery1);
            }
        }

        if (paqueteRepository.count() == 0) {
            Departamento d104 = departamentoRepository.findByNumero("104").orElse(null);
            if (d104 != null) {
                Paquete paquete1 = Paquete.builder()
                        .codigoUbicacion("#PAQ-104-01")
                        .codigoSeguimiento("CH-987123654")
                        .empresaTransporte("Chilexpress")
                        .departamento(d104)
                        .descripcion("Caja mediana rotulada e-commerce")
                        .fechaRecepcion(Instant.now().minus(2, ChronoUnit.HOURS))
                        .estado(EstadoPaquete.RECIBIDO_EN_CONSERJERIA)
                        .recepcionadoPor("conserje")
                        .build();
                paqueteRepository.save(paquete1);
            }
        }

        // 6. Bitácora inicial
        if (bitacoraRepository.count() == 0) {
            RegistroBitacora bit1 = RegistroBitacora.builder()
                    .categoria(CategoriaBitacora.ENTREGA_TURNO)
                    .descripcion("Inicio de turno conserjería diurna. Se reciben llaves de sala de calderas y correspondencia matutina.")
                    .esAlerta(false)
                    .usuarioNombre("conserje")
                    .turno("Mañana")
                    .build();
            bitacoraRepository.save(bit1);
        }

        log.info("Datos iniciales cargados satisfactoriamente.");
    }
}
