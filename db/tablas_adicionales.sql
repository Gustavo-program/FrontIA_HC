-- ============================================================
-- BASE DE DATOS: Sistema de Gestión de Historias Clínicas Electrónicas
-- Instituto Nacional de Salud del Niño (INSN)
-- Script Complementario: Nuevas Tablas + Datos Semilla (Seeds)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. TABLAS ADICIONALES
-- ============================================================

-- 1.1 Catálogo CIE-10
CREATE TABLE IF NOT EXISTS cie10 (
    cie10_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(10) NOT NULL UNIQUE,
    descripcion     VARCHAR(255) NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_cie10_codigo ON cie10(codigo);
CREATE INDEX IF NOT EXISTS idx_cie10_descripcion_trgm ON cie10 USING GIN (descripcion gin_trgm_ops);

-- 1.2 Horarios y turnos de médicos (RN-01: 6 horas)
CREATE TABLE IF NOT EXISTS horario_medico (
    horario_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id       UUID NOT NULL REFERENCES medico(medico_id) ON DELETE RESTRICT,
    servicio_id     UUID REFERENCES servicio_clinico(servicio_id) ON DELETE RESTRICT,
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
CREATE INDEX IF NOT EXISTS idx_horario_medico_fecha ON horario_medico(medico_id, fecha);

-- 1.3 Citas médicas (RN-01: cupos de 30 min, RN-03/RN-04)
CREATE TABLE IF NOT EXISTS cita (
    cita_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id         UUID NOT NULL REFERENCES paciente(paciente_id) ON DELETE RESTRICT,
    medico_id           UUID NOT NULL REFERENCES medico(medico_id) ON DELETE RESTRICT,
    horario_id          UUID NOT NULL REFERENCES horario_medico(horario_id) ON DELETE RESTRICT,
    especialidad_id     UUID REFERENCES especialidad(especialidad_id) ON DELETE RESTRICT,
    fecha_hora_inicio   TIMESTAMPTZ NOT NULL,
    fecha_hora_fin      TIMESTAMPTZ NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado IN ('PENDIENTE','APROBADA','ATENDIDA','CANCELADA','NO_ASISTIO')),
    origen              VARCHAR(20) NOT NULL DEFAULT 'ADMISION'
                        CHECK (origen IN ('ADMISION','DOCTOR')),
    motivo              TEXT,
    creado_por          UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    aprobado_por        UUID REFERENCES usuario(usuario_id) ON DELETE RESTRICT,
    fecha_aprobacion    TIMESTAMPTZ,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_cita_horario CHECK (fecha_hora_fin > fecha_hora_inicio)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cita_medico_inicio
    ON cita (medico_id, fecha_hora_inicio)
    WHERE estado IN ('PENDIENTE','APROBADA');
CREATE INDEX IF NOT EXISTS idx_cita_paciente ON cita(paciente_id);
CREATE INDEX IF NOT EXISTS idx_cita_medico_fecha ON cita(medico_id, fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_cita_estado ON cita(estado);

-- 1.4 Atención médica (consulta y digitalización)
CREATE TABLE IF NOT EXISTS atencion (
    atencion_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    historia_clinica_id     UUID NOT NULL REFERENCES historia_clinica(historia_clinica_id) ON DELETE RESTRICT,
    cita_id                 UUID REFERENCES cita(cita_id) ON DELETE RESTRICT,
    medico_id               UUID NOT NULL REFERENCES medico(medico_id) ON DELETE RESTRICT,
    servicio_id             UUID REFERENCES servicio_clinico(servicio_id) ON DELETE RESTRICT,
    fecha_atencion          TIMESTAMPTZ NOT NULL DEFAULT now(),
    motivo_consulta         TEXT NOT NULL,
    antecedentes            TEXT,
    observaciones           TEXT,
    recomendaciones         TEXT,
    estado                  VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
                            CHECK (estado IN ('BORRADOR','FINALIZADA')),
    origen                  VARCHAR(20) NOT NULL DEFAULT 'CONSULTA'
                            CHECK (origen IN ('CONSULTA','DIGITALIZACION')),
    documento_clinico_id    UUID REFERENCES documento_clinico(documento_clinico_id) ON DELETE RESTRICT,
    creado_en               TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT now(),
    finalizado_en           TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_atencion_historia ON atencion(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_atencion_cita ON atencion(cita_id);
CREATE INDEX IF NOT EXISTS idx_atencion_medico_fecha ON atencion(medico_id, fecha_atencion);

-- 1.5 Diagnósticos de atención
CREATE TABLE IF NOT EXISTS atencion_diagnostico (
    atencion_diagnostico_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id             UUID NOT NULL REFERENCES atencion(atencion_id) ON DELETE RESTRICT,
    cie10_id                UUID NOT NULL REFERENCES cie10(cie10_id) ON DELETE RESTRICT,
    tipo                    VARCHAR(20) NOT NULL DEFAULT 'PRINCIPAL'
                            CHECK (tipo IN ('PRINCIPAL','SECUNDARIO')),
    observaciones           TEXT,
    UNIQUE (atencion_id, cie10_id)
);
CREATE INDEX IF NOT EXISTS idx_atencion_diagnostico_cie10 ON atencion_diagnostico(cie10_id);

-- 1.6 Receta médica
CREATE TABLE IF NOT EXISTS receta (
    receta_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id         UUID NOT NULL REFERENCES atencion(atencion_id) ON DELETE RESTRICT,
    indicaciones        TEXT,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_receta_atencion ON receta(atencion_id);

-- 1.7 Medicamentos de la receta
CREATE TABLE IF NOT EXISTS receta_medicamento (
    receta_medicamento_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id             UUID NOT NULL REFERENCES receta(receta_id) ON DELETE CASCADE,
    nombre                VARCHAR(200) NOT NULL,
    concentracion         VARCHAR(100),
    dosis                 VARCHAR(100) NOT NULL,
    frecuencia            VARCHAR(100) NOT NULL,
    duracion              VARCHAR(100) NOT NULL,
    cantidad              INTEGER NOT NULL CHECK (cantidad > 0),
    observaciones         TEXT,
    orden                 INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_receta_medicamento_receta ON receta_medicamento(receta_id);

-- 1.8 Envío de receta (Email / WhatsApp)
CREATE TABLE IF NOT EXISTS envio_receta (
    envio_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id           UUID NOT NULL REFERENCES receta(receta_id) ON DELETE RESTRICT,
    canal               VARCHAR(20) NOT NULL
                        CHECK (canal IN ('EMAIL','WHATSAPP')),
    destino             VARCHAR(254) NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado IN ('PENDIENTE','ENVIADO','ERROR')),
    fecha_envio         TIMESTAMPTZ,
    detalle_error       TEXT,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_envio_receta_receta ON envio_receta(receta_id);

-- 1.9 Ajuste en familiar_responsable para WhatsApp (RN-10)
ALTER TABLE familiar_responsable
    ADD COLUMN IF NOT EXISTS telefono_whatsapp VARCHAR(30);

-- ============================================================
-- 2. DATOS SEMILLA (SEEDS)
-- ============================================================

-- Roles
INSERT INTO rol (codigo, nombre, descripcion, es_sistema) VALUES
('ADMIN', 'Administrador', 'Control total y auditoría del sistema', true),
('DOCTOR', 'Médico', 'Atención médica, diagnósticos CIE-10 y prescripción', true),
('DIGITALIZADOR', 'Personal de Archivo', 'Carga y validación manual de HC digitalizadas', true),
('ADMISION', 'Admisión', 'Registro de pacientes y agendamiento de citas', true),
('RRHH', 'Recursos Humanos', 'Gestión de horarios y turnos de médicos', true)
ON CONFLICT (codigo) DO NOTHING;

-- Tipos de Documento de Identidad
INSERT INTO tipo_documento_identidad (descripcion, abreviatura, longitud, activo) VALUES
('Documento Nacional de Identidad', 'DNI', 8, true),
('Carné de Extranjería', 'CE', 12, true),
('Pasaporte', 'PAS', 12, true),
('Partida de Nacimiento', 'PN', 10, true)
ON CONFLICT (descripcion) DO NOTHING;

-- Especialidades Médicas
INSERT INTO especialidad (codigo, nombre, activa) VALUES
('PED-GEN', 'Pediatría General', true),
('PED-CARD', 'Cardiología Pediátrica', true),
('PED-NEUR', 'Neurología Pediátrica', true),
('PED-CIR', 'Cirugía Pediátrica', true),
('PED-NEUM', 'Neumología Pediátrica', true),
('PED-GAST', 'Gastroenterología Pediátrica', true)
ON CONFLICT (nombre) DO NOTHING;

-- Servicios Clínicos
INSERT INTO servicio_clinico (codigo, nombre, activo) VALUES
('CONS-EXT', 'Consulta Externa Breña', true),
('EMERG-PED', 'Emergencia Pediátrica', true),
('HOSP-MED', 'Hospitalización Medicina', true),
('UCI-PED', 'UCI Pediátrica', true)
ON CONFLICT (servicio_padre_id, nombre) DO NOTHING;

-- Catálogo CIE-10 Inicial
INSERT INTO cie10 (codigo, descripcion, activo) VALUES
('J00', 'Rinofaringitis aguda [resfriado común]', true),
('J02.9', 'Faringitis aguda, no especificada', true),
('J20.9', 'Bronquitis aguda, no especificada', true),
('J45.9', 'Asma, no especificada', true),
('A09', 'Gastroenteritis y colitis de origen no especificado', true),
('K52.9', 'Colitis y gastroenteritis no infecciosas, no especificadas', true),
('R50.9', 'Fiebre, no especificada', true),
('B34.9', 'Infección viral, no especificada', true),
('L20.9', 'Dermatitis atópica, no especificada', true),
('E66.9', 'Obesidad, no especificada', true),
('E44.0', 'Desnutrición proteicocalórica moderada', true),
('Q21.0', 'Defecto del tabique ventricular [CIV]', true)
ON CONFLICT (codigo) DO NOTHING;

-- Parámetros del Sistema (RN-01, RN-06)
INSERT INTO configuracion_sistema (clave, valor, descripcion, editable) VALUES
('ia.umbral_confianza', '0.85'::jsonb, 'Umbral mínimo de confiabilidad IA (85%) para registro automático en HC', true),
('agenda.duracion_cita_min', '30'::jsonb, 'Duración en minutos de cada cupo de atención médica', true),
('agenda.horas_turno', '6'::jsonb, 'Horas por turno médico (genera exactamente 12 cupos de 30 min)', true)
ON CONFLICT (clave) DO NOTHING;

COMMIT;
