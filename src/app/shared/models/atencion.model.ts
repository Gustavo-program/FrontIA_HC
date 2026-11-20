import { Cie10 } from './catalogo.model';
import { Receta } from './receta.model';

export type EstadoAtencion = 'BORRADOR' | 'FINALIZADA';
export type OrigenAtencion = 'CONSULTA' | 'DIGITALIZACION';

export interface AtencionDiagnostico {
  atencionDiagnosticoId?: string;
  atencionId?: string;
  cie10Id: string;
  cie10?: Cie10;
  tipo: 'PRINCIPAL' | 'SECUNDARIO';
  observaciones?: string;
}

export interface Atencion {
  atencionId: string;
  historiaClinicaId: string;
  citaId?: string;
  medicoId: string;
  medicoNombre?: string;
  servicioId?: string;
  servicioNombre?: string;
  fechaAtencion: string;
  motivoConsulta: string;
  antecedentes?: string;
  observaciones?: string;
  recomendaciones?: string;
  estado: EstadoAtencion;
  origen: OrigenAtencion;
  documentoClinicoId?: string;
  diagnosticos: AtencionDiagnostico[];
  receta?: Receta;
  esExtraidoPorIA?: boolean;
}
