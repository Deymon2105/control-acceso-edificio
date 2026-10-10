package com.edificio.backend.service;

import com.edificio.backend.model.dto.AforoPisoDto;
import com.edificio.backend.model.dto.PersonaEnEdificioDto;
import com.edificio.backend.model.dto.ResumenAforoDto;
import com.edificio.backend.model.entity.DeliveryPiso;
import com.edificio.backend.model.entity.EstadoDelivery;
import com.edificio.backend.model.entity.EstadoVisita;
import com.edificio.backend.model.entity.RegistroVisita;
import com.edificio.backend.repository.DeliveryPisoRepository;
import com.edificio.backend.repository.RegistroVisitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AforoService {

    private final RegistroVisitaRepository registroVisitaRepository;
    private final DeliveryPisoRepository deliveryRepository;

    @Transactional(readOnly = true)
    public List<PersonaEnEdificioDto> obtenerPersonasDentro() {
        List<PersonaEnEdificioDto> lista = new ArrayList<>();
        Instant ahora = Instant.now();

        // 1. Visitas con estado AUTORIZADO
        List<RegistroVisita> visitas = registroVisitaRepository.findByEstadoOrderByCheckInAtDesc(EstadoVisita.AUTORIZADO);
        for (RegistroVisita v : visitas) {
            Instant ingreso = v.getCheckInAt() != null ? v.getCheckInAt() : v.getFechaCreacion();
            long minutos = Duration.between(ingreso, ahora).toMinutes();

            lista.add(new PersonaEnEdificioDto(
                    v.getId(),
                    "VISITA",
                    v.getVisitante().getNombreCompleto(),
                    v.getVisitante().getRut(),
                    v.getDepartamento().getNumero(),
                    v.getDepartamento().getPiso(),
                    v.getDepartamento().getTorre(),
                    ingreso,
                    minutos,
                    v.getDepartamento().getAnexoCitofono()
            ));
        }

        // 2. Deliveries con estado EN_TRANSITO
        List<DeliveryPiso> deliveries = deliveryRepository.findByEstadoOrderByHoraIngresoDesc(EstadoDelivery.EN_TRANSITO);
        for (DeliveryPiso d : deliveries) {
            long minutos = Duration.between(d.getHoraIngreso(), ahora).toMinutes();

            lista.add(new PersonaEnEdificioDto(
                    d.getId(),
                    "DELIVERY (" + d.getEmpresa() + ")",
                    d.getNombreRepartidor(),
                    d.getRutRepartidor() != null ? d.getRutRepartidor() : "No registrado",
                    d.getDepartamento().getNumero(),
                    d.getDepartamento().getPiso(),
                    d.getDepartamento().getTorre(),
                    d.getHoraIngreso(),
                    minutos,
                    d.getDepartamento().getAnexoCitofono()
            ));
        }

        lista.sort(Comparator.comparing(PersonaEnEdificioDto::piso)
                .thenComparing(PersonaEnEdificioDto::departamentoNumero));

        return lista;
    }

    @Transactional(readOnly = true)
    public ResumenAforoDto obtenerResumen() {
        List<PersonaEnEdificioDto> personas = obtenerPersonasDentro();

        int totalVisitas = (int) personas.stream().filter(p -> p.tipo().startsWith("VISITA")).count();
        int totalDeliveries = (int) personas.stream().filter(p -> p.tipo().startsWith("DELIVERY")).count();
        int totalGeneral = personas.size();

        Map<Integer, List<PersonaEnEdificioDto>> porPiso = personas.stream()
                .collect(Collectors.groupingBy(PersonaEnEdificioDto::piso, TreeMap::new, Collectors.toList()));

        List<AforoPisoDto> desglosePisos = new ArrayList<>();
        porPiso.forEach((piso, grupo) -> {
            String sector;
            if (piso < 0) {
                sector = "Subterráneo " + Math.abs(piso);
            } else if (piso == 0) {
                sector = "Planta Baja / Hall";
            } else {
                sector = "Piso " + piso;
            }

            desglosePisos.add(new AforoPisoDto(
                    sector,
                    piso,
                    grupo.size(),
                    grupo
            ));
        });

        return new ResumenAforoDto(
                totalGeneral,
                totalVisitas,
                totalDeliveries,
                Instant.now(),
                desglosePisos
        );
    }

    @Transactional(readOnly = true)
    public String generarManifiestoCsv() {
        List<PersonaEnEdificioDto> personas = obtenerPersonasDentro();
        StringBuilder sb = new StringBuilder();
        sb.append("TIPO,NOMBRE_COMPLETO,RUT,DEPARTAMENTO,PISO,HORA_INGRESO_UTC,MINUTOS_PERMANENCIA,CITOFONO\n");

        for (PersonaEnEdificioDto p : personas) {
            sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",%d,\"%s\"\n",
                    p.tipo(),
                    p.nombreCompleto().replace("\"", "\"\""),
                    p.rut(),
                    p.departamentoNumero(),
                    p.piso(),
                    p.horaIngreso().toString(),
                    p.minutosPermanencia(),
                    p.anexoCitofono() != null ? p.anexoCitofono() : ""
            ));
        }

        return sb.toString();
    }
}
