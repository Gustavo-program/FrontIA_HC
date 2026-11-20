export interface HistoriaClinica {
  historiaClinicaId: string;
  pacienteId: string;
  numeroHistoria: string;
  fechaApertura: string;
  fechaCierre?: string;
  estadoHistoriaId: string;
  estadoHistoriaNombre?: string;
  establecimiento: string;
  observaciones?: string;
  pacienteNombres?: string;
  pacienteApellidos?: string;
}
