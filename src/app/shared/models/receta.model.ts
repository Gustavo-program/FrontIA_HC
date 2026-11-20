export interface RecetaMedicamento {
  recetaMedicamentoId?: string;
  recetaId?: string;
  nombre: string;
  concentracion?: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  cantidad: number;
  observaciones?: string;
  orden?: number;
}

export interface EnvioReceta {
  envioId?: string;
  recetaId?: string;
  canal: 'EMAIL' | 'WHATSAPP';
  destino: string;
  estado: 'PENDIENTE' | 'ENVIADO' | 'ERROR';
  fechaEnvio?: string;
  detalleError?: string;
}

export interface Receta {
  recetaId: string;
  atencionId: string;
  indicaciones?: string;
  medicamentos: RecetaMedicamento[];
  envios?: EnvioReceta[];
  creadoEn?: string;
}
