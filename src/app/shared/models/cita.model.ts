import { Paciente } from './paciente.model';
import { Medico } from './medico.model';
import { Especialidad } from './catalogo.model';

export type EstadoCita = 'PENDIENTE' | 'APROBADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO';
export type OrigenCita = 'ADMISION' | 'DOCTOR';

export interface Cupo {
  horaInicio: string; // "08:00"
  horaFin: string;    // "08:30"
  disponible: boolean;
  citaId?: string;
  pacienteNombre?: string;
  numeroHistoria?: string;
}

export interface HorarioMedico {
  horarioId: string;
  medicoId: string;
  medicoNombre?: string;
  servicioId?: string;
  servicioNombre?: string;
  especialidadId?: string;
  especialidadNombre?: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // "08:00:00"
  horaFin: string;    // "14:00:00" (6 horas fijas)
  estado: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO';
  cuposTotales?: number; // 12
  cuposLibres?: number;
  cupos?: Cupo[];
}

export interface Cita {
  citaId: string;
  pacienteId: string;
  paciente?: Paciente;
  medicoId: string;
  medico?: Medico;
  horarioId: string;
  especialidadId?: string;
  especialidad?: Especialidad;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: EstadoCita;
  origen: OrigenCita;
  motivo?: string;
  creadoPor?: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  creadoEn?: string;
}
