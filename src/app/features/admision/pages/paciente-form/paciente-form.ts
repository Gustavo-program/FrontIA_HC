import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { PacienteService } from '../../../../shared/services/paciente.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TipoDocumentoIdentidad } from '../../../../shared/models/catalogo.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { fechaNoFuturaValidator } from '../../../../shared/validators/fecha-no-futura.validator';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    PageHeader
  ],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss'
})
export class PacienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly catalogoService = inject(CatalogoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly notification = inject(NotificationService);

  readonly tiposDocumento = signal<TipoDocumentoIdentidad[]>([]);
  readonly guardando = signal(false);

  // Paso 1: Datos Personales
  readonly formPersonales = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
    apellidoMaterno: [''],
    fechaNacimiento: [new Date(2023, 0, 1), [Validators.required, fechaNoFuturaValidator()]],
    sexoRegistrado: ['MASCULINO', Validators.required],
    lugarNacimiento: ['Lima'],
    paisNacimiento: ['Perú']
  });

  // Paso 2: Documento de Identidad
  readonly formDocumento = this.fb.group({
    tipoDocumentoId: ['td-01', Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]]
  });

  // Paso 3: Familiar Responsable (Obligatorio en pacientes pediátricos)
  readonly formResponsable = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
    apellidoMaterno: [''],
    parentesco: ['Madre', Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
    telefonoWhatsapp: ['', [Validators.required, Validators.minLength(7)]],
    correo: ['', [Validators.email]],
    direccion: ['']
  });

  ngOnInit(): void {
    this.catalogoService.getTiposDocumento().subscribe({
      next: tipos => this.tiposDocumento.set(tipos || [])
    });
  }

  formatDate(val: any): string {
    if (!val) return '';
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return '';
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length === 3) {
          const [d, m, y] = parts;
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
      }
      return trimmed.slice(0, 10);
    }
    return '';
  }

  guardarPaciente(irACita = false): void {
    if (this.formPersonales.invalid) {
      this.formPersonales.markAllAsTouched();
      this.notification.error('Complete los datos personales del paciente (Nombres, Apellidos y Fecha de Nacimiento válida).');
      return;
    }
    if (this.formDocumento.invalid) {
      this.formDocumento.markAllAsTouched();
      this.notification.error('Ingrese un número de documento de identidad válido para el paciente.');
      return;
    }
    if (this.formResponsable.invalid) {
      this.formResponsable.markAllAsTouched();
      this.notification.error('Complete los datos del familiar responsable (Nombres, Apellidos, DNI y Teléfono/WhatsApp).');
      return;
    }

    this.guardando.set(true);
    const p = this.formPersonales.getRawValue();
    const d = this.formDocumento.getRawValue();
    const r = this.formResponsable.getRawValue();

    const payload = {
      nombres: p.nombres!,
      apellidoPaterno: p.apellidoPaterno!,
      apellidoMaterno: p.apellidoMaterno || '',
      fechaNacimiento: this.formatDate(p.fechaNacimiento),
      sexoRegistrado: p.sexoRegistrado as any,
      lugarNacimiento: p.lugarNacimiento || 'Lima',
      paisNacimiento: p.paisNacimiento || 'Perú',
      estadoRegistro: 'ACTIVO' as const,
      documentoPrincipal: {
        tipoDocumentoId: d.tipoDocumentoId!,
        numeroDocumento: String(d.numeroDocumento!).trim(),
        esPrincipal: true,
        estadoValidacion: 'VALIDADO' as const
      },
      responsables: [
        {
          nombres: r.nombres!,
          apellidoPaterno: r.apellidoPaterno!,
          apellidoMaterno: r.apellidoMaterno || '',
          parentesco: r.parentesco!,
          numeroDocumento: String(r.numeroDocumento!).trim(),
          telefonoWhatsapp: String(r.telefonoWhatsapp!).trim(),
          correo: r.correo || 'responsable@correo.pe',
          direccion: r.direccion || '',
          esContactoPrincipal: true
        }
      ]
    };

    this.pacienteService.crearPaciente(payload).subscribe({
      next: creado => {
        this.guardando.set(false);
        this.notification.success(`¡Paciente registrado con éxito! Historia Clínica asignada N° ${creado.numeroHistoria}`);
        if (irACita) {
          this.router.navigate(['/admision/citas'], { queryParams: { pacienteId: creado.pacienteId } });
        } else {
          this.router.navigate(['/admision/pacientes']);
        }
      },
      error: err => {
        this.guardando.set(false);
        this.notification.error('Error al registrar paciente: ' + (err?.error?.message || 'Error del servidor'));
      }
    });
  }
}
