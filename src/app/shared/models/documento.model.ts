export type EstadoProcesamiento = 'PENDIENTE' | 'EN_COLA' | 'EN_PROCESO' | 'PROCESADO' | 'REQUIERE_REVISION' | 'ERROR' | 'CANCELADO';
export type EstadoRevision = 'PENDIENTE' | 'ASIGNADA' | 'APROBADA' | 'RECHAZADA' | 'DEVUELTA';

export interface CampoExtraido {
  campoExtraidoId?: string;
  nombreCampo: string;
  etiqueta?: string;
  valorExtraido: string;
  valorNormalizado?: string;
  confianza: number; // 0.0 - 1.0 (e.g. 0.88 = 88%)
  paginaOrigen?: number;
  estadoValidacion: 'PENDIENTE' | 'VALIDADO' | 'CORREGIDO' | 'RECHAZADO';
  valorCorregido?: string;
}

export interface DocumentoClinico {
  documentoClinicoId: string;
  historiaClinicaId?: string;
  numeroHistoria?: string;
  pacienteNombres?: string;
  tipoDocumentoClinicoId?: string;
  tipoDocumentoNombre?: string;
  nombreArchivoOriginal: string;
  sha256: string;
  numeroPaginas?: number;
  tamanoBytes?: number;
  fechaDocumento?: string;
  recibidoEn: string;
  estadoProcesamiento: EstadoProcesamiento;
  estadoValidacion: string;
  confiabilidadPromedio?: number; // 0 - 100
  enlaceHC?: string;
  revisionId?: string;
  urlPdf?: string;
}

export interface RevisionDocumental {
  revisionId: string;
  documentoClinicoId: string;
  documento?: DocumentoClinico;
  trabajoId?: string;
  revisorUsuarioId?: string;
  revisorNombre?: string;
  motivo: string;
  estado: EstadoRevision;
  observaciones?: string;
  confiabilidadPromedio: number;
  campos: CampoExtraido[];
  creadaEn: string;
  asignadaEn?: string;
  resueltaEn?: string;
}
