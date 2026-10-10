# CONTEXT.md: Sistema de Control de Acceso y Visitas para Edificios

## 1. Visión General del Proyecto

Sistema web desktop-first diseñado exclusivamente para el mesón de trabajo en conserjería y la administración de un edificio o departamento. Su propósito es digitalizar y optimizar el flujo tradicional de lápiz y papel, reduciendo el tiempo de atención de 2 minutos a menos de 20 segundos por visitante. La interfaz debe ser intuitiva y fácil de usar, incluso para personas no familiarizadas con la tecnología.

### Frontera del Sistema (Lo que NO es)

- **NO hay portal para residentes:** Los residentes no descargan apps ni inician sesión. La autorización de acceso sigue siendo telefónica/por citófono tradicional o mediante autorización verbal presencial.
- **Usuarios exclusivos:** La interfaz solo es operada por el personal de conserjería en turno y por el administrador del edificio.

---

## 2. Roles y Permisos

1. **`CONSERJE` (Operador de mesón):**
   - Búsqueda rápida en el directorio de departamentos y teléfonos.
   - Registro de entrada y salida de visitantes (Check-in / Check-out).
   - Registro y control de deliveries (a piso con temporizador o recepción de paquetes).
   - Visualización de alertas de seguridad y restricciones de personas no autorizadas (blacklist).
   - Consulta del monitor de aforo en tiempo real para emergencias.
   - Registro de novedades en la bitácora de turno.
2. **`ADMIN` (Administrador del edificio):**
   - Todo lo que puede hacer el `CONSERJE`.
   - Gestión (CRUD) de departamentos, titulares y contactos asociados.
   - Gestión de personal de conserjería (creación de cuentas, cambio de credenciales).
   - Configuración de la lista de restricciones/alertas (blacklist).
   - Consulta y exportación de reportes históricos de auditoría.

---

## 3. Módulos y Requerimientos Funcionales

### Módulo 1: Directorio Operativo y Citofonía

- **Búsqueda Instantánea:** Al ingresar el número de departamento (ej. `104`), el sistema despliega de inmediato:
  - Nombre(s) del titular o residentes registrados.
  - Número de anexo / citófono y teléfono móvil principal.
  - Notas operativas visibles (ej. _"No llamar después de las 22:00"_, _"Autoriza delivery directo a puerta"_).

### Módulo 2: Control de Visitas (Flujo Keyboard-First)

- **Autocompletado de Visitas Recurrentes:** Al ingresar el documento de identidad (RUT/ID), el sistema busca coincidencias históricas. Si existe, autocompleta nombres y apellidos automáticamente.
- **Máquina de Estados de la Visita:**
  - `EN_ESPERA`: Visita en mesón mientras el conserje llama por citófono.
  - `AUTORIZADO`: Residente autorizó el ingreso; se registra hora exacta de entrada (`checkInAt`).
  - `RECHAZADO`: Residente no autorizó o no contestó; se registra el motivo.
  - `FINALIZADO`: Visita se retira del edificio; se marca salida (`checkOutAt`).
- **Ergonomía de Teclado:** Toda la operación de check-in debe poder completarse utilizando `Tab`, `Enter` y flechas direccionales, minimizando el uso del mouse.

### Módulo 3: Gestión de Delivery y Paquetería

- **Modalidad A Piso:**
  - Registro express: Empresa (UberEats, PedidosYa, MercadoLibre, etc.), nombre/ID del repartidor y departamento destino.
  - Requiere autorización telefónica.
  - Activa un temporizador visible: si el repartidor permanece más de 15 minutos dentro, la fila de la tabla cambia visualmente a estado de **Alerta de Tiempo**.
- **Modalidad En Recepción (Paquetería):**
  - Registro de encomienda asociada al departamento con asignación de código de ubicación física (ej. `#PAQ-104-01`).
  - Estado inicial: `RECIBIDO_EN_CONSERJERIA`.
  - Estado final: `ENTREGADO_A_RESIDENTE` con marca temporal y nota de quién retiró.

### Módulo 4: Alertas de Seguridad y Restricciones

- **Lista de Restricciones (Blacklist):** Al tipear una identificación o nombre con advertencia (orden judicial, persona no grata, incidente previo), el sistema bloquea o despliega un banner de advertencia crítico antes de permitir el ingreso.
- **Notas de Seguridad por Departamento:** Advertencias internas visibles solo para conserjería (ej. _"Departamento judicializado"_, _"No dar acceso a expareja de titular"_).

### Módulo 5: Monitor de Emergencia y Auditoría

- **Monitor de Aforo Activo:** Vista accesible en 1 clic que lista todas las personas actualmente dentro del edificio (visitantes y repartidores con estado `AUTORIZADO` o `DENTRO`). Indispensable para evacuaciones o siniestros.
- **Bitácora Inmutable:** Los registros de acceso no se eliminan físicamente (soft delete si aplica) para garantizar la trazabilidad ante incidentes de seguridad.

---

## 4. Stack Tecnológico y Arquitectura

```text
control-acceso-edificio/
├── frontend/          # React 18 + TypeScript + Vite
├── backend/           # Java 21 + Spring Boot 3.x
└── docker/            # Configuración Docker Compose y Nginx
```

### Backend (Java 21 + Spring Boot 3.x)

- **Persistencia:** Spring Data JPA + Hibernate con PostgreSQL.
- **Estrategia DDL:** `spring.jpa.hibernate.ddl-auto=update` para agilidad en desarrollo.
- **Arquitectura en Capas (Por Módulo o General):**
  - `config`: Clases de configuración global o de seguridad (ej. SecurityConfig, CorsConfig).
  - `model`:
    - `entity`: Entidades JPA mapeadas a la base de datos (con anotaciones `@Entity`, `@Table`, etc.).
    - `request`: Clases DTO de entrada para operaciones de guardado y actualización (`@RequestBody`).
    - `dto`: Clases `record` inmutables para retornar datos al cliente, evitando exponer directamente las entidades de base de datos.
  - `repository`: Interfaces que extienden de `JpaRepository` para la persistencia.
  - `service`: Clases contenedoras de la lógica de negocio y transaccionalidad (`@Service`, `@Transactional`).
  - `controller`: Controladores REST que exponen los endpoints HTTP (`@RestController`, `@RequestMapping`).
- **Validación:** Jakarta Validation (`@Valid`, `@NotNull`, `@NotBlank`, etc.) aplicada en los objetos de la capa `request`.
- **Timestamps:** Todos los eventos y fechas deben almacenarse en formato `Instant` o `OffsetDateTime` (UTC).

### Frontend (React + TypeScript + Vite)

- **Librerías Clave:**
  - `@tanstack/react-query`: Manejo de caché de servidor, revalidaciones y mutaciones.
  - `@tanstack/react-table`: Tablas densas con filtros rápidos y paginación en memoria.
  - `react-hook-form` + `zod` + `@hookform/resolvers`: Validación declarativa de formularios.
  - `lucide-react`: Iconografía de la interfaz.
- **Enfoque de UI:** Densidad de datos alta, paleta de colores neutral tipo panel administrativo (gris/oscuro/blanco limpio), alertas en amarillo/rojo visibles a distancia y cero animaciones innecesarias que ralenticen la operativa.

### Base de Datos e Infraestructura

- **Base de Datos:** PostgreSQL 16 corriendo en contenedor Docker con volumen persistente.
- **Ambiente de Producción Local:** Orquestación con `docker-compose` enlazando Frontend (servido vía Nginx), Backend (Spring Boot en contenedor) y PostgreSQL.

---

## 5. Reglas de Desarrollo para Asistencia por IA (SDD)

1. **Contratos Primero:** Antes de implementar un controlador o componente, definir claramente el DTO de entrada, el DTO de salida y los códigos de respuesta HTTP correspondientes.
2. **Tipado Estricto:** Prohibido el uso de `any` en TypeScript o de `Map<String, Object>` en controladores de Java. Toda transferencia de datos debe contar con clases o interfaces tipadas.
3. **Manejo Centralizado de Errores:**
   - En backend: `@RestControllerAdvice` retornando un objeto estándar de error (`timestamp`, `status`, `error`, `message`, `path`).
   - En frontend: Mostrar alertas contextuales claras cuando una validación o llamada de red falle.
4. **Ergonomía de Teclado:** Cada formulario nuevo debe incluir la gestión del foco (`autoFocus` en el campo principal) y soporte para envío o avance mediante la tecla `Enter`.
