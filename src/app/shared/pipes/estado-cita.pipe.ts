import { Pipe, PipeTransform } from '@angular/core';
import { EstadoCita } from '../models/cita.model';

@Pipe({
  name: 'estadoCita',
  standalone: true
})
export class EstadoCitaPipe implements PipeTransform {
  transform(estado: EstadoCita | string | null | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente de Pago';
      case 'APROBADA': return 'Aprobada';
      case 'ATENDIDA': return 'Atendida';
      case 'CANCELADA': return 'Cancelada';
      case 'NO_ASISTIO': return 'No Asistió';
      default: return estado ?? '';
    }
  }
}
