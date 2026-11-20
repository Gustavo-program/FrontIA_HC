import { TipoDocumentoIdentidad } from './catalogo.model';

export type Sexo = 'FEMENINO' | 'MASCULINO' | 'NO_ESPECIFICADO' | 'DESCONOCIDO';
export type EstadoRegistroPaciente = 'ACTIVO' | 'INACTIVO' | 'FUSIONADO' | 'PENDIENTE_VALIDACION';

export interface FamiliarResponsable {
  responsableId?: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  tipoDocumentoId?: string;
  tipoDocumento?: TipoDocumentoIdentidad;
  numeroDocumento?: string;
  telefono?: string;
  telefonoWhatsapp?: string;
  correo?: string;
  direccion?: string;
  parentesco?: string;
  esContactoPrincipal?: boolean;
}

export interface DocumentoIdentidad {
  documentoIdentidadId?: string;
  pacienteId?: string;
  tipoDocumentoId: string;
  tipoDocumento?: TipoDocumentoIdentidad;
  numeroDocumento: string;
  paisEmisor?: string;
  esPrincipal: boolean;
  estadoValidacion?: 'PENDIENTE' | 'VALIDADO' | 'OBSERVADO' | 'NO_VERIFICABLE';
}

export interface Paciente {
  pacienteId: string;
  codigoPaciente?: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  sexoRegistrado: Sexo;
  lugarNacimiento?: string;
  paisNacimiento?: string;
  estadoRegistro: EstadoRegistroPaciente;
  observaciones?: string;
  documentoPrincipal?: DocumentoIdentidad;
  documentos?: DocumentoIdentidad[];
  responsables?: FamiliarResponsable[];
  numeroHistoria?: string;
  historiaClinicaId?: string;
  creadoEn?: string;
}
