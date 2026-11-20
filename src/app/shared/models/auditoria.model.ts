export interface Auditoria {
  auditoriaId: string;
  usuarioId?: string;
  nombreUsuario?: string;
  accion: string;
  tipoRecurso: string;
  recursoId?: string;
  resultado: 'EXITOSO' | 'DENEGADO' | 'ERROR';
  fechaEvento: string;
  ipOrigen?: string;
  userAgent?: string;
  correlationId?: string;
  detalles: any;
}
