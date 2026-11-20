import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { MedicoService } from '../../../../shared/services/medico.service';
import { CitaService } from '../../../../shared/services/cita.service';
import { PacienteService } from '../../../../shared/services/paciente.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PacienteSearch } from '../../../../shared/components/paciente-search/paciente-search';
import { CupoSelector } from '../../../../shared/components/cupo-selector/cupo-selector';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { NombreCompletoPipe } from '../../../../shared/pipes/nombre-completo.pipe';
import { CitaConfirmadaDialog } from '../../../../shared/components/cita-confirmada-dialog/cita-confirmada-dialog';
import { Especialidad } from '../../../../shared/models/catalogo.model';
import { Medico } from '../../../../shared/models/medico.model';
import { Cita, Cupo } from '../../../../shared/models/cita.model';
import { Paciente } from '../../../../shared/models/paciente.model';

@Component({
  selector: 'app-citas-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDatepickerModule,
    PageHeader,
    PacienteSearch,
    CupoSelector,
    StatusChip,
    NombreCompletoPipe
  ],
  templateUrl: './citas-gestion.html',
  styleUrl: './citas-gestion.scss'
})
export class CitasGestion implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly catalogoService = inject(CatalogoService);
  private readonly medicoService = inject(MedicoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly citaService = inject(CitaService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly cupos = signal<Cupo[]>([]);
  readonly citas = signal<Cita[]>([]);
  readonly cupoSeleccionado = signal<Cupo | null>(null);
  readonly pacienteSeleccionado = signal<Paciente | null>(null);
  readonly guardando = signal(false);
  readonly selectedTab = signal<number>(0);
  readonly modoEdicion = signal(false);
  readonly citaEnEdicionId = signal<string | null>(null);

  // Filtros para la pestaña de Listado
  readonly filtroFecha = signal<Date | null>(null);
  readonly filtroEspecialidad = signal<string>('');
  readonly filtroTexto = signal<string>('');
  readonly filtroEstado = signal<string>('');

  readonly displayedColumns = ['fecha', 'hora', 'paciente', 'doctor', 'especialidad', 'estado', 'acciones'];

  readonly agendarForm = this.fb.group({
    especialidadId: ['', Validators.required],
    medicoId: ['', Validators.required],
    fecha: [new Date(), Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly citasFiltradas = computed(() => {
    const list = this.citas();
    const fFecha = this.filtroFecha();
    const fEsp = this.filtroEspecialidad();
    const fText = this.filtroTexto().toLowerCase().trim();
    const fEst = this.filtroEstado();

    const fechaFiltroStr = fFecha ? this.formatDate(fFecha) : '';

    return list.filter(c => {
      // 1. Filtro Fecha
      if (fechaFiltroStr) {
        const cFecha = c.fechaHoraInicio ? this.formatDate(c.fechaHoraInicio) : '';
        if (cFecha !== fechaFiltroStr) return false;
      }
      // 2. Filtro Especialidad
      if (fEsp) {
        const espId = c.especialidadId || c.especialidad?.especialidadId;
        if (espId !== fEsp) return false;
      }
      // 3. Filtro Estado
      if (fEst && c.estado !== fEst) {
        return false;
      }
      // 4. Filtro Texto (Paciente, HC, Doctor)
      if (fText) {
        const pacNom = `${c.paciente?.nombres || ''} ${c.paciente?.apellidoPaterno || ''} ${c.paciente?.apellidoMaterno || ''}`.toLowerCase();
        const pacHc = (c.paciente?.numeroHistoria || '').toLowerCase();
        const docNom = `${c.medico?.personal?.nombres || ''} ${c.medico?.personal?.apellidoPaterno || ''}`.toLowerCase();
        if (!pacNom.includes(fText) && !pacHc.includes(fText) && !docNom.includes(fText)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const tA = new Date(a.fechaHoraInicio || 0).getTime();
      const tB = new Date(b.fechaHoraInicio || 0).getTime();
      return tB - tA;
    });
  });

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarEspecialidadesYMedicos();

    // Si viene con parámetro pacienteId en la URL
    this.route.queryParams.subscribe(params => {
      const pacId = params['pacienteId'];
      if (pacId) {
        this.pacienteService.getPaciente(pacId).subscribe({
          next: pac => {
            if (pac) {
              this.pacienteSeleccionado.set(pac);
              this.selectedTab.set(0);
              this.notification.info(`Paciente ${pac.nombres} ${pac.apellidoPaterno} seleccionado para agendar cita.`);
            }
          }
        });
      }
    });

    this.agendarForm.get('especialidadId')?.valueChanges.subscribe(espId => {
      if (espId) {
        this.medicoService.getMedicos(0, 20, '', espId).subscribe({
          next: page => {
            this.medicos.set(page.content || []);
            // Si el médico actual no pertenece a la nueva especialidad, seleccionar el primero
            const actualMed = this.agendarForm.get('medicoId')?.value;
            const existe = page.content?.some(m => m.medicoId === actualMed);
            if (!existe && page.content && page.content.length > 0) {
              this.agendarForm.patchValue({ medicoId: page.content[0].medicoId }, { emitEvent: false });
              this.consultarCupos();
            }
          }
        });
      }
    });

    this.agendarForm.get('medicoId')?.valueChanges.subscribe(() => this.consultarCupos());
    this.agendarForm.get('fecha')?.valueChanges.subscribe(() => this.consultarCupos());
  }

  cargarEspecialidadesYMedicos(): void {
    this.catalogoService.getEspecialidades().subscribe({
      next: esps => {
        this.especialidades.set(esps || []);
        // Cargar lista inicial de médicos
        this.medicoService.getMedicos(0, 20).subscribe({
          next: page => this.medicos.set(page.content || [])
        });
      }
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

  cargarCitas(): void {
    this.citaService.getCitas().subscribe({
      next: page => this.citas.set(page.content || [])
    });
  }

  consultarCupos(): void {
    const medId = this.agendarForm.get('medicoId')?.value;
    const fecha = this.formatDate(this.agendarForm.get('fecha')?.value);
    if (medId && fecha) {
      this.medicoService.getCupos(medId, fecha).subscribe({
        next: list => {
          this.cupos.set(list || []);
          // Si estamos en edición y el cupo previamente seleccionado está en la lista de cupos libres, mantenerlo
          if (this.modoEdicion() && this.cupoSeleccionado()) {
            const hIni = this.cupoSeleccionado()?.horaInicio;
            const coincide = list.find(c => c.horaInicio === hIni);
            if (coincide && coincide.disponible) {
              this.cupoSeleccionado.set(coincide);
            }
          }
        }
      });
    }
  }

  onPaciente(p: Paciente): void {
    this.pacienteSeleccionado.set(p);
  }

  onCupo(c: Cupo): void {
    this.cupoSeleccionado.set(c);
  }

  confirmarCita(): void {
    if (!this.pacienteSeleccionado()) {
      this.notification.error('Debe buscar y seleccionar un paciente para la cita.');
      return;
    }
    if (!this.cupoSeleccionado()) {
      this.notification.error('Debe seleccionar un cupo de 30 minutos disponible.');
      return;
    }
    if (this.agendarForm.invalid) {
      this.agendarForm.markAllAsTouched();
      this.notification.error('Complete todos los campos requeridos (Especialidad, Médico, Fecha y Motivo de consulta).');
      return;
    }

    this.guardando.set(true);
    const fecha = this.formatDate(this.agendarForm.get('fecha')?.value);
    const cupo = this.cupoSeleccionado()!;
    const medId = this.agendarForm.get('medicoId')?.value!;
    const espId = this.agendarForm.get('especialidadId')?.value!;
    const pac = this.pacienteSeleccionado()!;
    const doc = this.medicos().find(m => m.medicoId === medId);
    const esp = this.especialidades().find(e => e.especialidadId === espId);

    // RN-04: La cita creada por Admisión nace en estado APROBADA
    const payload: Partial<Cita> = {
      pacienteId: pac.pacienteId,
      paciente: pac,
      medicoId: medId,
      medico: doc,
      especialidadId: espId,
      especialidad: esp,
      horarioId: 'hor-01',
      fechaHoraInicio: `${fecha}T${cupo.horaInicio}:00`,
      fechaHoraFin: `${fecha}T${cupo.horaFin}:00`,
      motivo: this.agendarForm.get('motivo')?.value!,
      estado: 'APROBADA' as const,
      origen: 'ADMISION' as const
    };

    if (this.modoEdicion() && this.citaEnEdicionId()) {
      this.citaService.actualizarCita(this.citaEnEdicionId()!, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.success('¡Cita médica actualizada y reprogramada con éxito!');
          this.cancelarEdicion();
          this.cargarCitas();
          this.selectedTab.set(1);
        },
        error: err => {
          this.guardando.set(false);
          this.notification.error('Error al actualizar la cita: ' + (err?.error?.message || 'Error del servidor'));
        }
      });
    } else {
      this.citaService.crearCita(payload).subscribe({
        next: creada => {
          this.guardando.set(false);
          this.notification.success(`¡Cita médica programada con éxito para ${pac.nombres} ${pac.apellidoPaterno} en estado APROBADA (RN-04)!`);
          this.cancelarEdicion();
          this.cargarCitas();
          this.selectedTab.set(1); // Cambia automáticamente a la pestaña de listado para verla de inmediato

          const cFull: Cita = {
            ...payload,
            ...(creada || {}),
            citaId: creada?.citaId || 'cita-' + Date.now(),
            paciente: pac,
            medico: doc,
            especialidad: esp,
            estado: 'APROBADA'
          } as Cita;
          this.lanzarNotificacionesCita(cFull, 'ADMISION');
        },
        error: err => {
          this.guardando.set(false);
          this.notification.error('Error al agendar la cita: ' + (err?.error?.message || 'Error del servidor'));
        }
      });
    }
  }

  aprobarCita(cita: Cita): void {
    const pacNom = `${cita.paciente?.nombres || ''} ${cita.paciente?.apellidoPaterno || ''}`.trim();
    if (confirm(`¿Confirma la aprobación de la cita médica del paciente ${pacNom}? (El usuario realizó el pago en caja / validó cobertura SIS. Al aprobarla se enviará la notificación por Correo y WhatsApp).`)) {
      this.citaService.cambiarEstado(cita.citaId, 'APROBADA', 'Pago en caja verificado y validado').subscribe({
        next: actualizada => {
          this.notification.success('¡Cita aprobada con éxito tras confirmación de pago!');
          this.cargarCitas();
          const cFull = { ...cita, ...actualizada, estado: 'APROBADA' as const };
          this.lanzarNotificacionesCita(cFull, 'PAGO_ADMIN');
        },
        error: err => {
          this.notification.error('Error al aprobar la cita: ' + (err?.error?.message || 'Error del servidor'));
        }
      });
    }
  }

  lanzarNotificacionesCita(cita: Cita, origen: 'ADMISION' | 'DOCTOR' | 'PAGO_ADMIN'): void {
    const pac = cita.paciente;
    const resp = pac?.responsables?.[0];
    const correoDestino = resp?.correo || (pac as any)?.correo || 'familiar.responsable@gmail.com';
    const whatsappDestino = resp?.telefonoWhatsapp || (pac as any)?.telefono || '987654321';
    const responsableNombre = resp ? `${resp.nombres} ${resp.apellidoPaterno} (${resp.parentesco})` : 'Familiar Responsable';

    const pacNom = `${pac?.nombres || ''} ${pac?.apellidoPaterno || ''}`.trim() || 'Paciente';
    const docNom = cita.medico?.personal ? `Dr(a). ${cita.medico.personal.nombres} ${cita.medico.personal.apellidoPaterno}` : 'Dr. Carlos García';
    const espNom = cita.especialidad?.nombre || 'Pediatría General';
    const fStr = this.formatDate(cita.fechaHoraInicio);
    const hIni = cita.fechaHoraInicio ? cita.fechaHoraInicio.slice(11, 16) : '08:00';
    const hFin = cita.fechaHoraFin ? cita.fechaHoraFin.slice(11, 16) : '08:30';

    const mensajeWhatsApp = `🏥 *INSTITUTO NACIONAL DE SALUD DEL NIÑO - INSN BREÑA*\n\nEstimado(a) *${responsableNombre}*, la cita médica de *${pacNom}* (HC: *${pac?.numeroHistoria || 'S/N'}*) ha sido *APROBADA Y CONFIRMADA*.\n\n📅 *Fecha:* ${fStr}\n⏰ *Horario:* ${hIni} - ${hFin}\n🩺 *Especialidad:* ${espNom}\n👨‍⚕️ *Médico:* ${docNom}\n\n📍 *Lugar:* Consultorios Externos - Av. Brasil 600, Breña.\n_Por favor presentarse 15 minutos antes con el DNI del menor y carné de vacunas._`;

    this.dialog.open(CitaConfirmadaDialog, {
      width: '540px',
      data: {
        cita,
        correoDestino,
        whatsappDestino,
        responsableNombre,
        mensajeWhatsApp,
        origen
      }
    });
  }

  editarCita(c: Cita): void {
    this.modoEdicion.set(true);
    this.citaEnEdicionId.set(c.citaId);
    this.pacienteSeleccionado.set(c.paciente || null);

    let fechaVal: Date = new Date();
    let horaIni = '08:00';
    let horaFin = '08:30';

    if (c.fechaHoraInicio) {
      const parts = c.fechaHoraInicio.split('T');
      if (parts[0]) {
        const [y, m, d] = parts[0].split('-').map(Number);
        fechaVal = new Date(y, m - 1, d);
      }
      if (parts[1]) {
        horaIni = parts[1].slice(0, 5);
      }
    }
    if (c.fechaHoraFin) {
      const parts = c.fechaHoraFin.split('T');
      if (parts[1]) {
        horaFin = parts[1].slice(0, 5);
      }
    }

    const espId = c.especialidadId || c.especialidad?.especialidadId || 'esp-01';
    const medId = c.medicoId || c.medico?.medicoId || 'med-01';

    // Cargar médicos de la especialidad antes de fijar el valor
    this.medicoService.getMedicos(0, 20, '', espId).subscribe({
      next: page => {
        this.medicos.set(page.content || []);
        this.agendarForm.patchValue({
          especialidadId: espId,
          medicoId: medId,
          fecha: fechaVal,
          motivo: c.motivo || 'Consulta y control médico pediátrico'
        });

        this.cupoSeleccionado.set({
          horaInicio: horaIni,
          horaFin: horaFin,
          disponible: true
        });

        this.consultarCupos();
      }
    });

    this.selectedTab.set(0); // Cambia al formulario para editar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(false);
    this.citaEnEdicionId.set(null);
    this.pacienteSeleccionado.set(null);
    this.cupoSeleccionado.set(null);
    this.agendarForm.reset({
      especialidadId: '',
      medicoId: '',
      fecha: new Date(),
      motivo: ''
    });
  }

  cancelarCita(cita: Cita): void {
    if (confirm('¿Desea cancelar esta cita programada?')) {
      this.citaService.cambiarEstado(cita.citaId, 'CANCELADA', 'Cancelada por Admisión').subscribe({
        next: () => {
          this.notification.info('Cita cancelada correctamente.');
          this.cargarCitas();
        }
      });
    }
  }

  eliminarCita(cita: Cita): void {
    if (confirm(`¿Confirma eliminar definitivamente la cita del paciente ${cita.paciente?.nombres || ''} ${cita.paciente?.apellidoPaterno || ''}?`)) {
      this.citaService.eliminarCita(cita.citaId).subscribe({
        next: () => {
          this.notification.success('Cita eliminada del sistema.');
          if (this.citaEnEdicionId() === cita.citaId) {
            this.cancelarEdicion();
          }
          this.cargarCitas();
        }
      });
    }
  }

  limpiarFiltros(): void {
    this.filtroFecha.set(null);
    this.filtroEspecialidad.set('');
    this.filtroTexto.set('');
    this.filtroEstado.set('');
  }
}
