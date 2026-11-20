import { Especialidad, TipoDocumentoIdentidad } from './catalogo.model';

export interface PersonalSalud {
  personalId: string;
  codigoInstitucional?: string;
  tipoPersonalId: string;
  tipoPersonalNombre?: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  tipoDocumentoId: string;
  tipoDocumento?: TipoDocumentoIdentidad;
  numeroDocumento: string;
  correoInstitucional?: string;
  telefono?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'LICENCIA' | 'CESADO';
}

export interface Medico {
  medicoId: string;
  personalId: string;
  personal: PersonalSalud;
  numeroCmp: string;
  numeroRne?: string;
  verificacionCmp: 'PENDIENTE' | 'VERIFICADO' | 'OBSERVADO' | 'NO_APLICA';
  especialidades: Especialidad[];
  observaciones?: string;
}
