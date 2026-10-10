# Pantallas generadas en el Canvas:

## Panel Principal — Vista Conserje (Panel Principal — Conserjería):

- Columna izquierda (Operativa principal): Contadores rápidos de visitas en tiempo real (visitas autorizadas en edificio y en espera en mesón), tabla de Visitas Activas en Edificio con estados tipificados en badges (AUTORIZADO, EN_ESPERA, RECHAZADO, FINALIZADO).
- Columna derecha (Directorio & Citofonía): Búsqueda predictiva inmediata por número de departamento, ficha completa del residente titular, botón directo de discado a citófono (anexo), notas operativas y advertencias de seguridad internas del departamento (ej. mascotas o instrucciones especiales). Este panel es accesible únicamente desde el Panel Principal (no tiene pestaña de navegación propia).

## Registro de Visita Rápido con Alerta Crítica (Registro de Visita — Alerta de Seguridad):

- Modal con navegación optimizada para teclado (Keyboard-first con Tab y Enter).
- Demostración activa del Protocolo de Seguridad / Lista de Restricciones: al detectar una coincidencia con orden judicial/lista negra, se bloquea el formulario automáticamente y se despliega el banner crítico de ancho completo en rojo (#ef4444) con las directivas de seguridad para el conserje y el bloqueo mecánico del torniquete.

## Gestión de Deliveries y Paquetería (Gestión de Deliveries y Paquetería):

- Contadores rápidos en la parte superior: deliveries activos a piso (con alerta de tiempo excedido) y paquetes en custodia pendientes de retiro.
- Selector por pestañas entre Deliveries a Piso y Custodia de Encomiendas.
- Formulario de despacho ágil con temporizador automatizado de permanencia.
- Resaltado en ámbar (#f59e0b) para repartidores con más de 15 minutos en tránsito interior, incluyendo botón de alerta para contactar al departamento o enviar patrullaje de seguridad, además de visualización de cámaras OSDP en tiempo real.

## Monitor de Aforo para Emergencias (Monitor de Aforo — Emergencias):

- Vista crítica accesible en 1 clic desde la barra de navegación para situaciones de evacuación o siniestros (Bomberos / Carabineros / Prevención de Riesgos).
- Contador oficial de personas externas dentro de la torre (23 personas), desglose táctico por tramos de pisos y subterráneos, y manifiesto maestro con checkboxes de verificación en zona segura y exportación forense rápida en PDF/CSV.

# Decisiones de Diseño y Tokens

- Paleta de color estricta: Fondos profundos navy (#0a0f1e, #0d1526), tarjetas en superficie #162032, bordes sutiles en azul técnico #1e3a5f, acentos en azul eléctrico (#2563eb) y cyan (#0ea5e9).
- Jerarquía funcional: Únicamente se reservan el rojo (#ef4444) para emergencias de seguridad y el ámbar (#f59e0b) para alertas de tiempo límite.
- Tipografía y atajos: Fuente Inter con alta legibilidad en números y marcas de tiempo (F2, F3, Esc, Tab).
