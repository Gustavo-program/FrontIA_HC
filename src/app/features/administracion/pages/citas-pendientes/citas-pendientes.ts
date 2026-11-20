import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CitaService } from '../../../../shared/services/cita.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Cita } from '../../../../shared/models/cita.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { NombreCompletoPipe } from '../../../../shared/pipes/nombre-completo.pipe';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-citas-pendientes',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, PageHeader, NombreCompletoPipe, EmptyState],
  templateUrl: './citas-pendientes.html',
  styleUrl: './citas-pendientes.scss'
})
export class CitasPendientes implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly notification = inject(NotificationService);

  readonly citas = signal<Cita[]>([]);
  readonly displayedColumns = ['fecha', 'hora', 'paciente', 'doctor', 'motivo', 'origen', 'acciones'];

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cargarPendientes(): void {
    this.citaService.getCitasPendientes().subscribe({
      next: page => this.citas.set(page.content || [])
    });
  }

  aprobarPago(c: Cita): void {
    this.citaService.cambiarEstado(c.citaId, 'APROBADA').subscribe({
      next: () => {
        this.notification.success(`Cita de "${c.paciente?.nombres} ${c.paciente?.apellidoPaterno}" APROBADA tras verificar el pago (RN-03).`);
        this.cargarPendientes();
      }
    });
  }

  rechazarCita(c: Cita): void {
    this.citaService.cambiarEstado(c.citaId, 'CANCELADA', 'Rechazada por falta de comprobante').subscribe({
      next: () => {
        this.notification.info('Cita cancelada.');
        this.cargarPendientes();
      }
    });
  }
}
