import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ApiService } from '../../../../core/services/api.service';
import { MedicoService } from '../../../../shared/services/medico.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { HorarioMedico } from '../../../../shared/models/cita.model';
import { Medico } from '../../../../shared/models/medico.model';

@Component({
  selector: 'app-gestion-horarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    PageHeader,
    StatusChip
  ],
  templateUrl: './gestion-horarios.html',
  styleUrl: './gestion-horarios.scss'
})
export class GestionHorarios implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly medicoService = inject(MedicoService);
  private readonly notification = inject(NotificationService);

  readonly horarios = signal<HorarioMedico[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly guardando = signal(false);
  readonly modoEdicion = signal(false);
  readonly horarioEnEdicionId = signal<string | null>(null);

  readonly displayedColumns = ['fecha', 'doctor', 'inicio', 'fin', 'cupos', 'estado', 'acciones'];

  readonly form = this.fb.group({
    medicoId: ['', Validators.required],
    fecha: [new Date(), Validators.required],
    horaInicio: ['08:00', Validators.required]
  });

  ngOnInit(): void {
    this.cargarHorarios();
    this.medicoService.getMedicos().subscribe({
      next: page => this.medicos.set(page.content || [])
    });
  }

  cargarHorarios(): void {
    this.api.get<HorarioMedico[]>('/horarios').subscribe({
      next: list => this.horarios.set(list || [])
    });
  }

  formatDate(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') {
      return val.slice(0, 10);
    }
    const d = new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  guardarTurno(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { medicoId, fecha: fechaRaw, horaInicio } = this.form.getRawValue();
    const fecha = this.formatDate(fechaRaw);

    // RN-01: Cada turno dura 6 horas fijas
    const [h, m] = horaInicio!.split(':').map(Number);
    const finH = (h + 6).toString().padStart(2, '0');
    const horaFin = `${finH}:${(m || 0).toString().padStart(2, '0')}:00`;

    // RN-12: Validación de no solapamiento
    const editandoId = this.horarioEnEdicionId();
    const solapado = this.horarios().some(hor =>
      hor.horarioId !== editandoId &&
      hor.medicoId === medicoId &&
      hor.fecha === fecha &&
      hor.estado === 'ACTIVO'
    );

    if (solapado) {
      this.notification.error('Error (RN-12): Ya existe un turno programado para este médico en la misma fecha. Los turnos no pueden solaparse.');
      return;
    }

    const doc = this.medicos().find(m => m.medicoId === medicoId);
    const medicoNombre = doc
      ? `Dr(a). ${doc.personal.nombres} ${doc.personal.apellidoPaterno}`
      : 'Médico Especialista';
    const espNombre = doc?.especialidades?.[0]?.nombre || 'Pediatría General';

    this.guardando.set(true);
    const payload: Partial<HorarioMedico> = {
      medicoId: medicoId!,
      fecha,
      horaInicio: horaInicio + ':00',
      horaFin,
      servicioId: 'ser-01',
      servicioNombre: `Consulta Externa - ${espNombre}`,
      especialidadNombre: espNombre,
      medicoNombre
    };

    if (this.modoEdicion() && editandoId) {
      this.api.put<HorarioMedico>(`/horarios/${editandoId}`, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success('Turno médico actualizado exitosamente.');
          this.cancelarEdicion();
          this.cargarHorarios();
        },
        error: () => this.guardando.set(false)
      });
    } else {
      this.api.post<HorarioMedico>('/horarios', payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success(`Turno de 6 horas creado con éxito para ${medicoNombre}. Se generaron 12 cupos automáticamente.`);
          this.cancelarEdicion();
          this.cargarHorarios();
        },
        error: () => this.guardando.set(false)
      });
    }
  }

  editarTurno(h: HorarioMedico): void {
    this.modoEdicion.set(true);
    this.horarioEnEdicionId.set(h.horarioId);
    
    // Parsear fecha segura
    let fechaVal: any = h.fecha;
    if (typeof h.fecha === 'string' && h.fecha.includes('-')) {
      const [year, month, day] = h.fecha.split('-').map(Number);
      fechaVal = new Date(year, month - 1, day);
    }

    this.form.patchValue({
      medicoId: h.medicoId,
      fecha: fechaVal,
      horaInicio: h.horaInicio.slice(0, 5)
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(false);
    this.horarioEnEdicionId.set(null);
    this.form.reset({
      medicoId: '',
      fecha: new Date(),
      horaInicio: '08:00'
    });
  }

  eliminarTurno(h: HorarioMedico): void {
    if (confirm(`¿Confirma eliminar el turno programado del ${h.medicoNombre || 'médico'} para el día ${h.fecha}?`)) {
      this.api.delete<void>(`/horarios/${h.horarioId}`).subscribe({
        next: () => {
          this.notification.success('Turno médico eliminado correctamente.');
          if (this.horarioEnEdicionId() === h.horarioId) {
            this.cancelarEdicion();
          }
          this.cargarHorarios();
        }
      });
    }
  }
}
