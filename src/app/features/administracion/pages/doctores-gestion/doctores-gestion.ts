import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MedicoService } from '../../../../shared/services/medico.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Medico } from '../../../../shared/models/medico.model';
import { Especialidad } from '../../../../shared/models/catalogo.model';

@Component({
  selector: 'app-doctores-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeader
  ],
  templateUrl: './doctores-gestion.html',
  styleUrl: './doctores-gestion.scss'
})
export class DoctoresGestion implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly medicos = signal<Medico[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly search = signal<string>('');
  readonly guardando = signal<boolean>(false);
  readonly formularioAbierto = signal<boolean>(false);
  readonly modoEdicion = signal<boolean>(false);
  readonly medicoSeleccionadoId = signal<string | null>(null);

  readonly columns = ['nombre', 'cmp', 'rne', 'verificacion', 'especialidad', 'telefono', 'acciones'];

  readonly form = this.fb.group({
    nombres: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],
    numeroCmp: ['', [Validators.required, Validators.minLength(4)]],
    numeroRne: [''],
    correoInstitucional: ['', [Validators.required, Validators.email]],
    telefono: [''],
    especialidadId: ['', Validators.required],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.cargarMedicos();
    this.catalogoService.getEspecialidades().subscribe({
      next: esps => this.especialidades.set(esps || [])
    });
  }

  cargarMedicos(): void {
    this.medicoService.getMedicos(0, 20, this.search()).subscribe({
      next: page => this.medicos.set(page.content || [])
    });
  }

  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.medicoSeleccionadoId.set(null);
    this.form.reset({
      especialidadId: this.especialidades()[0]?.especialidadId || 'esp-01'
    });
    this.formularioAbierto.set(true);
  }

  abrirEditar(m: Medico): void {
    this.modoEdicion.set(true);
    this.medicoSeleccionadoId.set(m.medicoId);
    this.form.patchValue({
      nombres: m.personal.nombres,
      apellidoPaterno: m.personal.apellidoPaterno,
      apellidoMaterno: m.personal.apellidoMaterno,
      numeroDocumento: m.personal.numeroDocumento,
      numeroCmp: m.numeroCmp,
      numeroRne: m.numeroRne,
      correoInstitucional: m.personal.correoInstitucional,
      telefono: m.personal.telefono,
      especialidadId: m.especialidades[0]?.especialidadId || 'esp-01',
      observaciones: m.observaciones
    });
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const val = this.form.getRawValue();

    // Resolver objeto de especialidad
    const espSeleccionada = this.especialidades().find(e => e.especialidadId === val.especialidadId);
    const payload = {
      ...val,
      especialidades: espSeleccionada ? [espSeleccionada] : []
    };

    if (this.modoEdicion() && this.medicoSeleccionadoId()) {
      this.medicoService.actualizarMedico(this.medicoSeleccionadoId()!, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success('Datos del médico especialista actualizados.');
          this.cerrarFormulario();
          this.cargarMedicos();
        },
        error: () => this.guardando.set(false)
      });
    } else {
      this.medicoService.crearMedico(payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success('Nuevo doctor registrado con éxito en el sistema.');
          this.cerrarFormulario();
          this.cargarMedicos();
        },
        error: () => this.guardando.set(false)
      });
    }
  }

  eliminar(m: Medico): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Eliminar Médico Especialista',
        message: `¿Confirma eliminar al doctor "${m.personal.nombres} ${m.personal.apellidoPaterno}" (CMP: ${m.numeroCmp})?`,
        confirmText: 'Eliminar',
        color: 'warn',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.medicoService.eliminarMedico(m.medicoId).subscribe({
          next: () => {
            this.notification.success('Médico eliminado del sistema.');
            this.cargarMedicos();
          }
        });
      }
    });
  }
}
