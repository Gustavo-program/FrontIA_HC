-- =====================================================================
--  SISTEMA DE GESTIÓN DE HISTORIAS CLÍNICAS ELECTRÓNICAS - INSN BREÑA
--  Script ÚNICO de base de datos (estructura + datos semilla)
--  Motor: PostgreSQL 14+
-- ---------------------------------------------------------------------
--  * Es IDEMPOTENTE: puede ejecutarse en cada arranque de la aplicación
--    sin borrar datos (CREATE ... IF NOT EXISTS / ON CONFLICT DO NOTHING).
--  * Reemplaza a "modelo_digitalizacion_historias_clinicas_corregido.sql"
--    y a "tablas_adicionales.sql".
--  * Contraseñas de usuarios semilla en BCrypt (compatible con Spring
--    Security BCryptPasswordEncoder).
--
--  Índice
--    0. Extensiones y funciones utilitarias
--    1. Catálogos
--    2. Personal de salud y médicos
--    3. Seguridad (usuarios, roles, permisos)
--    4. Pacientes, responsables e historia clínica
--    5. Agenda (horarios y citas) + notificaciones
--    6. Digitalización y validación (IA / OCR)
--    7. Atención médica, diagnósticos y recetas
--    8. Auditoría y trazabilidad
--    9. Triggers de "actualizado_en"
--   10. Datos semilla
-- =====================================================================

-- =====================================================================
-- 0. EXTENSIONES Y FUNCIONES UTILITARIAS
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid(), crypt()

CREATE OR REPLACE FUNCTION fn_set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Correlativo de Historia Clínica: SIEMPRE 7 dígitos numéricos
CREATE SEQUENCE IF NOT EXISTS seq_numero_historia
    START WITH 2026010 MINVALUE 1000000 MAXVALUE 9999999 NO CYCLE;

-- =====================================================================
-- 1. CATÁLOGOS
-- =====================================================================
CREATE TABLE IF NOT EXISTS tipo_documento_identidad (
    tipo_documento_identidad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion     VARCHAR(100) NOT NULL UNIQUE,
    abreviatura     VARCHAR(10)  NOT NULL UNIQUE,
    longitud        SMALLINT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS estado_historia_clinica (
    estado_historia_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(20)  NOT NULL UNIQUE,
    nombre          VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipo_documento_clinico (
    tipo_documento_clinico_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(30)  NOT NULL UNIQUE,
    nombre          VARCHAR(150) NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tipo_personal (
    tipo_personal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(30)  NOT NULL UNIQUE,
    nombre          VARCHAR(100) NOT NULL,
    es_asistencial  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS especialidad (
    especialidad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(20)  NOT NULL UNIQUE,
    nombre          VARCHAR(150) NOT NULL UNIQUE,
    activa          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS servicio_clinico (
    servicio_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo            VARCHAR(20)  NOT NULL UNIQUE,
    nombre            VARCHAR(150) NOT NULL,
    servicio_padre_id UUID REFERENCES servicio_clinico(servicio_id) ON DELETE RESTRICT,
    activo            BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cie10 (
    cie10_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(10)  NOT NULL UNIQUE,
    descripcion     VARCHAR(255) NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_cie10_codigo ON cie10 (codigo);

CREATE TABLE IF NOT EXISTS configuracion_sistema (
    clave           VARCHAR(100) PRIMARY KEY,
    valor           TEXT NOT NULL,
    descripcion     VARCHAR(255),
    editable        BOOLEAN NOT NULL DEFAULT TRUE,
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE configuracion_sistema ALTER COLUMN valor TYPE TEXT USING valor::text;

-- =====================================================================
-- 2. PERSONAL DE SALUD Y MÉDICOS
-- =====================================================================
CREATE TABLE IF NOT EXISTS personal_salud (
    personal_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_institucional VARCHAR(30)  NOT NULL UNIQUE,
    tipo_personal_id     UUID NOT NULL REFERENCES tipo_personal(tipo_personal_id) ON DELETE RESTRICT,
    nombres              VARCHAR(100) NOT NULL,
    apellido_paterno     VARCHAR(100) NOT NULL,
    apellido_materno     VARCHAR(100),
    tipo_documento_id    UUID NOT NULL REFERENCES tipo_documento_identidad(tipo_documento_identidad_id) ON DELETE RESTRICT,
    numero_documento     VARCHAR(20)  NOT NULL,
    correo_institucional VARCHAR(254),
    telefono             VARCHAR(30),
    estado               VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO'
                         CHECK (estado IN ('ACTIVO','INACTIVO','LICENCIA','CESADO')),
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tipo_documento_id, numero_documento)
);

CREATE TABLE IF NOT EXISTS medico (
    medico_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id      UUID NOT NULL UNIQUE REFERENCES personal_salud(personal_id) ON DELETE RESTRICT,
    numero_cmp       VARCHAR(10) NOT NULL UNIQUE,
    numero_rne       VARCHAR(10),
    verificacion_cmp VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                     CHECK (verificacion_cmp IN ('PENDIENTE','VERIFICADO','OBSERVADO','NO_APLICA')),
    observaciones    TEXT,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medico_especialidad (
    medico_id       UUID NOT NULL REFERENCES medico(medico_id) ON DELETE CASCADE,
    especialidad_id UUID NOT NULL REFERENCES especialidad(especialidad_id) ON DELETE RESTRICT,
    es_principal    BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (medico_id, especialidad_id)
);

CREATE TABLE IF NOT EXISTS asignacion_personal_servicio (
    asignacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id   UUID NOT NULL REFERENCES personal_salud(personal_id) ON DELETE RESTRICT,
    servicio_id   UUID NOT NULL REFERENCES servicio_clinico(servicio_id) ON DELETE RESTRICT,
    fecha_inicio  DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin     DATE,
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_asignacion_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

-- =====================================================================
-- 3. SEGURIDAD
-- =====================================================================
CREATE TABLE IF NOT EXISTS rol (
    rol_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo      VARCHAR(30)  NOT NULL UNIQUE,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    es_sistema  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS permiso (
    permiso_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo      VARCHAR(60)  NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS rol_permiso (
    rol_id     UUID NOT NULL REFERENCES rol(rol_id) ON DELETE CASCADE,
    permiso_id UUID NOT NULL REFERENCES permiso(permiso_id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS usuario (
    usuario_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id        UUID UNIQUE REFERENCES personal_salud(personal_id) ON DELETE RESTRICT,
    nombre_usuario     VARCHAR(50)  NOT NULL UNIQUE,
    password_hash      VARCHAR(100) NOT NULL,
    nombre_completo    VARCHAR(200) NOT NULL,
    correo             VARCHAR(254) NOT NULL UNIQUE,
    activo             BOOLEAN NOT NULL DEFAULT TRUE,
    debe_cambiar_clave BOOLEAN NOT NULL DEFAULT TRUE,
    intentos_fallidos  SMALLINT NOT NULL DEFAULT 0,
    ultimo_acceso      TIMESTAMPTZ,
    creado_en          TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuario_rol (
    usuario_id UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    rol_id     UUID NOT NULL REFERENCES rol(rol_id) ON DELETE RESTRICT,
    PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE IF NOT EXISTS refresh_token (
    refresh_token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id       UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    token_hash       VARCHAR(128) NOT NULL UNIQUE,
    expira_en        TIMESTAMPTZ NOT NULL,
    revocado         BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 4. PACIENTES, RESPONSABLES E HISTORIA CLÍNICA
-- =====================================================================
CREATE TABLE IF NOT EXISTS paciente (
    paciente_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_paciente  VARCHAR(20)  NOT NULL UNIQUE,
    nombres          VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE NOT NULL CHECK (fecha_nacimiento <= CURRENT_DATE),
    sexo_registrado  VARCHAR(20)  NOT NULL
                     CHECK (sexo_registrado IN ('FEMENINO','MASCULINO','NO_ESPECIFICADO','DESCONOCIDO')),
    lugar_nacimiento VARCHAR(150),
    pais_nacimiento  VARCHAR(80) DEFAULT 'Perú',
    estado_registro  VARCHAR(25)  NOT NULL DEFAULT 'ACTIVO'      -- RN-11: baja lógica
                     CHECK (estado_registro IN ('ACTIVO','INACTIVO','FUSIONADO','PENDIENTE_VALIDACION')),
    observaciones    TEXT,
    creado_por       UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_paciente_nombres
    ON paciente (apellido_paterno, apellido_materno, nombres);

CREATE TABLE IF NOT EXISTS documento_identidad (
    documento_identidad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id       UUID NOT NULL REFERENCES paciente(paciente_id) ON DELETE RESTRICT,
    tipo_documento_id UUID NOT NULL REFERENCES tipo_documento_identidad(tipo_documento_identidad_id) ON DELETE RESTRICT,
    numero_documento  VARCHAR(20) NOT NULL,
    pais_emisor       VARCHAR(80) DEFAULT 'Perú',
    es_principal      BOOLEAN NOT NULL DEFAULT TRUE,
    estado_validacion VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (estado_validacion IN ('PENDIENTE','VALIDADO','OBSERVADO','NO_VERIFICABLE')),
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tipo_documento_id, numero_documento)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_documento_principal_paciente
    ON documento_identidad (paciente_id) WHERE es_principal;

CREATE TABLE IF NOT EXISTS historia_clinica (
    historia_clinica_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id         UUID NOT NULL UNIQUE REFERENCES paciente(paciente_id) ON DELETE RESTRICT,
    numero_historia     CHAR(7) NOT NULL UNIQUE CHECK (numero_historia ~ '^[0-9]{7}$'),   -- 7 dígitos
    fecha_apertura      DATE NOT NULL DEFAULT CURRENT_DATE,
    estado_historia_id  UUID NOT NULL REFERENCES estado_historia_clinica(estado_historia_id) ON DELETE RESTRICT,
    establecimiento     VARCHAR(150) NOT NULL DEFAULT 'INSN - Breña',
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS familiar_responsable (
    responsable_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres           VARCHAR(100) NOT NULL,
    apellido_paterno  VARCHAR(100) NOT NULL,
    apellido_materno  VARCHAR(100),
    tipo_documento_id UUID REFERENCES tipo_documento_identidad(tipo_documento_identidad_id) ON DELETE RESTRICT,
    numero_documento  VARCHAR(20),
    telefono          VARCHAR(30),
    telefono_whatsapp VARCHAR(30),                       -- RN-10
    correo            VARCHAR(254),                      -- RN-10
    direccion         VARCHAR(255),
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tipo_documento_id, numero_documento)
);

CREATE TABLE IF NOT EXISTS paciente_responsable (
    paciente_id           UUID NOT NULL REFERENCES paciente(paciente_id) ON DELETE RESTRICT,
    responsable_id        UUID NOT NULL REFERENCES familiar_responsable(responsable_id) ON DELETE RESTRICT,
    parentesco            VARCHAR(30) NOT NULL,
    es_contacto_principal BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (paciente_id, responsable_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacto_principal_paciente
    ON paciente_responsable (paciente_id) WHERE es_contacto_principal;

-- =====================================================================
-- 5. AGENDA: HORARIOS, CITAS Y NOTIFICACIONES
-- =====================================================================
-- RN-01: turnos de 6 h (configurable) / RN-12: sin solapamiento por médico
CREATE TABLE IF NOT EXISTS horario_medico (
    horario_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id       UUID NOT NULL REFERENCES medico(medico_id) ON DELETE RESTRICT,
    especialidad_id UUID REFERENCES especialidad(especialidad_id) ON DELETE RESTRICT,
    servicio_id     UUID REFERENCES servicio_clinico(servicio_id) ON DELETE RESTRICT,
    consultorio     VARCHAR(50),
    fecha           DATE NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    estado          VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
                    CHECK (estado IN ('ACTIVO','CANCELADO','COMPLETADO')),
    creado_por      UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_horario_fin CHECK (hora_fin > hora_inicio)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_horario_medico_activo
    ON horario_medico (medico_id, fecha, hora_inicio) WHERE (estado = 'ACTIVO');
CREATE INDEX IF NOT EXISTS idx_horario_medico_fecha ON horario_medico (medico_id, fecha);

-- RN-03: cita de DOCTOR nace PENDIENTE (requiere pago) / RN-04: de ADMISION nace APROBADA
-- RN-05: un cupo no puede tener dos citas activas
CREATE TABLE IF NOT EXISTS cita (
    cita_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id       UUID NOT NULL REFERENCES paciente(paciente_id) ON DELETE RESTRICT,
    medico_id         UUID NOT NULL REFERENCES medico(medico_id) ON DELETE RESTRICT,
    horario_id        UUID NOT NULL REFERENCES horario_medico(horario_id) ON DELETE RESTRICT,
    especialidad_id   UUID REFERENCES especialidad(especialidad_id) ON DELETE RESTRICT,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin    TIMESTAMP NOT NULL,
    estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (estado IN ('PENDIENTE','APROBADA','ATENDIDA','CANCELADA','NO_ASISTIO')),
    origen            VARCHAR(20) NOT NULL DEFAULT 'ADMISION'
                      CHECK (origen IN ('ADMISION','DOCTOR')),
    motivo            TEXT,
    motivo_cancelacion TEXT,
    creado_por        UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    aprobado_por      UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    fecha_aprobacion  TIMESTAMPTZ,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_cita_horario CHECK (fecha_hora_fin > fecha_hora_inicio)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cita_medico_inicio
    ON cita (medico_id, fecha_hora_inicio) WHERE estado IN ('PENDIENTE','APROBADA');
CREATE INDEX IF NOT EXISTS idx_cita_paciente     ON cita (paciente_id);
CREATE INDEX IF NOT EXISTS idx_cita_fecha        ON cita (fecha_hora_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_cita_estado       ON cita (estado);
CREATE INDEX IF NOT EXISTS idx_cita_especialidad ON cita (especialidad_id);

-- Notificación al familiar cuando la cita queda APROBADA (correo / WhatsApp)
CREATE TABLE IF NOT EXISTS notificacion_cita (
    notificacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id         UUID NOT NULL REFERENCES cita(cita_id) ON DELETE CASCADE,
    canal           VARCHAR(20) NOT NULL CHECK (canal IN ('EMAIL','WHATSAPP')),
    destino         VARCHAR(254) NOT NULL,
    asunto          VARCHAR(200),
    mensaje         TEXT,
    estado          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (estado IN ('PENDIENTE','ENVIADO','ERROR')),
    intentos        SMALLINT NOT NULL DEFAULT 0,
    fecha_envio     TIMESTAMPTZ,
    detalle_error   TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notificacion_cita_estado ON notificacion_cita (estado);

-- =====================================================================
-- 6. DIGITALIZACIÓN Y VALIDACIÓN (IA / OCR)
-- =====================================================================
CREATE TABLE IF NOT EXISTS documento_clinico (
    documento_clinico_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id       UUID REFERENCES historia_clinica(historia_clinica_id) ON DELETE RESTRICT,
    tipo_documento_clinico_id UUID REFERENCES tipo_documento_clinico(tipo_documento_clinico_id) ON DELETE RESTRICT,
    nombre_archivo_original   VARCHAR(255) NOT NULL,
    ruta_almacenamiento       VARCHAR(500) NOT NULL,    -- el PDF original nunca se modifica (RN-09)
    mime_type                 VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    sha256                    CHAR(64) NOT NULL UNIQUE,
    numero_paginas            INTEGER CHECK (numero_paginas > 0),
    tamano_bytes              BIGINT  CHECK (tamano_bytes > 0),
    fecha_documento           DATE,
    recibido_en               TIMESTAMPTZ NOT NULL DEFAULT now(),
    subido_por                UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    estado_procesamiento      VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE'
                              CHECK (estado_procesamiento IN ('PENDIENTE','EN_COLA','EN_PROCESO','PROCESADO','REQUIERE_REVISION','ERROR','CANCELADO')),
    estado_validacion         VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE'
                              CHECK (estado_validacion IN ('PENDIENTE','REGISTRADO_AUTOMATICO','EN_REVISION','VALIDADO','RECHAZADO')),
    confiabilidad_promedio    NUMERIC(5,2) CHECK (confiabilidad_promedio BETWEEN 0 AND 100),
    eliminado                 BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documento_historia ON documento_clinico (historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_documento_estado   ON documento_clinico (estado_procesamiento, estado_validacion);

CREATE TABLE IF NOT EXISTS trabajo_procesamiento (
    trabajo_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_clinico_id UUID NOT NULL REFERENCES documento_clinico(documento_clinico_id) ON DELETE RESTRICT,
    tipo                 VARCHAR(30) NOT NULL DEFAULT 'EXTRACCION'
                         CHECK (tipo IN ('OCR','EXTRACCION','REPROCESO')),
    estado               VARCHAR(20) NOT NULL DEFAULT 'EN_COLA'
                         CHECK (estado IN ('EN_COLA','EN_PROCESO','COMPLETADO','ERROR','CANCELADO')),
    prioridad            SMALLINT NOT NULL DEFAULT 5,
    intentos             SMALLINT NOT NULL DEFAULT 0,
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT now(),
    iniciado_en          TIMESTAMPTZ,
    finalizado_en        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_trabajo_estado ON trabajo_procesamiento (estado, prioridad);

CREATE TABLE IF NOT EXISTS ejecucion_procesamiento (
    ejecucion_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trabajo_id     UUID NOT NULL REFERENCES trabajo_procesamiento(trabajo_id) ON DELETE RESTRICT,
    motor          VARCHAR(50) NOT NULL,          -- p.ej. GEMINI, TESSERACT
    version_modelo VARCHAR(50),
    estado         VARCHAR(20) NOT NULL CHECK (estado IN ('EXITOSA','FALLIDA')),
    resultado      JSONB,
    mensaje_error  TEXT,
    iniciado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
    finalizado_en  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS campo_extraido (
    campo_extraido_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_clinico_id UUID NOT NULL REFERENCES documento_clinico(documento_clinico_id) ON DELETE RESTRICT,
    ejecucion_id         UUID REFERENCES ejecucion_procesamiento(ejecucion_id) ON DELETE RESTRICT,
    nombre_campo         VARCHAR(80)  NOT NULL,
    etiqueta             VARCHAR(150),
    valor_extraido       TEXT,
    valor_normalizado    TEXT,
    valor_corregido      TEXT,                    -- RN-08: ilegible = '-'
    confianza            NUMERIC(4,3) NOT NULL CHECK (confianza BETWEEN 0 AND 1),
    pagina_origen        INTEGER,
    estado_validacion    VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                         CHECK (estado_validacion IN ('PENDIENTE','VALIDADO','CORREGIDO','RECHAZADO')),
    validado_por         UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    validado_en          TIMESTAMPTZ,
    UNIQUE (documento_clinico_id, nombre_campo)
);

CREATE TABLE IF NOT EXISTS revision_documental (
    revision_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_clinico_id UUID NOT NULL REFERENCES documento_clinico(documento_clinico_id) ON DELETE RESTRICT,
    trabajo_id           UUID REFERENCES trabajo_procesamiento(trabajo_id) ON DELETE RESTRICT,
    revisor_usuario_id   UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    motivo               VARCHAR(255) NOT NULL,
    estado               VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                         CHECK (estado IN ('PENDIENTE','ASIGNADA','APROBADA','RECHAZADA','DEVUELTA')),
    observaciones        TEXT,
    creada_en            TIMESTAMPTZ NOT NULL DEFAULT now(),
    asignada_en          TIMESTAMPTZ,
    resuelta_en          TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_revision_estado ON revision_documental (estado);

CREATE TABLE IF NOT EXISTS incidencia_procesamiento (
    incidencia_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_clinico_id UUID NOT NULL REFERENCES documento_clinico(documento_clinico_id) ON DELETE RESTRICT,
    trabajo_id           UUID REFERENCES trabajo_procesamiento(trabajo_id) ON DELETE RESTRICT,
    tipo                 VARCHAR(40) NOT NULL,
    severidad            VARCHAR(10) NOT NULL DEFAULT 'MEDIA' CHECK (severidad IN ('BAJA','MEDIA','ALTA')),
    descripcion          TEXT NOT NULL,
    resuelta             BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 7. ATENCIÓN MÉDICA, DIAGNÓSTICOS Y RECETAS
-- =====================================================================
CREATE TABLE IF NOT EXISTS atencion (
    atencion_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id  UUID NOT NULL REFERENCES historia_clinica(historia_clinica_id) ON DELETE RESTRICT,
    cita_id              UUID UNIQUE REFERENCES cita(cita_id) ON DELETE RESTRICT,
    medico_id            UUID REFERENCES medico(medico_id) ON DELETE RESTRICT,
    medico_nombre_texto  VARCHAR(200),             -- médico externo leído de un documento digitalizado
    servicio_id          UUID REFERENCES servicio_clinico(servicio_id) ON DELETE RESTRICT,
    fecha_atencion       TIMESTAMPTZ NOT NULL DEFAULT now(),
    motivo_consulta      TEXT NOT NULL,
    antecedentes         TEXT,
    observaciones        TEXT,
    recomendaciones      TEXT,
    peso_kg              NUMERIC(5,2),
    talla_m              NUMERIC(4,2),
    estado               VARCHAR(20) NOT NULL DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR','FINALIZADA')),
    origen               VARCHAR(20) NOT NULL DEFAULT 'CONSULTA' CHECK (origen IN ('CONSULTA','DIGITALIZACION')),
    documento_clinico_id UUID REFERENCES documento_clinico(documento_clinico_id) ON DELETE RESTRICT,
    es_extraido_por_ia   BOOLEAN NOT NULL DEFAULT FALSE,     -- RN-09
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    finalizado_en        TIMESTAMPTZ,
    CONSTRAINT chk_atencion_medico CHECK (medico_id IS NOT NULL OR medico_nombre_texto IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_atencion_historia     ON atencion (historia_clinica_id, fecha_atencion DESC);
CREATE INDEX IF NOT EXISTS idx_atencion_medico_fecha ON atencion (medico_id, fecha_atencion);

CREATE TABLE IF NOT EXISTS atencion_diagnostico (
    atencion_diagnostico_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id   UUID NOT NULL REFERENCES atencion(atencion_id) ON DELETE CASCADE,
    cie10_id      UUID NOT NULL REFERENCES cie10(cie10_id) ON DELETE RESTRICT,
    tipo          VARCHAR(20) NOT NULL DEFAULT 'PRINCIPAL' CHECK (tipo IN ('PRINCIPAL','SECUNDARIO')),
    observaciones TEXT,
    UNIQUE (atencion_id, cie10_id)
);
CREATE INDEX IF NOT EXISTS idx_atencion_diagnostico_cie10 ON atencion_diagnostico (cie10_id);

CREATE TABLE IF NOT EXISTS receta (
    receta_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id    UUID NOT NULL UNIQUE REFERENCES atencion(atencion_id) ON DELETE RESTRICT,
    indicaciones   TEXT,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receta_medicamento (
    receta_medicamento_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id     UUID NOT NULL REFERENCES receta(receta_id) ON DELETE CASCADE,
    nombre        VARCHAR(200) NOT NULL,
    concentracion VARCHAR(100),
    dosis         VARCHAR(100) NOT NULL,
    frecuencia    VARCHAR(100) NOT NULL,
    duracion      VARCHAR(100) NOT NULL,
    cantidad      INTEGER NOT NULL CHECK (cantidad > 0),
    observaciones TEXT,
    orden         INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS envio_receta (
    envio_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id     UUID NOT NULL REFERENCES receta(receta_id) ON DELETE RESTRICT,
    canal         VARCHAR(20) NOT NULL CHECK (canal IN ('EMAIL','WHATSAPP')),
    destino       VARCHAR(254) NOT NULL,                -- RN-10: solo contactos registrados
    estado        VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','ENVIADO','ERROR')),
    fecha_envio   TIMESTAMPTZ,
    detalle_error TEXT,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 8. AUDITORÍA Y TRAZABILIDAD (RN-13)
-- =====================================================================
CREATE TABLE IF NOT EXISTS auditoria (
    auditoria_id BIGSERIAL PRIMARY KEY,
    usuario_id   UUID REFERENCES usuario(usuario_id) ON DELETE SET NULL,
    accion       VARCHAR(30)  NOT NULL,   -- CREAR, ACTUALIZAR, ELIMINAR, LOGIN, APROBAR...
    entidad      VARCHAR(60)  NOT NULL,
    entidad_id   VARCHAR(64),
    detalle      TEXT,
    ip_origen    VARCHAR(45),
    user_agent   VARCHAR(255),
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE auditoria ALTER COLUMN detalle TYPE TEXT USING detalle::text;
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha   ON auditoria (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria (entidad, entidad_id);

CREATE TABLE IF NOT EXISTS historial_estado (
    historial_id    BIGSERIAL PRIMARY KEY,
    entidad         VARCHAR(60) NOT NULL,      -- CITA, DOCUMENTO_CLINICO, REVISION...
    entidad_id      UUID NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo    VARCHAR(30) NOT NULL,
    motivo          TEXT,
    usuario_id      UUID REFERENCES usuario(usuario_id) ON DELETE SET NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_historial_entidad ON historial_estado (entidad, entidad_id);

-- =====================================================================
-- 9. TRIGGERS "actualizado_en" (se aplican a toda tabla que tenga la columna)
-- =====================================================================
DO $$
DECLARE t RECORD;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = current_schema() AND column_name = 'actualizado_en'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_actualizado ON %1$I', t.table_name);
        EXECUTE format(
            'CREATE TRIGGER trg_%1$s_actualizado BEFORE UPDATE ON %1$I
             FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en()', t.table_name);
    END LOOP;
END $$;

-- =====================================================================
-- 10. DATOS SEMILLA
-- =====================================================================

-- 10.1 Catálogos ------------------------------------------------------
INSERT INTO tipo_documento_identidad (descripcion, abreviatura, longitud) VALUES
('Documento Nacional de Identidad', 'DNI', 8),
('Carné de Extranjería',            'CE',  12),
('Pasaporte',                       'PAS', 12),
('Partida de Nacimiento',           'PN',  10)
ON CONFLICT (abreviatura) DO NOTHING;

INSERT INTO estado_historia_clinica (codigo, nombre) VALUES
('ACTIVA',    'Activa'),
('PASIVA',    'Pasiva (sin atenciones recientes)'),
('CERRADA',   'Cerrada'),
('FUSIONADA', 'Fusionada con otra HC')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tipo_documento_clinico (codigo, nombre) VALUES
('HC_CONSULTA_EXTERNA', 'Historia Clínica - Consulta Externa'),
('TELEINTERCONSULTA',   'Formato de Atención de Teleinterconsulta (FAT)'),
('EPICRISIS',           'Epicrisis'),
('INFORME_EXAMEN',      'Informe de Examen Auxiliar'),
('RECETA',              'Receta Médica'),
('OTRO',                'Otro documento clínico')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tipo_personal (codigo, nombre, es_asistencial) VALUES
('MEDICO',        'Médico Especialista',          TRUE),
('DIGITALIZADOR', 'Personal de Archivo / Digitalizador', FALSE),
('ADMISION',      'Personal de Admisión',         FALSE),
('RRHH',          'Especialista en RR. HH.',      FALSE),
('ADMINISTRADOR', 'Administrador del Sistema',    FALSE)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO especialidad (codigo, nombre) VALUES
('PED-GEN',  'Pediatría General'),
('PED-CARD', 'Cardiología Pediátrica'),
('PED-NEUR', 'Neurología Pediátrica'),
('PED-CIR',  'Cirugía Pediátrica'),
('PED-NEUM', 'Neumología Pediátrica'),
('PED-GAST', 'Gastroenterología Pediátrica')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO servicio_clinico (codigo, nombre) VALUES
('CONS-EXT',  'Consulta Externa Breña'),
('EMERG-PED', 'Emergencia Pediátrica'),
('HOSP-MED',  'Hospitalización Medicina'),
('UCI-PED',   'UCI Pediátrica')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO cie10 (codigo, descripcion) VALUES
('J00',     'Rinofaringitis aguda [resfriado común]'),
('J02.9',   'Faringitis aguda, no especificada'),
('J20.9',   'Bronquitis aguda, no especificada'),
('J45.0',   'Asma predominantemente alérgica'),
('J45.9',   'Asma, no especificada'),
('J18.9',   'Neumonía, no especificada'),
('A09',     'Gastroenteritis y colitis de origen no especificado'),
('K29.7',   'Gastritis, no especificada'),
('K35.8',   'Apendicitis aguda, otras y las no especificadas'),
('K52.9',   'Colitis y gastroenteritis no infecciosas, no especificadas'),
('R50.9',   'Fiebre, no especificada'),
('R56.0',   'Convulsiones febriles'),
('B34.9',   'Infección viral, no especificada'),
('L20.9',   'Dermatitis atópica, no especificada'),
('E44.0',   'Desnutrición proteicocalórica moderada'),
('E66.9',   'Obesidad, no especificada'),
('Q21.0',   'Defecto del tabique ventricular [CIV]'),
('Q22.5',   'Anomalía de Ebstein'),
('9949911', 'Teleinterconsulta síncrona o en línea')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('ia.umbral_confianza',       '0.85',  'RN-06: confiabilidad mínima para registro automático en la HC'),
('agenda.duracion_cita_min',  '30',    'RN-01: minutos por cupo de atención'),
('agenda.horas_turno',        '6',     'RN-01: horas por turno (12 cupos de 30 min)'),
('agenda.hora_inicio_defecto','"08:00"', 'Hora de inicio por defecto de los turnos'),
('notificacion.email.activo', 'true',  'Enviar correo al aprobar una cita'),
('notificacion.whatsapp.activo','true','Enviar WhatsApp al aprobar una cita'),
('hc.digitos',                '7',     'Cantidad de dígitos del número de Historia Clínica')
ON CONFLICT (clave) DO NOTHING;

-- 10.2 Seguridad ------------------------------------------------------
INSERT INTO rol (codigo, nombre, descripcion, es_sistema) VALUES
('ADMIN',         'Administrador',       'Control total, aprobación de citas pagadas y auditoría', TRUE),
('DOCTOR',        'Médico',              'Atención médica, diagnósticos CIE-10 y prescripción',    TRUE),
('DIGITALIZADOR', 'Personal de Archivo', 'Carga, validación y consulta de HC digitalizadas',       TRUE),
('ADMISION',      'Admisión',            'Registro de pacientes y agendamiento de citas',          TRUE),
('RRHH',          'Recursos Humanos',    'Gestión de horarios y turnos de médicos',                TRUE)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO permiso (codigo, descripcion) VALUES
('PACIENTE_GESTIONAR',  'Crear, editar y dar de baja pacientes'),
('CITA_GESTIONAR',      'Crear, reprogramar y cancelar citas'),
('CITA_APROBAR',        'Aprobar citas pendientes de pago'),
('HORARIO_GESTIONAR',   'CRUD de turnos médicos'),
('ATENCION_REGISTRAR',  'Registrar atenciones y recetas'),
('HC_CONSULTAR',        'Consultar historias clínicas'),
('DIGITALIZACION_CARGAR','Subir PDF de historias clínicas'),
('VALIDACION_REVISAR',  'Validar campos extraídos por IA'),
('USUARIO_GESTIONAR',   'CRUD de usuarios y personal'),
('AUDITORIA_VER',       'Consultar auditoría'),
('REPORTE_VER',         'Ver reportes')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM rol r JOIN permiso p ON
     r.codigo = 'ADMIN'
  OR (r.codigo = 'DOCTOR'        AND p.codigo IN ('ATENCION_REGISTRAR','HC_CONSULTAR','CITA_GESTIONAR','REPORTE_VER'))
  OR (r.codigo = 'DIGITALIZADOR' AND p.codigo IN ('DIGITALIZACION_CARGAR','VALIDACION_REVISAR','HC_CONSULTAR'))
  OR (r.codigo = 'ADMISION'      AND p.codigo IN ('PACIENTE_GESTIONAR','CITA_GESTIONAR','HC_CONSULTAR'))
  OR (r.codigo = 'RRHH'          AND p.codigo IN ('HORARIO_GESTIONAR','USUARIO_GESTIONAR'))
ON CONFLICT DO NOTHING;

-- 10.3 Personal de salud ---------------------------------------------
INSERT INTO personal_salud (codigo_institucional, tipo_personal_id, nombres, apellido_paterno, apellido_materno,
                            tipo_documento_id, numero_documento, correo_institucional, telefono)
SELECT v.codigo, tp.tipo_personal_id, v.nombres, v.ap, v.am, td.tipo_documento_identidad_id, v.dni, v.correo, v.tel
FROM (VALUES
    ('MED-10492',  'MEDICO',        'Carlos',   'García',    'Mendoza',  '40192841', 'cgarcia@insn.gob.pe',    '998124571'),
    ('MED-11029',  'MEDICO',        'Elena',    'Rodríguez', 'Paz',      '42981044', 'erodriguez@insn.gob.pe', '987341902'),
    ('ARCH-08210', 'DIGITALIZADOR', 'Mario',    'López',     'Carrión',  '45019283', 'mlopez@insn.gob.pe',     '976512093'),
    ('ADM-03921',  'ADMISION',      'Rosa',     'Torres',    'Cárdenas', '28194021', 'rtorres@insn.gob.pe',    '981029341'),
    ('RRHH-02941', 'RRHH',          'Patricia', 'Flores',    'Vera',     '19482019', 'pflores@insn.gob.pe',    '974819203'),
    ('SIS-00001',  'ADMINISTRADOR', 'Roberto',  'Alarcón',   'Gómez',    '10293847', 'ralarcon@insn.gob.pe',   '999000111')
) AS v(codigo, tipo, nombres, ap, am, dni, correo, tel)
JOIN tipo_personal tp ON tp.codigo = v.tipo
JOIN tipo_documento_identidad td ON td.abreviatura = 'DNI'
ON CONFLICT (codigo_institucional) DO NOTHING;

INSERT INTO medico (personal_id, numero_cmp, numero_rne, verificacion_cmp, observaciones)
SELECT ps.personal_id, v.cmp, v.rne, 'VERIFICADO', v.obs
FROM (VALUES
    ('MED-10492', '45120', '21094', 'Médico pediatra principal turno mañana'),
    ('MED-11029', '52890', '28412', 'Cardióloga infantil')
) AS v(codigo, cmp, rne, obs)
JOIN personal_salud ps ON ps.codigo_institucional = v.codigo
ON CONFLICT (numero_cmp) DO NOTHING;

INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.medico_id, e.especialidad_id
FROM (VALUES ('45120','PED-GEN'), ('52890','PED-CARD')) AS v(cmp, esp)
JOIN medico m ON m.numero_cmp = v.cmp
JOIN especialidad e ON e.codigo = v.esp
ON CONFLICT DO NOTHING;

-- 10.4 Usuarios (contraseña en BCrypt) --------------------------------
--   admin/admin123 · dr.garcia/doc123 · dra.rodriguez/doc123
--   arch.lopez/dig123 · adm.torres/adm123 · rrhh.flores/rrhh123
INSERT INTO usuario (personal_id, nombre_usuario, password_hash, nombre_completo, correo, debe_cambiar_clave)
SELECT ps.personal_id, v.usr, crypt(v.pwd, gen_salt('bf', 10)), v.nombre, ps.correo_institucional, FALSE
FROM (VALUES
    ('SIS-00001',  'admin',         'admin123', 'Lic. Roberto Alarcón Gómez'),
    ('MED-10492',  'dr.garcia',     'doc123',   'Dr. Carlos García Mendoza'),
    ('MED-11029',  'dra.rodriguez', 'doc123',   'Dra. Elena Rodríguez Paz'),
    ('ARCH-08210', 'arch.lopez',    'dig123',   'Lic. Mario López Carrión'),
    ('ADM-03921',  'adm.torres',    'adm123',   'Sra. Rosa Torres Cárdenas'),
    ('RRHH-02941', 'rrhh.flores',   'rrhh123',  'Lic. Patricia Flores Vera')
) AS v(codigo, usr, pwd, nombre)
JOIN personal_salud ps ON ps.codigo_institucional = v.codigo
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO usuario_rol (usuario_id, rol_id)
SELECT u.usuario_id, r.rol_id
FROM (VALUES ('admin','ADMIN'), ('dr.garcia','DOCTOR'), ('dra.rodriguez','DOCTOR'),
             ('arch.lopez','DIGITALIZADOR'), ('adm.torres','ADMISION'), ('rrhh.flores','RRHH')) AS v(usr, rol)
JOIN usuario u ON u.nombre_usuario = v.usr
JOIN rol r     ON r.codigo = v.rol
ON CONFLICT DO NOTHING;

-- 10.5 Pacientes de prueba (HC de 7 dígitos) ---------------------------
INSERT INTO paciente (codigo_paciente, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_registrado, lugar_nacimiento)
VALUES
('PAC-2026-0001', 'Mateo Sebastián', 'Quispe',   'Mamani',     '2020-04-12', 'MASCULINO', 'Lima - Breña'),
('PAC-2026-0002', 'Luciana',         'Flores',   'Huamán',     '2022-01-20', 'FEMENINO',  'Lima - Cercado'),
('PAC-2026-0003', 'Thiago',          'Mendoza',  'Salazar',    '2018-05-03', 'MASCULINO', 'Lima - Jesús María'),
('PAC-2026-0004', 'Jhunior Adael',   'Neira',    'Carhuapoma', '2017-02-14', 'MASCULINO', 'La Libertad - Trujillo'),
('PAC-2026-0005', 'Valeria',         'Alarcón',  'Ríos',       '2024-03-08', 'FEMENINO',  'Lima - Breña'),
('PAC-2026-0006', 'Matías',          'Benítez',  'Cruz',       '2025-06-15', 'MASCULINO', 'Lima - Lince'),
('PAC-2026-0007', 'Camila',          'Rojas',    'Vargas',     '2023-09-01', 'FEMENINO',  'Lima - San Miguel'),
('PAC-2026-0008', 'Joaquín',         'Morales',  'Quispe',     '2022-07-14', 'MASCULINO', 'Lima - SMP')
ON CONFLICT (codigo_paciente) DO NOTHING;

INSERT INTO historia_clinica (paciente_id, numero_historia, fecha_apertura, estado_historia_id)
SELECT p.paciente_id, v.hc, v.apertura::date, e.estado_historia_id
FROM (VALUES
    ('PAC-2026-0001','2020891','2020-04-12'), ('PAC-2026-0002','2022140','2022-02-01'),
    ('PAC-2026-0003','2018051','2018-05-10'), ('PAC-2026-0004','2026009','2026-11-05'),
    ('PAC-2026-0005','2024031','2024-03-10'), ('PAC-2026-0006','2025098','2025-06-20'),
    ('PAC-2026-0007','2023017','2023-09-05'), ('PAC-2026-0008','2022045','2022-07-20')
) AS v(cod, hc, apertura)
JOIN paciente p ON p.codigo_paciente = v.cod
JOIN estado_historia_clinica e ON e.codigo = 'ACTIVA'
ON CONFLICT (paciente_id) DO NOTHING;

INSERT INTO documento_identidad (paciente_id, tipo_documento_id, numero_documento, es_principal, estado_validacion)
SELECT p.paciente_id, td.tipo_documento_identidad_id, v.dni, TRUE, 'VALIDADO'
FROM (VALUES
    ('PAC-2026-0001','78123456'), ('PAC-2026-0002','79234567'), ('PAC-2026-0003','77345678'),
    ('PAC-2026-0004','90247117'), ('PAC-2026-0005','81456789'), ('PAC-2026-0006','82567890'),
    ('PAC-2026-0007','80678901'), ('PAC-2026-0008','79789012')
) AS v(cod, dni)
JOIN paciente p ON p.codigo_paciente = v.cod
JOIN tipo_documento_identidad td ON td.abreviatura = 'DNI'
ON CONFLICT (tipo_documento_id, numero_documento) DO NOTHING;

INSERT INTO familiar_responsable (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
                                  telefono, telefono_whatsapp, correo, direccion)
SELECT v.nom, v.ap, v.am, td.tipo_documento_identidad_id, v.dni, v.cel, v.cel, v.correo, v.dir
FROM (VALUES
    ('Rosa',    'Mamani',     'Quispe',  '41234567', '987654321', 'rosa.mamani@gmail.com',     'Jr. Huaraz 123, Breña'),
    ('Ana',     'Huamán',     'Torres',  '42345678', '986543210', 'ana.huaman@gmail.com',      'Av. Arica 456, Cercado'),
    ('Jorge',   'Mendoza',    'Ríos',    '43456789', '985432109', 'jorge.mendoza@gmail.com',   'Calle Cuba 78, Jesús María'),
    ('María',   'Carhuapoma', 'Díaz',    '44567890', '984321098', 'maria.carhuapoma@gmail.com','Av. España 210, Trujillo'),
    ('Lucía',   'Ríos',       'Paredes', '45678901', '983210987', 'lucia.rios@gmail.com',      'Jr. Pomabamba 33, Breña'),
    ('Pedro',   'Benítez',    'Luna',    '46789012', '982109876', 'pedro.benitez@gmail.com',   'Av. Arequipa 1500, Lince'),
    ('Carmen',  'Vargas',     'León',    '47890123', '981098765', 'carmen.vargas@gmail.com',   'Av. La Marina 900, San Miguel'),
    ('Manuel',  'Morales',    'Quispe',  '10928341', '941238910', 'manuel.morales@gmail.com',  'Jr. Cañete 210, SMP')
) AS v(nom, ap, am, dni, cel, correo, dir)
JOIN tipo_documento_identidad td ON td.abreviatura = 'DNI'
ON CONFLICT (tipo_documento_id, numero_documento) DO NOTHING;

INSERT INTO paciente_responsable (paciente_id, responsable_id, parentesco, es_contacto_principal)
SELECT p.paciente_id, fr.responsable_id, v.parentesco, TRUE
FROM (VALUES
    ('PAC-2026-0001','41234567','Madre'), ('PAC-2026-0002','42345678','Madre'),
    ('PAC-2026-0003','43456789','Padre'), ('PAC-2026-0004','44567890','Madre'),
    ('PAC-2026-0005','45678901','Madre'), ('PAC-2026-0006','46789012','Padre'),
    ('PAC-2026-0007','47890123','Madre'), ('PAC-2026-0008','10928341','Padre')
) AS v(cod, dni, parentesco)
JOIN paciente p ON p.codigo_paciente = v.cod
JOIN familiar_responsable fr ON fr.numero_documento = v.dni
ON CONFLICT DO NOTHING;

-- Ajusta el correlativo de HC al mayor número existente
SELECT setval('seq_numero_historia',
              GREATEST((SELECT COALESCE(MAX(numero_historia::int), 0) FROM historia_clinica), 2026009));

-- 10.6 Turnos de 6 h (08:00-14:00) y citas de ejemplo -------------------
INSERT INTO horario_medico (medico_id, especialidad_id, servicio_id, consultorio, fecha, hora_inicio, hora_fin)
SELECT m.medico_id, me.especialidad_id, s.servicio_id, v.consultorio, v.fecha::date, '08:00', '14:00'
FROM (VALUES
    ('45120','C-101','2026-11-17'), ('45120','C-101','2026-11-18'), ('45120','C-101','2026-11-19'),
    ('45120','C-101','2026-11-20'), ('45120','C-101','2026-11-21'),
    ('52890','C-205','2026-11-18'), ('52890','C-205','2026-11-19'), ('52890','C-205','2026-11-22')
) AS v(cmp, consultorio, fecha)
JOIN medico m ON m.numero_cmp = v.cmp
JOIN medico_especialidad me ON me.medico_id = m.medico_id
JOIN servicio_clinico s ON s.codigo = 'CONS-EXT'
WHERE NOT EXISTS (SELECT 1 FROM horario_medico h WHERE h.medico_id = m.medico_id AND h.fecha = v.fecha::date);

INSERT INTO cita (paciente_id, medico_id, horario_id, especialidad_id, fecha_hora_inicio, fecha_hora_fin,
                  estado, origen, motivo, creado_por, aprobado_por, fecha_aprobacion)
SELECT p.paciente_id, h.medico_id, h.horario_id, h.especialidad_id,
       (h.fecha + v.hora::time), (h.fecha + v.hora::time + interval '30 minutes'),
       v.estado, v.origen, v.motivo, u.usuario_id,
       CASE WHEN v.estado = 'APROBADA' THEN u.usuario_id END,
       CASE WHEN v.estado = 'APROBADA' THEN now() END
FROM (VALUES
    ('PAC-2026-0001','45120','2026-11-17','08:00','APROBADA', 'ADMISION','Control de crecimiento y desarrollo - fiebre persistente'),
    ('PAC-2026-0002','45120','2026-11-17','08:30','APROBADA', 'ADMISION','Tos espasmódica y dificultad respiratoria leve'),
    ('PAC-2026-0003','45120','2026-11-17','09:00','PENDIENTE','DOCTOR',  'Control posterior solicitado por el doctor (requiere pago)'),
    ('PAC-2026-0004','52890','2026-11-18','12:00','APROBADA', 'ADMISION','Seguimiento de anomalía de Ebstein'),
    ('PAC-2026-0006','45120','2026-11-19','08:30','PENDIENTE','DOCTOR',  'Interconsulta por dermatitis atópica'),
    ('PAC-2026-0008','52890','2026-11-19','10:30','APROBADA', 'ADMISION','Ecocardiograma de control'),
    ('PAC-2026-0007','45120','2026-11-20','09:30','APROBADA', 'ADMISION','Cuadro diarreico agudo'),
    ('PAC-2026-0005','52890','2026-11-22','10:00','APROBADA', 'ADMISION','Evaluación por soplo sistólico')
) AS v(cod, cmp, fecha, hora, estado, origen, motivo)
JOIN paciente p ON p.codigo_paciente = v.cod
JOIN medico m   ON m.numero_cmp = v.cmp
JOIN horario_medico h ON h.medico_id = m.medico_id AND h.fecha = v.fecha::date AND h.estado = 'ACTIVO'
JOIN usuario u  ON u.nombre_usuario = 'adm.torres'
ON CONFLICT DO NOTHING;
