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
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PersonalSalud } from '../../../../shared/models/medico.model';

@Component({
  selector: 'app-personal-gestion',
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
    PageHeader,
    StatusChip
  ],
  templateUrl: './personal-gestion.html',
  styleUrl: './personal-gestion.scss'
})
export class PersonalGestion implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly personal = signal<PersonalSalud[]>([]);
  readonly search = signal<string>('');
  readonly guardando = signal<boolean>(false);
  readonly modoEdicion = signal<boolean>(false);
  readonly formularioAbierto = signal<boolean>(false);
  readonly personalSeleccionadoId = signal<string | null>(null);

  readonly columns = ['codigo', 'nombre', 'documento', 'tipo', 'correo', 'estado', 'acciones'];

  readonly form = this.fb.group({
    codigoInstitucional: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    tipoPersonalNombre: ['Digitalizador de Archivo', Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],
    correoInstitucional: ['', [Validators.required, Validators.email]],
    telefono: ['']
  });

  ngOnInit(): void {
    this.cargarPersonal();
  }

  cargarPersonal(): void {
    this.medicoService.getPersonal(0, 20, this.search()).subscribe({
      next: page => this.personal.set(page.content || [])
    });
  }

  abrirNuevo(): void {
    this.modoEdicion.set(false);
    this.personalSeleccionadoId.set(null);
    this.form.reset({
      codigoInstitucional: 'PER-' + Math.floor(1000 + Math.random() * 9000),
      tipoPersonalNombre: 'Digitalizador de Archivo'
    });
    this.formularioAbierto.set(true);
  }

  abrirEditar(p: PersonalSalud): void {
    this.modoEdicion.set(true);
    this.personalSeleccionadoId.set(p.personalId);
    this.form.patchValue({
      codigoInstitucional: p.codigoInstitucional,
      nombres: p.nombres,
      apellidoPaterno: p.apellidoPaterno,
      apellidoMaterno: p.apellidoMaterno,
      tipoPersonalNombre: p.tipoPersonalNombre,
      numeroDocumento: p.numeroDocumento,
      correoInstitucional: p.correoInstitucional,
      telefono: p.telefono
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

    if (this.modoEdicion() && this.personalSeleccionadoId()) {
      this.medicoService.actualizarPersonal(this.personalSeleccionadoId()!, val).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success('Personal institucional actualizado correctamente.');
          this.cerrarFormulario();
          this.cargarPersonal();
        },
        error: () => this.guardando.set(false)
      });
    } else {
      this.medicoService.crearPersonal(val).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success('Nuevo miembro de personal registrado.');
          this.cerrarFormulario();
          this.cargarPersonal();
        },
        error: () => this.guardando.set(false)
      });
    }
  }

  eliminar(p: PersonalSalud): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Eliminar Personal Institucional',
        message: `¿Confirma eliminar a "${p.nombres} ${p.apellidoPaterno}" (${p.tipoPersonalNombre})?`,
        confirmText: 'Eliminar',
        color: 'warn',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.medicoService.eliminarPersonal(p.personalId).subscribe({
          next: () => {
            this.notification.success('Personal eliminado.');
            this.cargarPersonal();
          }
        });
      }
    });
  }
}
