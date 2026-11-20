import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../../core/services/api.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { Auditoria } from '../../../../shared/models/auditoria.model';

@Component({
  selector: 'app-visor-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './visor-auditoria.html',
  styleUrl: './visor-auditoria.scss'
})
export class VisorAuditoria implements OnInit {
  private readonly api = inject(ApiService);

  readonly eventos = signal<Auditoria[]>([]);
  readonly displayedColumns = ['fecha', 'usuario', 'accion', 'recurso', 'resultado', 'ip', 'detalles'];

  eventoSeleccionado: Auditoria | null = null;

  ngOnInit(): void {
    this.cargarAuditoria();
  }

  cargarAuditoria(): void {
    this.api.getPage<Auditoria>('/auditoria').subscribe({
      next: page => this.eventos.set(page.content || [])
    });
  }

  verDetalles(ev: Auditoria): void {
    this.eventoSeleccionado = ev;
  }
}
