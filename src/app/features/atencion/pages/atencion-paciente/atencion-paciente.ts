import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { CitaService } from '../../../../shared/services/cita.service';
import { PacienteService } from '../../../../shared/services/paciente.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { AtencionService } from '../../services/atencion.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Cita } from '../../../../shared/models/cita.model';
import { Paciente } from '../../../../shared/models/paciente.model';
import { Atencion } from '../../../../shared/models/atencion.model';
import { Cie10 } from '../../../../shared/models/catalogo.model';
import { DocumentoClinico } from '../../../../shared/models/documento.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { NombreCompletoPipe } from '../../../../shared/pipes/nombre-completo.pipe';
import { EdadPipe } from '../../../../shared/pipes/edad.pipe';
import { PdfViewer } from '../../../../shared/components/pdf-viewer/pdf-viewer';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { NuevaCitaDialog } from '../../components/nueva-cita-dialog/nueva-cita-dialog';

@Component({
  selector: 'app-atencion-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatRadioModule,
    PageHeader,
    NombreCompletoPipe,
    EdadPipe,
    PdfViewer
  ],
  templateUrl: './atencion-paciente.html',
  styleUrl: './atencion-paciente.scss'
})
export class AtencionPaciente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly citaService = inject(CitaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly atencionService = inject(AtencionService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly cita = signal<Cita | null>(null);
  readonly paciente = signal<Paciente | null>(null);
  readonly atencionesPrevias = signal<Atencion[]>([]);
  readonly documentosPrevios = signal<DocumentoClinico[]>([]);
  readonly guardando = signal(false);
  readonly cie10Opciones = signal<Cie10[]>([]);

  // Formulario Reactivo de Consulta
  readonly formConsulta = this.fb.group({
    motivoConsulta: ['', [Validators.required, Validators.minLength(5)]],
    antecedentes: [''],
    observaciones: [''],
    recomendaciones: [''],
    diagnosticos: this.fb.array([])
  });

  // Formulario de Receta Médica
  readonly formReceta = this.fb.group({
    indicaciones: [''],
    medicamentos: this.fb.array([])
  });

  // Envío de Receta
  canalEnvio = 'EMAIL';
  destinoEnvio = '';

  get diagnosticosArray(): FormArray {
    return this.formConsulta.get('diagnosticos') as FormArray;
  }

  get medicamentosArray(): FormArray {
    return this.formReceta.get('medicamentos') as FormArray;
  }

  ngOnInit(): void {
    const citaId = this.route.snapshot.paramMap.get('citaId');
    if (citaId) {
      if (citaId.startsWith('pac-')) {
        this.cargarDatosPaciente(citaId);
      } else {
        this.citaService.getCita(citaId).subscribe({
          next: c => {
            this.cita.set(c);
            if (c.pacienteId) {
              this.cargarDatosPaciente(c.pacienteId);
            }
          },
          error: () => {
            this.cargarDatosPaciente(citaId);
          }
        });
      }
    }

    // Inicializar con 1 diagnóstico y 1 medicamento
    this.agregarDiagnostico(true);
    this.agregarMedicamento();
  }

  cargarDatosPaciente(pacienteId: string): void {
    this.pacienteService.getPaciente(pacienteId).subscribe({
      next: p => {
        this.paciente.set(p);
        const respPrincipal = p.responsables?.find(r => r.esContactoPrincipal) || p.responsables?.[0];
        if (respPrincipal) {
          this.destinoEnvio = respPrincipal.correo || respPrincipal.telefonoWhatsapp || '';
        }
      }
    });

    this.pacienteService.getAtenciones(pacienteId).subscribe({
      next: atens => this.atencionesPrevias.set(atens || [])
    });

    this.pacienteService.getDocumentos(pacienteId).subscribe({
      next: docs => this.documentosPrevios.set(docs || [])
    });
  }

  buscarCie10(query: string): void {
    if (query && query.length >= 2) {
      this.catalogoService.getCie10(query).subscribe({
        next: list => this.cie10Opciones.set(list || [])
      });
    }
  }

  agregarDiagnostico(esPrincipal = false): void {
    const diagGroup = this.fb.group({
      cie10Id: ['', Validators.required],
      cie10Descripcion: ['', Validators.required],
      tipo: [esPrincipal ? 'PRINCIPAL' : 'SECUNDARIO', Validators.required],
      observaciones: ['']
    });
    this.diagnosticosArray.push(diagGroup);
  }

  eliminarDiagnostico(index: number): void {
    if (this.diagnosticosArray.length > 1) {
      this.diagnosticosArray.removeAt(index);
    }
  }

  seleccionarCie10(event: any, index: number): void {
    const c = event.option.value as Cie10;
    const g = this.diagnosticosArray.at(index) as FormGroup;
    g.patchValue({
      cie10Id: c.cie10Id,
      cie10Descripcion: `${c.codigo} - ${c.descripcion}`
    });
  }

  agregarMedicamento(): void {
    const medGroup = this.fb.group({
      nombre: ['', Validators.required],
      concentracion: [''],
      dosis: ['', Validators.required],
      frecuencia: ['', Validators.required],
      duracion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
    this.medicamentosArray.push(medGroup);
  }

  eliminarMedicamento(index: number): void {
    this.medicamentosArray.removeAt(index);
  }

  guardarBorrador(): void {
    this.guardando.set(true);
    const atencion = this.construirPayload('BORRADOR');
    this.atencionService.guardarAtencion(atencion).subscribe({
      next: () => {
        this.guardando.set(false);
        this.notification.success('Borrador de atención médica guardado.');
      },
      error: () => this.guardando.set(false)
    });
  }

  finalizarAtencion(): void {
    if (this.formConsulta.invalid) {
      this.formConsulta.markAllAsTouched();
      this.notification.error('El motivo de consulta y al menos un diagnóstico CIE-10 son obligatorios (RF-ATE-05).');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Finalizar Consulta Médica',
        message: '¿Confirma que desea dar por finalizada esta atención médica? Una vez finalizada quedará en solo lectura para salvaguardar el acto médico.',
        confirmText: 'Finalizar Atención',
        color: 'primary',
        icon: 'verified'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.guardando.set(true);
        const atencion = this.construirPayload('FINALIZADA');
        this.atencionService.guardarAtencion(atencion).subscribe({
          next: () => {
            this.guardando.set(false);
            this.notification.success('Atención médica finalizada con éxito.');
            this.router.navigate(['/atencion']);
          },
          error: () => this.guardando.set(false)
        });
      }
    });
  }

  enviarReceta(): void {
    if (!this.destinoEnvio) {
      this.notification.error('No se ha especificado el correo o WhatsApp de destino.');
      return;
    }

    this.atencionService.enviarReceta('rec-01', this.canalEnvio as any, this.destinoEnvio).subscribe({
      next: res => this.notification.success(res.mensaje)
    });
  }

  nuevaCita(): void {
    this.dialog.open(NuevaCitaDialog, { width: '600px' });
  }

  private construirPayload(estado: 'BORRADOR' | 'FINALIZADA'): Partial<Atencion> {
    const val = this.formConsulta.getRawValue();
    const rec = this.formReceta.getRawValue();

    return {
      historiaClinicaId: this.paciente()?.historiaClinicaId || 'hc-01',
      citaId: this.cita()?.citaId,
      medicoId: this.cita()?.medicoId || 'med-01',
      servicioId: 'ser-01',
      motivoConsulta: val.motivoConsulta!,
      antecedentes: val.antecedentes || '',
      observaciones: val.observaciones || '',
      recomendaciones: val.recomendaciones || '',
      estado,
      origen: 'CONSULTA',
      diagnosticos: val.diagnosticos.map((d: any) => ({
        cie10Id: d.cie10Id,
        tipo: d.tipo
      })),
      receta: {
        recetaId: 'rec-' + Date.now(),
        atencionId: '',
        indicaciones: rec.indicaciones || '',
        medicamentos: rec.medicamentos as any
      }
    };
  }
}
