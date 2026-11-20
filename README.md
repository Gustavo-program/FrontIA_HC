# Sistema Web de Gestión de Historias Clínicas Electrónicas (HC-INSN)
### Instituto Nacional de Salud del Niño – Breña (Versión Angular 22)

Aplicación web desarrollada siguiendo al 100% el **Documento de Especificación de Requerimientos de Software (SRS)** y el modelo de base de datos relacional de PostgreSQL (`modelo_digitalizacion_historias_clinicas_corregido.sql` + `db/tablas_adicionales.sql`).

---

## 🚀 1. Arranque Rápido

El proyecto está listo para ejecutarse de forma inmediata sin necesidad de backend gracias a su **Mock API Interceptor** integrado (`useMockApi: true`):

```bash
# Entrar a la carpeta del proyecto
cd hc-insn

# Iniciar el servidor de desarrollo
npm start
# o: npx ng serve -o
```

La aplicación abrirá automáticamente en `http://localhost:4200`.

---

## 🔐 2. Credenciales de Prueba por Rol

En la pantalla de inicio de sesión (`/login`), se cuenta con botones de **acceso rápido** o puede ingresar manualmente:

| Rol | Usuario | Contraseña | Perfil y Acceso |
|---|---|---|---|
| **ADMIN** | `admin` | `admin123` | Acceso total: Usuarios, Doctores, Personal, Auditoría, Parámetros, Citas Pendientes de Pago |
| **DOCTOR** | `dr.garcia` | `doc123` | Agenda del día, atención médica, diagnósticos CIE-10, receta electrónica (PDF/Email/WhatsApp) y nuevas citas de control |
| **DIGITALIZADOR** | `arch.lopez` | `dig123` | Carga masiva de PDFs (OCR/IA), seguimiento y bandeja de validación manual (confianza < 85%) |
| **ADMISIÓN** | `adm.torres` | `adm123` | CRUD de pacientes pediátricos (stepper), familiares responsables y programación de citas (cupos 30 min, estado APROBADA) |
| **RR. HH.** | `rrhh.flores` | `rrhh123` | Programación de turnos médicos de 6 horas (genera automáticamente 12 cupos de 30 min) y control de no solapamiento |

---

## 🎯 3. Modularidad y Facilidad para Cambiar el Backend o Base de Datos

Tal como se solicitó: *"que si tengo que editar el back o la base de datos sea sencillo poder editar mi Angular"*:

1. **Desacoplamiento Absoluto mediante Modelos TypeScript Propios**:
   - Toda la interfaz consume interfaces TypeScript de dominio ubicadas en `src/app/shared/models/` (`paciente.model.ts`, `cita.model.ts`, `atencion.model.ts`, `documento.model.ts`, etc.).
   - Los componentes nunca conocen la base de datos; consumen servicios Angular (`src/app/shared/services/`) que actúan como adaptadores del contrato REST `/api/v1`.
2. **Cambio Inmediato de Mock API a Backend Real**:
   - En `src/environments/environment.development.ts`:
     ```typescript
     export const environment = {
       production: false,
       apiUrl: '/api/v1',
       useMockApi: false, // <-- Cambiar a false cuando el backend Spring Boot esté levantado
       sessionTimeoutMinutes: 15
     };
     ```
   - El archivo `proxy.conf.json` ya está configurado para redirigir automáticamente todas las peticiones `/api` al backend Java Spring en `http://localhost:8080`.
3. **Mapeo Centralizado**:
   - Si cambia un nombre de columna en la BD o un DTO en Java, **solo se ajusta el servicio o modelo correspondiente en una sola carpeta**, sin necesidad de tocar componentes ni vistas HTML.

---

## 🧩 4. Módulos Implementados (Reglas de Negocio)

- **Digitalización con IA (RF-DIG)**: Carga de expedientes PDF con Drag & Drop, cálculo de confiabilidad (0–100%). Si la confiabilidad es $\ge 85\%$, se incorpora automáticamente a la Historia Clínica (RN-06); si es menor, se deriva a la bandeja de validación manual.
- **Validación de HC (RF-VAL)**: Vista dividida (*Split View*) con el PDF escaneado a un lado y los campos extraídos al otro. Botón **«Ilegible»** que coloca `"-"` automáticamente (RN-08), y botones para autorizar o devolver con motivo obligatorio.
- **Atención Médica (RF-ATE)**: Agenda del día del doctor, consulta clínica estructurada, autocompletado CIE-10 (principal y secundarios), elaboración de receta con medicamentos pediátricos, envío a correo/WhatsApp (RN-10) y agendamiento de nuevas citas de control (naciendo en estado PENDIENTE, RN-03).
- **Admisión (RF-ADM)**: Stepper interactivo para alta de pacientes, validación de documento según su tipo, asignación de familiar responsable con WhatsApp, apertura de Historia Clínica y agendamiento de citas que nacen en estado APROBADA (RN-04).
- **Horarios Médicos (RF-HOR)**: Turnos de 6 horas fijas (RN-01), cálculo automático de la hora fin y generación de 12 cupos de 30 minutos. Validación estricta de no solapamiento del mismo doctor (RN-12).
- **Citas Pendientes de Pago (RF-ADMIN-05)**: Bandeja para que el Administrador confirme el pago en caja y cambie a APROBADA las citas creadas por los doctores (RN-03).
- **Reportes (RF-REP)**: Tarjetas de indicadores, gráfico de barras de evolución mensual, ranking Top 10 CIE-10 y exportación a PDF y Excel.
- **Auditoría (RF-AUD)**: Trazabilidad inmutable de eventos con `X-Correlation-Id` (RNF-11) y visor JSON de metadatos.

---

## 🗄️ 5. Base de Datos PostgreSQL

- **Script Base**: `modelo_digitalizacion_historias_clinicas_corregido.sql`
- **Script Complementario (Citas, Horarios, Atención, Recetas y Seeds)**: `db/tablas_adicionales.sql`
