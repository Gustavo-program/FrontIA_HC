import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { AtencionService } from '../../services/atencion.service';
import { PacienteService } from '../../../../shared/services/paciente.service';
import { Cita } from '../../../../shared/models/cita.model';
import { Paciente } from '../../../../shared/models/paciente.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { NombreCompletoPipe } from '../../../../shared/pipes/nombre-completo.pipe';
import { EdadPipe } from '../../../../shared/pipes/edad.pipe';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { NuevaCitaDialog } from '../../components/nueva-cita-dialog/nueva-cita-dialog';

@Component({
  selector: 'app-agenda-dia',
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
    MatTabsModule,
    MatDatepickerModule,
    PageHeader,
    NombreCompletoPipe,
    EdadPipe,
    StatusChip,
    EmptyState
  ],
  templateUrl: './agenda-dia.html',
  styleUrl: './agenda-dia.scss'
})
export class AgendaDia implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly pacienteService = inject(PacienteService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly citas = signal<Cita[]>([]);
  readonly pacientes = signal<Paciente[]>([]);
  readonly fechaSeleccionada = signal<any>(new Date());
  readonly busqueda = signal<string>('');
  readonly busquedaPacientes = signal<string>('');

  readonly displayedColumns = ['hora', 'paciente', 'historia', 'edad', 'motivo', 'estado', 'acciones'];
  readonly pacColumns = ['historia', 'nombres', 'documento', 'edad', 'acciones'];

  readonly citasFiltradas = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    const all = this.citas();
    if (!term) return all;
    return all.filter(c => {
      const nom = ((c.paciente?.nombres || '') + ' ' + (c.paciente?.apellidoPaterno || '')).toLowerCase();
      const hc = (c.paciente?.numeroHistoria || '').toLowerCase();
      const dni = (c.paciente?.documentoPrincipal?.numeroDocumento || '');
      return nom.includes(term) || hc.includes(term) || dni.includes(term);
    });
  });

  readonly pacientesFiltrados = computed(() => {
    const term = this.busquedaPacientes().trim().toLowerCase();
    const all = this.pacientes();
    if (!term) return all;
    return all.filter(p => {
      const nom = (p.nombres + ' ' + p.apellidoPaterno + ' ' + (p.apellidoMaterno || '')).toLowerCase();
      const hc = (p.numeroHistoria || '').toLowerCase();
      const dni = (p.documentoPrincipal?.numeroDocumento || '');
      return nom.includes(term) || hc.includes(term) || dni.includes(term);
    });
  });

  ngOnInit(): void {
    this.cargarAgenda();
    this.cargarPacientes();
  }

  formatDate(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val.slice(0, 10);
    const d = new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cargarAgenda(): void {
    const fechaStr = this.formatDate(this.fechaSeleccionada());
    this.atencionService.getAgenda(fechaStr).subscribe({
      next: lista => this.citas.set(lista || [])
    });
  }

  cargarPacientes(): void {
    this.pacienteService.getPacientes(0, 50).subscribe({
      next: page => this.pacientes.set(page.content || [])
    });
  }

  atender(cita: Cita): void {
    this.router.navigate(['/atencion', cita.citaId]);
  }

  atenderPacienteDirecto(p: Paciente): void {
    this.router.navigate(['/atencion', p.pacienteId]);
  }

  abrirNuevaCita(): void {
    const ref = this.dialog.open(NuevaCitaDialog, {
      width: '600px'
    });
    ref.afterClosed().subscribe(creada => {
      if (creada) {
        this.cargarAgenda();
      }
    });
  }
}
