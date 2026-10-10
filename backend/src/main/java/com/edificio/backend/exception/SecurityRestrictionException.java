package com.edificio.backend.exception;

public class SecurityRestrictionException extends RuntimeException {
    private final String rut;
    private final String motivo;
    private final String tipoRestriccion;

    public SecurityRestrictionException(String rut, String motivo, String tipoRestriccion) {
        super(String.format("ALERTA DE SEGURIDAD CRÍTICA: El RUT %s tiene restricción activa [%s]. Motivo: %s",
                rut, tipoRestriccion, motivo));
        this.rut = rut;
        this.motivo = motivo;
        this.tipoRestriccion = tipoRestriccion;
    }

    public String getRut() {
        return rut;
    }

    public String getMotivo() {
        return motivo;
    }

    public String getTipoRestriccion() {
        return tipoRestriccion;
    }
}
