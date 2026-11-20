import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { PacienteService } from '../../../../shared/services/paciente.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Paciente } from '../../../../shared/models/paciente.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { NombreCompletoPipe } from '../../../../shared/pipes/nombre-completo.pipe';
import { EdadPipe } from '../../../../shared/pipes/edad.pipe';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeader,
    NombreCompletoPipe,
    EdadPipe,
    StatusChip
  ],
  templateUrl: './pacientes-list.html',
  styleUrl: './pacientes-list.scss'
})
export class PacientesList implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly pacientes = signal<Paciente[]>([]);
  readonly search = signal<string>('');
  readonly displayedColumns = ['historia', 'nombres', 'documento', 'edad', 'responsable', 'estado', 'acciones'];

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.pacienteService.getPacientes(0, 10, this.search()).subscribe({
      next: page => this.pacientes.set(page.content || [])
    });
  }

  darDeBaja(paciente: Paciente): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Baja Lógica de Paciente (RN-11)',
        message: `¿Confirma dar de baja al paciente "${paciente.nombres} ${paciente.apellidoPaterno}"? Por normativa clínica, el historial se preservará en estado INACTIVO.`,
        confirmText: 'Dar de Baja',
        color: 'warn',
        icon: 'person_off'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.pacienteService.darDeBaja(paciente.pacienteId).subscribe({
          next: () => {
            this.notification.success('Paciente dado de baja lógica correctamente.');
            this.cargarPacientes();
          }
        });
      }
    });
  }
}
