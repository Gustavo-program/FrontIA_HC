import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../core/auth/auth.store';
import { MedicoService } from '../../../../shared/services/medico.service';
import { CitaService } from '../../../../shared/services/cita.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CupoSelector } from '../../../../shared/components/cupo-selector/cupo-selector';
import { PacienteSearch } from '../../../../shared/components/paciente-search/paciente-search';
import { Paciente } from '../../../../shared/models/paciente.model';
import { Cupo } from '../../../../shared/models/cita.model';

@Component({
  selector: 'app-nueva-cita-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CupoSelector,
    PacienteSearch
  ],
  templateUrl: './nueva-cita-dialog.html',
  styleUrl: './nueva-cita-dialog.scss'
})
export class NuevaCitaDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<NuevaCitaDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(AuthStore);
  private readonly medicoService = inject(MedicoService);
  private readonly citaService = inject(CitaService);
  private readonly notification = inject(NotificationService);

  readonly cupos = signal<Cupo[]>([]);
  readonly cupoSeleccionado = signal<Cupo | null>(null);
  readonly pacienteSeleccionado = signal<Paciente | null>(null);
  readonly guardando = signal(false);

  readonly form = this.fb.group({
    fecha: [new Date().toISOString().split('T')[0], Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.cargarCupos();
    this.form.get('fecha')?.valueChanges.subscribe(() => {
      this.cargarCupos();
    });
  }

  cargarCupos(): void {
    const medId = this.store.medicoId() || 'med-01';
    const fecha = this.form.get('fecha')?.value || '';
    if (fecha) {
      this.medicoService.getCupos(medId, fecha).subscribe({
        next: list => {
          this.cupos.set(list || []);
          this.cupoSeleccionado.set(null);
        }
      });
    }
  }

  seleccionarPaciente(p: Paciente): void {
    this.pacienteSeleccionado.set(p);
  }

  seleccionarCupo(c: Cupo): void {
    this.cupoSeleccionado.set(c);
  }

  guardar(): void {
    if (!this.pacienteSeleccionado()) {
      this.notification.error('Debe seleccionar un paciente.');
      return;
    }
    if (!this.cupoSeleccionado()) {
      this.notification.error('Debe seleccionar un cupo de atención disponible.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const fecha = this.form.get('fecha')?.value;
    const cupo = this.cupoSeleccionado()!;

    // RN-03: Cita creada por doctor nace en estado PENDIENTE hasta el pago
    const payload = {
      pacienteId: this.pacienteSeleccionado()!.pacienteId,
      paciente: this.pacienteSeleccionado()!,
      medicoId: this.store.medicoId() || 'med-01',
      horarioId: 'hor-01',
      especialidadId: 'esp-01',
      fechaHoraInicio: `${fecha}T${cupo.horaInicio}:00`,
      fechaHoraFin: `${fecha}T${cupo.horaFin}:00`,
      motivo: this.form.get('motivo')?.value || '',
      estado: 'PENDIENTE' as const,
      origen: 'DOCTOR' as const
    };

    this.citaService.crearCita(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.notification.success('Cita registrada en estado PENDIENTE. Pasará a Aprobada cuando el Administrador confirme el pago (RN-03).');
        this.dialogRef.close(true);
      },
      error: () => this.guardando.set(false)
    });
  }
}
