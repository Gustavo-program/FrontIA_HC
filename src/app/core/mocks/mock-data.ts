import { UsuarioSesion } from '../models/session.model';
import { Paciente } from '../../shared/models/paciente.model';
import { Medico, PersonalSalud } from '../../shared/models/medico.model';
import { Especialidad, ServicioClinico, Cie10, TipoDocumentoIdentidad, ConfiguracionSistema } from '../../shared/models/catalogo.model';
import { Cita, HorarioMedico } from '../../shared/models/cita.model';
import { Atencion } from '../../shared/models/atencion.model';
import { DocumentoClinico, RevisionDocumental } from '../../shared/models/documento.model';
import { Auditoria } from '../../shared/models/auditoria.model';

export const MOCK_USUARIOS: (UsuarioSesion & { passwordHash: string })[] = [
  {
    usuarioId: 'u-admin-01',
    nombreUsuario: 'admin',
    passwordHash: 'admin123',
    nombreCompleto: 'Lic. Roberto Alarcón Gómez',
    correo: 'admin@insn.gob.pe',
    roles: [{ rolId: 'r-admin', codigo: 'ADMIN', nombre: 'Administrador General' }],
    debeCambiarClave: false
  },
  {
    usuarioId: 'u-doc-01',
    medicoId: 'med-01',
    personalId: 'per-01',
    nombreUsuario: 'dr.garcia',
    passwordHash: 'doc123',
    nombreCompleto: 'Dr. Carlos García Mendoza',
    correo: 'cgarcia@insn.gob.pe',
    roles: [{ rolId: 'r-doc', codigo: 'DOCTOR', nombre: 'Médico Asistencial' }],
    debeCambiarClave: false
  },
  {
    usuarioId: 'u-doc-02',
    medicoId: 'med-02',
    personalId: 'per-02',
    nombreUsuario: 'dra.rodriguez',
    passwordHash: 'doc123',
    nombreCompleto: 'Dra. Elena Rodríguez Paz',
    correo: 'erodriguez@insn.gob.pe',
    roles: [{ rolId: 'r-doc', codigo: 'DOCTOR', nombre: 'Médico Asistencial' }],
    debeCambiarClave: false
  },
  {
    usuarioId: 'u-dig-01',
    personalId: 'per-03',
    nombreUsuario: 'arch.lopez',
    passwordHash: 'dig123',
    nombreCompleto: 'Lic. Mario López Carrión',
    correo: 'mlopez@insn.gob.pe',
    roles: [{ rolId: 'r-dig', codigo: 'DIGITALIZADOR', nombre: 'Personal de Archivo / Digitalizador' }],
    debeCambiarClave: false
  },
  {
    usuarioId: 'u-adm-01',
    personalId: 'per-04',
    nombreUsuario: 'adm.torres',
    passwordHash: 'adm123',
    nombreCompleto: 'Sra. Rosa Torres Cárdenas',
    correo: 'rtorres@insn.gob.pe',
    roles: [{ rolId: 'r-adm', codigo: 'ADMISION', nombre: 'Personal de Admisión' }],
    debeCambiarClave: false
  },
  {
    usuarioId: 'u-rrhh-01',
    personalId: 'per-05',
    nombreUsuario: 'rrhh.flores',
    passwordHash: 'rrhh123',
    nombreCompleto: 'Lic. Patricia Flores Vera',
    correo: 'pflores@insn.gob.pe',
    roles: [{ rolId: 'r-rrhh', codigo: 'RRHH', nombre: 'Recursos Humanos' }],
    debeCambiarClave: false
  }
];

export const MOCK_TIPOS_DOCUMENTO: TipoDocumentoIdentidad[] = [
  { tipoDocumentoIdentidadId: 'td-01', descripcion: 'Documento Nacional de Identidad', abreviatura: 'DNI', longitud: 8, activo: true },
  { tipoDocumentoIdentidadId: 'td-02', descripcion: 'Carné de Extranjería', abreviatura: 'CE', longitud: 12, activo: true },
  { tipoDocumentoIdentidadId: 'td-03', descripcion: 'Pasaporte', abreviatura: 'PAS', longitud: 12, activo: true },
  { tipoDocumentoIdentidadId: 'td-04', descripcion: 'Partida de Nacimiento', abreviatura: 'PN', longitud: 10, activo: true }
];

export const MOCK_ESPECIALIDADES: Especialidad[] = [
  { especialidadId: 'esp-01', codigo: 'PED-GEN', nombre: 'Pediatría General', activa: true },
  { especialidadId: 'esp-02', codigo: 'PED-CARD', nombre: 'Cardiología Pediátrica', activa: true },
  { especialidadId: 'esp-03', codigo: 'PED-NEUR', nombre: 'Neurología Pediátrica', activa: true },
  { especialidadId: 'esp-04', codigo: 'PED-CIR', nombre: 'Cirugía Pediátrica', activa: true },
  { especialidadId: 'esp-05', codigo: 'PED-NEUM', nombre: 'Neumología Pediátrica', activa: true },
  { especialidadId: 'esp-06', codigo: 'PED-GAST', nombre: 'Gastroenterología Pediátrica', activa: true }
];

export const MOCK_SERVICIOS: ServicioClinico[] = [
  { servicioId: 'ser-01', codigo: 'CONS-EXT', nombre: 'Consulta Externa Breña', activo: true },
  { servicioId: 'ser-02', codigo: 'EMERG-PED', nombre: 'Emergencia Pediátrica', activo: true },
  { servicioId: 'ser-03', codigo: 'HOSP-MED', nombre: 'Hospitalización Medicina', activo: true },
  { servicioId: 'ser-04', codigo: 'UCI-PED', nombre: 'UCI Pediátrica', activo: true }
];

export const MOCK_MEDICOS: Medico[] = [
  {
    medicoId: 'med-01',
    personalId: 'per-01',
    personal: {
      personalId: 'per-01',
      codigoInstitucional: 'MED-10492',
      tipoPersonalId: 'tp-01',
      tipoPersonalNombre: 'Médico Especialista',
      nombres: 'Carlos',
      apellidoPaterno: 'García',
      apellidoMaterno: 'Mendoza',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '40192841',
      correoInstitucional: 'cgarcia@insn.gob.pe',
      telefono: '998124571',
      estado: 'ACTIVO'
    },
    numeroCmp: '45120',
    numeroRne: '21094',
    verificacionCmp: 'VERIFICADO',
    especialidades: [
      { especialidadId: 'esp-01', codigo: 'PED-GEN', nombre: 'Pediatría General', activa: true }
    ],
    observaciones: 'Médico pediatra principal turno mañana'
  },
  {
    medicoId: 'med-02',
    personalId: 'per-02',
    personal: {
      personalId: 'per-02',
      codigoInstitucional: 'MED-11029',
      tipoPersonalId: 'tp-01',
      tipoPersonalNombre: 'Médico Especialista',
      nombres: 'Elena',
      apellidoPaterno: 'Rodríguez',
      apellidoMaterno: 'Paz',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '42981044',
      correoInstitucional: 'erodriguez@insn.gob.pe',
      telefono: '987341902',
      estado: 'ACTIVO'
    },
    numeroCmp: '52890',
    numeroRne: '28412',
    verificacionCmp: 'VERIFICADO',
    especialidades: [
      { especialidadId: 'esp-02', codigo: 'PED-CARD', nombre: 'Cardiología Pediátrica', activa: true }
    ],
    observaciones: 'Cardióloga infantil'
  }
];

export const MOCK_PERSONAL: PersonalSalud[] = [
  {
    personalId: 'per-01',
    codigoInstitucional: 'MED-10492',
    tipoPersonalId: 'tp-01',
    tipoPersonalNombre: 'Médico Especialista',
    nombres: 'Carlos',
    apellidoPaterno: 'García',
    apellidoMaterno: 'Mendoza',
    tipoDocumentoId: 'td-01',
    numeroDocumento: '40192841',
    correoInstitucional: 'cgarcia@insn.gob.pe',
    telefono: '998124571',
    estado: 'ACTIVO'
  },
  {
    personalId: 'per-02',
    codigoInstitucional: 'MED-11029',
    tipoPersonalId: 'tp-01',
    tipoPersonalNombre: 'Médico Especialista',
    nombres: 'Elena',
    apellidoPaterno: 'Rodríguez',
    apellidoMaterno: 'Paz',
    tipoDocumentoId: 'td-01',
    numeroDocumento: '42981044',
    correoInstitucional: 'erodriguez@insn.gob.pe',
    telefono: '987341902',
    estado: 'ACTIVO'
  },
  {
    personalId: 'per-03',
    codigoInstitucional: 'ARCH-08210',
    tipoPersonalId: 'tp-02',
    tipoPersonalNombre: 'Digitalizador de Archivo',
    nombres: 'Mario',
    apellidoPaterno: 'López',
    apellidoMaterno: 'Carrión',
    tipoDocumentoId: 'td-01',
    numeroDocumento: '38192041',
    correoInstitucional: 'mlopez@insn.gob.pe',
    telefono: '992182741',
    estado: 'ACTIVO'
  },
  {
    personalId: 'per-04',
    codigoInstitucional: 'ADM-05412',
    tipoPersonalId: 'tp-03',
    tipoPersonalNombre: 'Personal de Admisión',
    nombres: 'Rosa',
    apellidoPaterno: 'Torres',
    apellidoMaterno: 'Cárdenas',
    tipoDocumentoId: 'td-01',
    numeroDocumento: '28194021',
    correoInstitucional: 'rtorres@insn.gob.pe',
    telefono: '981029341',
    estado: 'ACTIVO'
  },
  {
    personalId: 'per-05',
    codigoInstitucional: 'RRHH-02941',
    tipoPersonalId: 'tp-04',
    tipoPersonalNombre: 'Especialista en RR. HH.',
    nombres: 'Patricia',
    apellidoPaterno: 'Flores',
    apellidoMaterno: 'Vera',
    tipoDocumentoId: 'td-01',
    numeroDocumento: '19482019',
    correoInstitucional: 'pflores@insn.gob.pe',
    telefono: '974819203',
    estado: 'ACTIVO'
  }
];

export const MOCK_CIE10: Cie10[] = [
  { cie10Id: 'cie-01', codigo: 'J00', descripcion: 'Rinofaringitis aguda [resfriado común]', activo: true },
  { cie10Id: 'cie-02', codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada', activo: true },
  { cie10Id: 'cie-03', codigo: 'J20.9', descripcion: 'Bronquitis aguda, no especificada', activo: true },
  { cie10Id: 'cie-04', codigo: 'J45.9', descripcion: 'Asma, no especificada', activo: true },
  { cie10Id: 'cie-05', codigo: 'A09', descripcion: 'Gastroenteritis y colitis de origen no especificado', activo: true },
  { cie10Id: 'cie-06', codigo: 'K52.9', descripcion: 'Colitis y gastroenteritis no infecciosas, no especificadas', activo: true },
  { cie10Id: 'cie-07', codigo: 'R50.9', descripcion: 'Fiebre, no especificada', activo: true },
  { cie10Id: 'cie-08', codigo: 'B34.9', descripcion: 'Infección viral, no especificada', activo: true },
  { cie10Id: 'cie-09', codigo: 'L20.9', descripcion: 'Dermatitis atópica, no especificada', activo: true },
  { cie10Id: 'cie-10', codigo: 'E66.9', descripcion: 'Obesidad, no especificada', activo: true },
  { cie10Id: 'cie-11', codigo: 'E44.0', descripcion: 'Desnutrición proteicocalórica moderada', activo: true },
  { cie10Id: 'cie-12', codigo: 'Q21.0', descripcion: 'Defecto del tabique ventricular [CIV]', activo: true },
  { cie10Id: 'cie-13', codigo: 'Q22.5', descripcion: 'Anomalía de Ebstein', activo: true },
  { cie10Id: 'cie-14', codigo: '9949911', descripcion: 'Teleinterconsulta síncrona o en línea', activo: true },
  { cie10Id: 'cie-15', codigo: 'K35.8', descripcion: 'Apendicitis aguda, otras y las no especificadas', activo: true },
  { cie10Id: 'cie-16', codigo: 'R56.0', descripcion: 'Convulsiones febriles', activo: true },
  { cie10Id: 'cie-17', codigo: 'J45.0', descripcion: 'Asma predominantemente alérgica', activo: true },
  { cie10Id: 'cie-18', codigo: 'J18.9', descripcion: 'Neumonía, no especificada', activo: true },
  { cie10Id: 'cie-19', codigo: 'K29.7', descripcion: 'Gastritis, no especificada', activo: true }
];

export const MOCK_PACIENTES: Paciente[] = [
  {
    pacienteId: 'pac-01',
    codigoPaciente: 'PAC-2026-0001',
    nombres: 'Mateo Sebastián',
    apellidoPaterno: 'Quispe',
    apellidoMaterno: 'Mamani',
    fechaNacimiento: '2020-04-12',
    sexoRegistrado: 'MASCULINO',
    lugarNacimiento: 'Lima - Breña',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2020891',
    historiaClinicaId: 'hc-01',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-01',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '76891234',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-01',
        nombres: 'María Teresa',
        apellidoPaterno: 'Mamani',
        apellidoMaterno: 'Condori',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '41982736',
        telefono: '991283746',
        telefonoWhatsapp: '991283746',
        correo: 'maria.mamani@gmail.com',
        direccion: 'Jr. Iquique 340, Breña, Lima',
        parentesco: 'Madre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-01-10T09:30:00Z'
  },
  {
    pacienteId: 'pac-02',
    codigoPaciente: 'PAC-2026-0002',
    nombres: 'Luciana Valeria',
    apellidoPaterno: 'Flores',
    apellidoMaterno: 'Ramos',
    fechaNacimiento: '2022-09-25',
    sexoRegistrado: 'FEMENINO',
    lugarNacimiento: 'Lima - Jesús María',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2022140',
    historiaClinicaId: 'hc-02',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-02',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '79201948',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-02',
        nombres: 'Jorge Luis',
        apellidoPaterno: 'Flores',
        apellidoMaterno: 'Vásquez',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '10928374',
        telefono: '984512390',
        telefonoWhatsapp: '984512390',
        correo: 'jorge.flores@hotmail.com',
        direccion: 'Av. Brasil 1240 Dpto 402, Lima',
        parentesco: 'Padre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-02-14T11:20:00Z'
  },
  {
    pacienteId: 'pac-03',
    codigoPaciente: 'PAC-2026-0003',
    nombres: 'Thiago Gael',
    apellidoPaterno: 'Mendoza',
    apellidoMaterno: 'Dávila',
    fechaNacimiento: '2018-11-03',
    sexoRegistrado: 'MASCULINO',
    lugarNacimiento: 'Callao',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2018051',
    historiaClinicaId: 'hc-03',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-03',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '74192837',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-03',
        nombres: 'Carla Elena',
        apellidoPaterno: 'Dávila',
        apellidoMaterno: 'Sánchez',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '43920184',
        telefono: '951234876',
        telefonoWhatsapp: '951234876',
        correo: 'carla.davila@gmail.com',
        direccion: 'Urb. Albino Herrera, Callao',
        parentesco: 'Madre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-03-01T08:15:00Z'
  },
  {
    pacienteId: 'pac-04',
    codigoPaciente: 'PAC-2026-0004',
    nombres: 'JHUNIOR ADAEL',
    apellidoPaterno: 'NEIRA',
    apellidoMaterno: 'CARHUAPOMA',
    fechaNacimiento: '2017-05-10',
    sexoRegistrado: 'MASCULINO',
    lugarNacimiento: 'Trujillo - La Libertad',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2026009',
    historiaClinicaId: 'hc-2026009',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-04',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '90247117',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-04',
        nombres: 'Rosa',
        apellidoPaterno: 'Carhuapoma',
        apellidoMaterno: 'Pérez',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '42981726',
        telefono: '947487707',
        telefonoWhatsapp: '947487707',
        correo: 'familia.neira@gmail.com',
        direccion: 'Av. España 1120, Trujillo (Referido a INSN Breña)',
        parentesco: 'Madre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-11-05T11:56:00Z'
  },
  {
    pacienteId: 'pac-05',
    codigoPaciente: 'PAC-2026-0005',
    nombres: 'Valeria Sofía',
    apellidoPaterno: 'Alarcón',
    apellidoMaterno: 'Castillo',
    fechaNacimiento: '2021-08-14',
    sexoRegistrado: 'FEMENINO',
    lugarNacimiento: 'Huancayo - Junín',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2024031',
    historiaClinicaId: 'hc-05',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-05',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '78451290',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-05',
        nombres: 'Patricia',
        apellidoPaterno: 'Castillo',
        apellidoMaterno: 'Solano',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '41829034',
        telefono: '964128930',
        telefonoWhatsapp: '964128930',
        correo: 'pcastillo@gmail.com',
        direccion: 'Jr. Puno 450, Huancayo (Referida a Cirugía Pediátrica)',
        parentesco: 'Madre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-04-10T14:20:00Z'
  },
  {
    pacienteId: 'pac-06',
    codigoPaciente: 'PAC-2026-0006',
    nombres: 'Matías Nicolás',
    apellidoPaterno: 'Benítez',
    apellidoMaterno: 'Huamán',
    fechaNacimiento: '2023-02-18',
    sexoRegistrado: 'MASCULINO',
    lugarNacimiento: 'Ica',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2025098',
    historiaClinicaId: 'hc-06',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-06',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '82390145',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-06',
        nombres: 'Ricardo',
        apellidoPaterno: 'Benítez',
        apellidoMaterno: 'Peña',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '43901823',
        telefono: '956712349',
        telefonoWhatsapp: '956712349',
        correo: 'ricardo.benitez@outlook.com',
        direccion: 'Av. San Martín 820, Ica',
        parentesco: 'Padre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-05-18T08:45:00Z'
  },
  {
    pacienteId: 'pac-07',
    codigoPaciente: 'PAC-2026-0007',
    nombres: 'Camila Esperanza',
    apellidoPaterno: 'Rojas',
    apellidoMaterno: 'Paredes',
    fechaNacimiento: '2019-10-05',
    sexoRegistrado: 'FEMENINO',
    lugarNacimiento: 'Lima - Comas',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2023017',
    historiaClinicaId: 'hc-07',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-07',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '75128934',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-07',
        nombres: 'Elena',
        apellidoPaterno: 'Paredes',
        apellidoMaterno: 'Vega',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '40918234',
        telefono: '987654321',
        telefonoWhatsapp: '987654321',
        correo: 'elena.paredes@gmail.com',
        direccion: 'Av. Túpac Amaru 3420, Comas, Lima',
        parentesco: 'Madre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-06-01T10:00:00Z'
  },
  {
    pacienteId: 'pac-08',
    codigoPaciente: 'PAC-2026-0008',
    nombres: 'Joaquín Alonso',
    apellidoPaterno: 'Morales',
    apellidoMaterno: 'Espinoza',
    fechaNacimiento: '2022-06-11',
    sexoRegistrado: 'MASCULINO',
    lugarNacimiento: 'Lima - San Martín de Porres',
    paisNacimiento: 'Perú',
    estadoRegistro: 'ACTIVO',
    numeroHistoria: '2022045',
    historiaClinicaId: 'hc-08',
    documentoPrincipal: {
      documentoIdentidadId: 'doc-pac-08',
      tipoDocumentoId: 'td-01',
      numeroDocumento: '73819204',
      esPrincipal: true,
      estadoValidacion: 'VALIDADO'
    },
    responsables: [
      {
        responsableId: 'resp-08',
        nombres: 'Manuel',
        apellidoPaterno: 'Morales',
        apellidoMaterno: 'Quispe',
        tipoDocumentoId: 'td-01',
        numeroDocumento: '10928341',
        telefono: '941238910',
        telefonoWhatsapp: '941238910',
        correo: 'manuel.morales@gmail.com',
        direccion: 'Jr. Cañete 210, SMP, Lima',
        parentesco: 'Padre',
        esContactoPrincipal: true
      }
    ],
    creadoEn: '2026-07-14T11:30:00Z'
  }
];

export const MOCK_CITAS: Cita[] = [
  {
    citaId: 'cita-10',
    pacienteId: 'pac-05',
    paciente: MOCK_PACIENTES[4], // Valeria Alarcón (2024031)
    medicoId: 'med-02',
    medico: MOCK_MEDICOS[1],
    horarioId: 'hor-02',
    especialidadId: 'esp-02',
    especialidad: MOCK_ESPECIALIDADES[1],
    fechaHoraInicio: '2026-11-22T10:00:00',
    fechaHoraFin: '2026-11-22T10:30:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Evaluación cardiológica por soplo sistólico detectado en control'
  },
  {
    citaId: 'cita-09',
    pacienteId: 'pac-01',
    paciente: MOCK_PACIENTES[0], // Mateo Quispe (2020891)
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-21T11:30:00',
    fechaHoraFin: '2026-11-21T12:00:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Control de vacunas y evaluación de crecimiento y desarrollo'
  },
  {
    citaId: 'cita-08',
    pacienteId: 'pac-07',
    paciente: MOCK_PACIENTES[6], // Camila Rojas (2023017)
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-20T09:30:00',
    fechaHoraFin: '2026-11-20T10:00:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Chequeo pediátrico por cuadro diarreico agudo y deshidratación leve'
  },
  {
    citaId: 'cita-07',
    pacienteId: 'pac-08',
    paciente: MOCK_PACIENTES[7], // Joaquín Morales (2022045)
    medicoId: 'med-02',
    medico: MOCK_MEDICOS[1],
    horarioId: 'hor-02',
    especialidadId: 'esp-02',
    especialidad: MOCK_ESPECIALIDADES[1],
    fechaHoraInicio: '2026-11-19T10:30:00',
    fechaHoraFin: '2026-11-19T11:00:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Ecocardiograma de control postoperatorio'
  },
  {
    citaId: 'cita-06',
    pacienteId: 'pac-06',
    paciente: MOCK_PACIENTES[5], // Matías Benítez (2025098)
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-19T08:30:00',
    fechaHoraFin: '2026-11-19T09:00:00',
    estado: 'PENDIENTE',
    origen: 'DOCTOR',
    motivo: 'Interconsulta por dermatitis atópica y alergia alimentaria'
  },
  {
    citaId: 'cita-05',
    pacienteId: 'pac-04',
    paciente: MOCK_PACIENTES[3], // Jhunior Neira (2026009)
    medicoId: 'med-02',
    medico: MOCK_MEDICOS[1],
    horarioId: 'hor-02',
    especialidadId: 'esp-02',
    especialidad: MOCK_ESPECIALIDADES[1],
    fechaHoraInicio: '2026-11-18T12:00:00',
    fechaHoraFin: '2026-11-18T12:30:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Teleinterconsulta y seguimiento de anomalía de Ebstein'
  },
  {
    citaId: 'cita-04',
    pacienteId: 'pac-02',
    paciente: MOCK_PACIENTES[1], // Luciana Flores (2022140)
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-18T09:00:00',
    fechaHoraFin: '2026-11-18T09:30:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Control de asma bronquial e indicación de inhaladores'
  },
  {
    citaId: 'cita-03',
    pacienteId: 'pac-03',
    paciente: MOCK_PACIENTES[2], // Thiago Mendoza (2018051)
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-17T09:00:00',
    fechaHoraFin: '2026-11-17T09:30:00',
    estado: 'PENDIENTE',
    origen: 'DOCTOR',
    motivo: 'Cita de control posterior solicitada por el doctor (Requiere pago)'
  },
  {
    citaId: 'cita-02',
    pacienteId: 'pac-02',
    paciente: MOCK_PACIENTES[1], // Luciana Flores (2022140)
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-17T08:30:00',
    fechaHoraFin: '2026-11-17T09:00:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Tos espasmódica y dificultad respiratoria leve'
  },
  {
    citaId: 'cita-01',
    pacienteId: 'pac-01',
    paciente: MOCK_PACIENTES[0], // Mateo Quispe (2020891)
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-17T08:00:00',
    fechaHoraFin: '2026-11-17T08:30:00',
    estado: 'APROBADA',
    origen: 'ADMISION',
    motivo: 'Control de crecimiento y desarrollo - fiebre persistente'
  },
  {
    citaId: 'cita-old-01',
    pacienteId: 'pac-05',
    paciente: MOCK_PACIENTES[4],
    medicoId: 'med-02',
    medico: MOCK_MEDICOS[1],
    horarioId: 'hor-02',
    especialidadId: 'esp-02',
    especialidad: MOCK_ESPECIALIDADES[1],
    fechaHoraInicio: '2026-11-16T10:00:00',
    fechaHoraFin: '2026-11-16T10:30:00',
    estado: 'ATENDIDA',
    origen: 'ADMISION',
    motivo: 'Consulta previa de cardiología pediátrica'
  },
  {
    citaId: 'cita-old-02',
    pacienteId: 'pac-04',
    paciente: MOCK_PACIENTES[3],
    medicoId: 'med-01',
    medico: MOCK_MEDICOS[0],
    horarioId: 'hor-01',
    especialidadId: 'esp-01',
    especialidad: MOCK_ESPECIALIDADES[0],
    fechaHoraInicio: '2026-11-15T08:30:00',
    fechaHoraFin: '2026-11-15T09:00:00',
    estado: 'ATENDIDA',
    origen: 'ADMISION',
    motivo: 'Evaluación general por sospecha respiratoria'
  }
];

export const MOCK_ATENCIONES: Atencion[] = [
  {
    atencionId: 'aten-01',
    historiaClinicaId: 'hc-01',
    citaId: 'cita-old-01',
    medicoId: 'med-01',
    medicoNombre: 'Dr. Carlos García Mendoza',
    servicioId: 'ser-01',
    servicioNombre: 'Consulta Externa Breña',
    fechaAtencion: '2026-10-15T09:00:00Z',
    motivoConsulta: 'Cuadro febril de 3 días de evolución acompañado de odinofagia y rinorrea.',
    antecedentes: 'Paciente sin alergias medicamentosas conocidas. Vacunas completas para la edad.',
    observaciones: 'Faringe congestiva con hipertrofia amigdalina bilateral sin exudado. Otoscopia normal.',
    recomendaciones: 'Hidratación abundante, reposo relativo por 48 horas y control de temperatura.',
    estado: 'FINALIZADA',
    origen: 'CONSULTA',
    esExtraidoPorIA: false,
    diagnosticos: [
      { cie10Id: 'cie-02', cie10: MOCK_CIE10[1], tipo: 'PRINCIPAL', observaciones: 'Infección viral de vías respiratorias altas' }
    ],
    receta: {
      recetaId: 'rec-01',
      atencionId: 'aten-01',
      indicaciones: 'Administrar paracetamol condicional a fiebre mayor de 38°C.',
      medicamentos: [
        { nombre: 'Paracetamol jarabe', concentracion: '120mg/5ml', dosis: '7.5 ml', frecuencia: 'Cada 8 horas', duracion: '3 días', cantidad: 1 },
        { nombre: 'Suero fisiológico nasal', concentracion: '0.9%', dosis: '2 gotas en cada fosa nasal', frecuencia: 'Cada 6 horas', duracion: '5 días', cantidad: 1 }
      ]
    }
  },
  {
    atencionId: 'aten-02',
    historiaClinicaId: 'hc-01',
    medicoId: 'med-01',
    medicoNombre: 'Dr. Carlos García Mendoza',
    servicioId: 'ser-01',
    servicioNombre: 'Consulta Externa Breña',
    fechaAtencion: '2025-05-20T10:30:00Z',
    motivoConsulta: 'Historia digitalizada de archivo físico: Bronquitis catarral aguda.',
    antecedentes: 'Ficha antigua recuperada mediante OCR inteligente.',
    observaciones: 'Murmullo vesicular rudo con sibilancias espiratorias bilaterales aisladas.',
    recomendaciones: 'Control en 7 días.',
    estado: 'FINALIZADA',
    origen: 'DIGITALIZACION',
    esExtraidoPorIA: true,
    diagnosticos: [
      { cie10Id: 'cie-03', cie10: MOCK_CIE10[2], tipo: 'PRINCIPAL', observaciones: 'Extraído de HC física escaneada' }
    ]
  },
  {
    atencionId: 'aten-fat-2026009',
    historiaClinicaId: 'hc-2026009',
    citaId: 'cita-fat-01',
    medicoId: 'med-02',
    medicoNombre: 'Dr. ESTELA CHUNGA EDILBERTO (CMP 19116 / RNE 12250)',
    servicioId: 'ser-02',
    servicioNombre: 'CARDIOLOGÍA - INSN BREÑA',
    fechaAtencion: '2026-11-05T11:56:00Z',
    motivoConsulta: 'Teleinterconsulta Especializada - Displasia Tricuspídea Tipo Ebstein vs Aneurisma de Aurícula Derecha Idiopática',
    antecedentes: 'Paciente pediátrico de 9 años derivado desde Hospital Belén de Trujillo. Sin antecedentes quirúrgicos cardiovasculares previos.',
    observaciones: 'Ecocardiografía (14/10/2026): Displasia Tricuspídea Tipo Ebstein vs Aneurisma de Aurícula Derecha Idiopática. Dilatación severa de aurícula derecha, cavidades izquierdas normales. EKG (14/10/2026): BIRD + bradicardia sinusal. Radiología: ICT= 0.70. Crecimiento de cavidades derechas. FP disminuido. Triaje: Peso 27.50 kg, Talla 1.33 m.',
    recomendaciones: '1. Definir diagnóstico con nuevo ecocardiograma realizado en INSN-Breña.\n2. De comprobarse Displasia tricúspidea, el tratamiento quirúrgico debe ser hecho en INSN-San Borja.\n3. Necesitaría evaluación por electrofisiología para posibilidad de colocación de marcapaso.\n4. Descartar DVAPP.\n5. Estabilizado el paciente debe referirse a Consultorio Externo de Cardiología - INSN Breña a través del REFCON.',
    estado: 'FINALIZADA',
    origen: 'DIGITALIZACION',
    documentoClinicoId: 'doc-fat-2026009',
    esExtraidoPorIA: true,
    diagnosticos: [
      {
        cie10Id: 'cie-13',
        cie10: { cie10Id: 'cie-13', codigo: 'Q22.5', descripcion: 'ANOMALÍA DE EBSTEIN', activo: true },
        tipo: 'PRINCIPAL',
        observaciones: 'Presuntivo - Displasia Tricuspídea'
      },
      {
        cie10Id: 'cie-14',
        cie10: { cie10Id: 'cie-14', codigo: '9949911', descripcion: 'TELEINTERCONSULTA SINCRONA O EN LINEA', activo: true },
        tipo: 'SECUNDARIO',
        observaciones: 'Definitivo - Modalidad Síncrona'
      }
    ]
  },
  {
    atencionId: 'aten-hc-05',
    historiaClinicaId: 'hc-05',
    medicoId: 'med-01',
    medicoNombre: 'Dr. Carlos García Mendoza (CMP 45120 / RNE 21094)',
    servicioId: 'ser-03',
    servicioNombre: 'HOSPITALIZACIÓN CIRUGÍA PEDIÁTRICA',
    fechaAtencion: '2026-09-12T14:30:00Z',
    motivoConsulta: 'Preescolar de 5 años ingresa por emergencia por dolor abdominal periumbilical que migra a fosa ilíaca derecha de 24h de evolución, acompañado de náuseas y alza térmica.',
    antecedentes: 'Nacida de parto eutócico a término (PN: 3200g). Vacunación completa para 5 años. Sin antecedentes quirúrgicos ni alergias medicamentosas conocidas.',
    observaciones: 'Examen Físico: Paciente quejumbrosa en posición antiálgica. Signos vitales: T° 38.6°C, FC 115 lpm, FR 24 rpm, SatO2 98%. Abdomen plano, tenso, marcadamente doloroso a la palpación en fosa ilíaca derecha, contractura muscular involuntaria. Signo de McBurney positivo (++), Signo de Blumberg positivo (++). Ruidos hidroaéreos disminuidos. Ecografía abdominal de emergencia confirma engrosamiento del apéndice cecal de 8.5 mm, no compresible y con líquido libre escaso en fondo de saco de Douglas.',
    recomendaciones: '1. Se realiza Apendicectomía Laparoscópica de urgencia sin incidentes (hallazgo: Apendicitis Aguda Flegmonosa).\n2. Terapia antibiótica endovenosa: Ceftriaxona 100 mg/kg/día c/12h + Metronidazol 30 mg/kg/día c/8h por 48 horas.\n3. Analgesia: Paracetamol 15 mg/kg EV c/8h condicional a fiebre o dolor moderado.\n4. Progresión a dieta líquida a las 18h postoperatorias con excelente tolerancia oral.\n5. Alta hospitalaria al tercer día de evolución con herida operatoria afrontada y seca. Control por consultorio externo en 7 días para retiro de puntos.',
    estado: 'FINALIZADA',
    origen: 'DIGITALIZACION',
    documentoClinicoId: 'doc-hc-202403120',
    esExtraidoPorIA: true,
    diagnosticos: [
      {
        cie10Id: 'cie-15',
        cie10: { cie10Id: 'cie-15', codigo: 'K35.8', descripcion: 'Apendicitis aguda, otras y las no especificadas', activo: true },
        tipo: 'PRINCIPAL',
        observaciones: 'Apendicitis Aguda Flegmonosa - Apendicectomía Laparoscópica'
      }
    ]
  },
  {
    atencionId: 'aten-hc-06',
    historiaClinicaId: 'hc-06',
    medicoId: 'med-02',
    medicoNombre: 'Dra. Lucía Ramos Salazar (CMP 51294 / RNE 24108)',
    servicioId: 'ser-02',
    servicioNombre: 'EMERGENCIA PEDIÁTRICA',
    fechaAtencion: '2026-11-16T03:40:00Z',
    motivoConsulta: 'Lactante mayor de 3 años es traído a urgencias en brazos por sus padres tras presentar episodio convulsivo generalizado en domicilio asociado a fiebre súbita.',
    antecedentes: 'Padre refiere cuadro gripal con rinorrea hialina y fiebre de 39.4°C de 12 horas. Primo materno con antecedente de convulsiones febriles típicas en la primera infancia.',
    observaciones: 'Examen Físico: Al ingreso paciente somnoliento por fase postictal, responde al estímulo vocal, llanto enérgico. Pupilas isocóricas de 2.5 mm reactivas a la luz. Tono muscular simétrico. No rigidez de nuca, signos meníngeos (Brudzinski y Kernig negativos). Orofaringe marcadamente congestiva con amígdalas hipertróficas sin exudado purulento. T° 39.2°C, FC 130 lpm, FR 28 rpm, SatO2 97% aire ambiental.',
    recomendaciones: '1. Episodio correspondiente a Convulsión Febril Simple autolimitada (duración aprox. 3 minutos en casa). En tópico de observación se administra Paracetamol 15 mg/kg vía oral.\n2. Medidas físicas para control térmico (compresas tibias, ropa ligera).\n3. Indicación de Diazepam rectal 0.5 mg/kg únicamente si se presenta una nueva crisis y supera los 3 minutos de duración.\n4. Observación por 4 horas con evolución favorable y estado neurológico basal recuperado. Se programa Electroencefalograma (EEG) ambulatorio de control.',
    estado: 'FINALIZADA',
    origen: 'DIGITALIZACION',
    documentoClinicoId: 'doc-rev-01',
    esExtraidoPorIA: true,
    diagnosticos: [
      {
        cie10Id: 'cie-16',
        cie10: { cie10Id: 'cie-16', codigo: 'R56.0', descripcion: 'Convulsiones febriles', activo: true },
        tipo: 'PRINCIPAL',
        observaciones: 'Crisis convulsiva febril simple'
      },
      {
        cie10Id: 'cie-02',
        cie10: { cie10Id: 'cie-02', codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada', activo: true },
        tipo: 'SECUNDARIO',
        observaciones: 'Faringoamigdalitis viral aguda desencadenante'
      }
    ]
  },
  {
    atencionId: 'aten-hc-07',
    historiaClinicaId: 'hc-07',
    medicoId: 'med-01',
    medicoNombre: 'Dr. Fernando Zavaleta Wong (CMP 38920 / RNE 18450)',
    servicioId: 'ser-01',
    servicioNombre: 'CONSULTA EXTERNA NEUMOLOGÍA PEDIÁTRICA',
    fechaAtencion: '2026-10-28T10:15:00Z',
    motivoConsulta: 'Escolar de 7 años acude acompañada de su madre por cuadro de 3 días de tos seca espasmódica predominio nocturno, sensación de pecho apretado y sibilancias audibles tras actividad física en colegio.',
    antecedentes: 'Madre asmática. Menor con antecedente de bronquiolitis a los 11 meses de vida y dermatitis atópica tratada. Diagnóstico previo de asma intermitente, uso irregular de salbutamol.',
    observaciones: 'Examen Físico: Paciente colaboradora, polipneica leve sin cianosis. Funciones vitales: FC 108 lpm, FR 32 rpm, SatO2 93% aire ambiental, T° 36.8°C. Tórax con retracción subcostal e intercostal leve. Murmullo vesicular pasa rudo con sibilancias espiratorias e inspiratorias bilaterales difusas y roncus basales. Score de Bierman y Pierson: 6 puntos (Crisis asmática moderada).',
    recomendaciones: '1. Terapia de rescate en consultorio: Salbutamol inhalador 100 mcg (MDI), 2 disparos cada 20 minutos por 3 ciclos con aerocámara espaciadora.\n2. Buena respuesta clínica post-rescate: SatO2 asciende a 97%, disminución significativa del tiraje.\n3. Esquema domiciliario: Salbutamol 100 mcg, 2 puff cada 6 horas por 5 días, luego condicional a síntomas de dificultad respiratoria.\n4. Terapia de mantenimiento preventivo: Fluticasona 125 mcg, 1 disparo cada 12 horas con aerocámara durante 3 meses.\n5. Educación sobre técnica de inhalación y control ambiental en el hogar (evitar ácaros, humo de tabaco, peluches).',
    estado: 'FINALIZADA',
    origen: 'DIGITALIZACION',
    documentoClinicoId: 'doc-rev-02',
    esExtraidoPorIA: true,
    diagnosticos: [
      {
        cie10Id: 'cie-17',
        cie10: { cie10Id: 'cie-17', codigo: 'J45.0', descripcion: 'Asma predominantemente alérgica', activo: true },
        tipo: 'PRINCIPAL',
        observaciones: 'Crisis asmática moderada en tratamiento de rescate'
      }
    ]
  }
];

export const MOCK_DOCUMENTOS: DocumentoClinico[] = [
  {
    documentoClinicoId: 'doc-fat-2026009',
    historiaClinicaId: 'hc-2026009',
    numeroHistoria: '2026009',
    pacienteNombres: 'NEIRA CARHUAPOMA JHUNIOR ADAEL',
    nombreArchivoOriginal: 'FAT_3348_2026_Teleinterconsulta_Cardiologia.pdf',
    sha256: 'e83f9104d8c7283401b2a95c4781e938f29402847192837461928471928374f1',
    numeroPaginas: 2,
    tamanoBytes: 171372,
    recibidoEn: '2026-11-17T11:15:17Z',
    estadoProcesamiento: 'PROCESADO',
    estadoValidacion: 'VALIDADO',
    confiabilidadPromedio: 94,
    enlaceHC: '/historias/2026009',
    urlPdf: '/docs/hc-2026009.pdf'
  },
  {
    documentoClinicoId: 'doc-hc-202403120',
    historiaClinicaId: 'hc-05',
    numeroHistoria: '2024031',
    pacienteNombres: 'ALARCÓN CASTILLO VALERIA SOFÍA',
    nombreArchivoOriginal: 'HC_Hospitalizacion_Cirugia_Apendicectomia_ValeriaAlarcon.pdf',
    sha256: 'f41a89c2019b84172a39d847102938471920384719283746102938471920384a',
    numeroPaginas: 3,
    tamanoBytes: 2450120,
    recibidoEn: '2026-11-16T15:20:00Z',
    estadoProcesamiento: 'PROCESADO',
    estadoValidacion: 'VALIDADO',
    confiabilidadPromedio: 96,
    enlaceHC: '/historias/2024031',
    urlPdf: '/docs/hc-2024-03120.pdf'
  },
  {
    documentoClinicoId: 'doc-rev-01',
    historiaClinicaId: 'hc-06',
    numeroHistoria: '2025098',
    pacienteNombres: 'BENÍTEZ HUAMÁN MATÍAS NICOLÁS',
    nombreArchivoOriginal: 'HC_Ficha_Emergencia_Convulsion_MatiasBenitez.pdf',
    sha256: 'a19284710293847192837461029384719203847192837461029384719203847b',
    numeroPaginas: 2,
    tamanoBytes: 1890400,
    recibidoEn: '2026-11-17T09:40:00Z',
    estadoProcesamiento: 'REQUIERE_REVISION',
    estadoValidacion: 'PENDIENTE',
    confiabilidadPromedio: 74,
    revisionId: 'rev-01',
    urlPdf: '/docs/hc-2025-09841.pdf'
  },
  {
    documentoClinicoId: 'doc-rev-02',
    historiaClinicaId: 'hc-07',
    numeroHistoria: '2023017',
    pacienteNombres: 'ROJAS PAREDES CAMILA ESPERANZA',
    nombreArchivoOriginal: 'HC_Evolucion_Neumologia_Asma_CamilaRojas.pdf',
    sha256: 'b28374610293847192038471928374610293847192038471928374610293847c',
    numeroPaginas: 1,
    tamanoBytes: 980200,
    recibidoEn: '2026-11-17T14:10:00Z',
    estadoProcesamiento: 'REQUIERE_REVISION',
    estadoValidacion: 'PENDIENTE',
    confiabilidadPromedio: 68,
    revisionId: 'rev-02',
    urlPdf: '/docs/hc-2023-01742.pdf'
  },
  {
    documentoClinicoId: 'doc-err-01',
    historiaClinicaId: 'hc-08',
    numeroHistoria: '2022045',
    pacienteNombres: 'MORALES ESPINOZA JOAQUÍN ALONSO',
    nombreArchivoOriginal: 'HC_Folio_Ambulatorio_Gastritis_BajaResolucion.pdf',
    sha256: 'c39485710293847192038471928374610293847192038471928374610293847d',
    numeroPaginas: 1,
    tamanoBytes: 420100,
    recibidoEn: '2026-11-17T16:45:00Z',
    estadoProcesamiento: 'ERROR',
    estadoValidacion: 'RECHAZADO',
    confiabilidadPromedio: 42
  }
];

export const MOCK_REVISIONES: RevisionDocumental[] = [
  {
    revisionId: 'rev-01',
    documentoClinicoId: 'doc-rev-01',
    documento: MOCK_DOCUMENTOS[2],
    motivo: 'Letra médica manuscrita de baja legibilidad en dosificación de antitérmico/anticonvulsivante (Diazepam/Metamizol) y antecedente febril.',
    estado: 'PENDIENTE',
    confiabilidadPromedio: 74,
    creadaEn: '2026-11-17T09:45:00Z',
    campos: [
      { nombreCampo: 'numero_historia', etiqueta: 'N° Historia Clínica', valorExtraido: '2025098', confianza: 0.99, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'numero_documento', etiqueta: 'DNI Paciente', valorExtraido: '82390145', confianza: 0.98, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'nombres_paciente', etiqueta: 'Nombres del Paciente', valorExtraido: 'MATÍAS NICOLÁS', confianza: 0.97, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'apellidos_paciente', etiqueta: 'Apellidos del Paciente', valorExtraido: 'BENÍTEZ HUAMÁN', confianza: 0.96, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'sexo', etiqueta: 'Sexo', valorExtraido: 'MASCULINO', confianza: 0.99, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'temperatura_ingreso', etiqueta: 'Temperatura al Ingreso', valorExtraido: '39.4 °C', confianza: 0.91, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'servicio_especialidad', etiqueta: 'Servicio / Especialidad', valorExtraido: 'EMERGENCIA PEDIÁTRICA', confianza: 0.95, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'medico_tratante', etiqueta: 'Médico Tratante (CMP)', valorExtraido: 'Dra. LUCÍA RAMOS SALAZAR (CMP 51294)', confianza: 0.92, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'diagnostico_cie10', etiqueta: 'Diagnóstico Principal CIE-10', valorExtraido: 'R56.0 - CONVULSIONES FEBRILES', confianza: 0.72, estadoValidacion: 'PENDIENTE' },
      { nombreCampo: 'tratamiento_dosis', etiqueta: 'Tratamiento y Dosificación', valorExtraido: 'Diazepam 0.5 mg/kg rectal + Metamizol 20 mg/kg condicional a T>38.5', confianza: 0.64, estadoValidacion: 'PENDIENTE' },
      { nombreCampo: 'plan_indicaciones', etiqueta: 'Plan e Indicaciones', valorExtraido: 'Monitoreo de funciones vitales c/2h. Interconsulta con Neurología Pediátrica para EEG.', confianza: 0.76, estadoValidacion: 'PENDIENTE' }
    ]
  },
  {
    revisionId: 'rev-02',
    documentoClinicoId: 'doc-rev-02',
    documento: MOCK_DOCUMENTOS[3],
    motivo: 'Sello institucional sobrepuesto en diagnóstico CIE-10 y firma médica que obstruye los valores de SpO2 y frecuencia respiratoria.',
    estado: 'PENDIENTE',
    confiabilidadPromedio: 68,
    creadaEn: '2026-11-17T14:15:00Z',
    campos: [
      { nombreCampo: 'numero_historia', etiqueta: 'N° Historia Clínica', valorExtraido: '2023017', confianza: 0.99, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'numero_documento', etiqueta: 'DNI Paciente', valorExtraido: '75128934', confianza: 0.98, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'nombres_paciente', etiqueta: 'Nombres del Paciente', valorExtraido: 'CAMILA ESPERANZA', confianza: 0.98, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'apellidos_paciente', etiqueta: 'Apellidos del Paciente', valorExtraido: 'ROJAS PAREDES', confianza: 0.97, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'servicio_especialidad', etiqueta: 'Servicio / Especialidad', valorExtraido: 'NEUMOLOGÍA PEDIÁTRICA', confianza: 0.95, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'medico_tratante', etiqueta: 'Médico Tratante (CMP)', valorExtraido: 'Dr. FERNANDO ZAVALETA WONG (CMP 38920)', confianza: 0.91, estadoValidacion: 'VALIDADO' },
      { nombreCampo: 'saturacion_oxigeno', etiqueta: 'Saturación SpO2', valorExtraido: 'SpO2 93% aire ambiental', confianza: 0.62, estadoValidacion: 'PENDIENTE' },
      { nombreCampo: 'frecuencia_respiratoria', etiqueta: 'Frecuencia Respiratoria', valorExtraido: 'FR: 32 rpm con tiraje subcostal leve', confianza: 0.67, estadoValidacion: 'PENDIENTE' },
      { nombreCampo: 'diagnostico_cie10', etiqueta: 'Diagnóstico Principal CIE-10', valorExtraido: 'J45.0 - ASMA PREDOMINANTEMENTE ALÉRGICA', confianza: 0.71, estadoValidacion: 'PENDIENTE' },
      { nombreCampo: 'plan_esquema', etiqueta: 'Plan Terapéutico', valorExtraido: 'Salbutamol MDI 100mcg 2 puff c/20m x 3 dosis con aerocámara + Fluticasona 125mcg c/12h', confianza: 0.66, estadoValidacion: 'PENDIENTE' }
    ]
  }
];

export const MOCK_HORARIOS: HorarioMedico[] = [
  {
    horarioId: 'hor-01',
    medicoId: 'med-01',
    medicoNombre: 'Dr. Carlos García Mendoza',
    servicioId: 'ser-01',
    servicioNombre: 'Consulta Externa Breña',
    especialidadId: 'esp-01',
    especialidadNombre: 'Pediatría General',
    fecha: '2026-11-17',
    horaInicio: '08:00:00',
    horaFin: '14:00:00',
    estado: 'ACTIVO',
    cuposTotales: 12,
    cuposLibres: 9
  },
  {
    horarioId: 'hor-02',
    medicoId: 'med-01',
    medicoNombre: 'Dr. Carlos García Mendoza',
    servicioId: 'ser-01',
    servicioNombre: 'Consulta Externa Breña',
    especialidadId: 'esp-01',
    especialidadNombre: 'Pediatría General',
    fecha: '2026-11-18',
    horaInicio: '08:00:00',
    horaFin: '14:00:00',
    estado: 'ACTIVO',
    cuposTotales: 12,
    cuposLibres: 12
  }
];

export const MOCK_AUDITORIA: Auditoria[] = [
  {
    auditoriaId: 'aud-01',
    usuarioId: 'u-admin-01',
    nombreUsuario: 'admin',
    accion: 'LOGIN_EXITOSO',
    tipoRecurso: 'USUARIO',
    resultado: 'EXITOSO',
    fechaEvento: '2026-11-16T22:30:00Z',
    ipOrigen: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    correlationId: 'insn-init-01',
    detalles: { mensaje: 'Inicio de sesión administrativo exitoso' }
  },
  {
    auditoriaId: 'aud-02',
    usuarioId: 'u-dig-01',
    nombreUsuario: 'arch.lopez',
    accion: 'DIGITALIZACION_UPLOAD',
    tipoRecurso: 'DOCUMENTO_CLINICO',
    recursoId: 'doc-cli-02',
    resultado: 'EXITOSO',
    fechaEvento: '2026-11-16T10:15:20Z',
    ipOrigen: '192.168.1.88',
    detalles: { archivo: 'Atencion_Antigua_LucianaFlores.pdf', tamano: 1200000, confianza: 0.76 }
  },
  {
    auditoriaId: 'aud-03',
    usuarioId: 'u-adm-01',
    nombreUsuario: 'adm.torres',
    accion: 'CITA_CREADA',
    tipoRecurso: 'CITA',
    recursoId: 'cita-01',
    resultado: 'EXITOSO',
    fechaEvento: '2026-11-16T11:40:00Z',
    ipOrigen: '192.168.1.72',
    detalles: { paciente: 'Mateo Quispe', doctor: 'Dr. Carlos García', estado: 'APROBADA' }
  }
];

export const MOCK_CONFIGURACION: ConfiguracionSistema[] = [
  { configuracionId: 'cfg-01', clave: 'ia.umbral_confianza', valor: 0.85, descripcion: 'Umbral mínimo de confiabilidad IA para registro automático en HC (0.85 = 85%)', editable: true },
  { configuracionId: 'cfg-02', clave: 'agenda.duracion_cita_min', valor: 30, descripcion: 'Duración estándar de cada cupo de atención médica en minutos', editable: true },
  { configuracionId: 'cfg-03', clave: 'agenda.horas_turno', valor: 6, descripcion: 'Horas de duración del turno de un médico (genera 12 cupos de 30 min)', editable: true }
];
