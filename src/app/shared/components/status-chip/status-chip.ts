import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-chip.html',
  styleUrl: './status-chip.scss'
})
export class StatusChip {
  @Input({ required: true }) status!: string;
  @Input() label?: string;

  get statusClass(): string {
    const s = this.status?.toUpperCase() || '';
    if (['APROBADA', 'ACTIVO', 'VALIDADO', 'PROCESADO', 'EXITOSO', 'FINALIZADA', 'COMPLETADO','COMPLETED'].includes(s)) {
      return 'status-success';
    }
    if (['PENDIENTE', 'ASIGNADA', 'EN_COLA', 'EN_PROCESO', 'REQUIERE_REVISION', 'BORRADOR','PROCESSING'].includes(s)) {
      return 'status-warning';
    }
    if (['CANCELADA', 'RECHAZADA', 'ERROR', 'INACTIVO', 'DENEGADO', 'FAILED'].includes(s)) {
      return 'status-error';
    }
    if (['ATENDIDA', 'DEVUELTA'].includes(s)) {
      return 'status-info';
    }
    return 'status-default';
  }
}
