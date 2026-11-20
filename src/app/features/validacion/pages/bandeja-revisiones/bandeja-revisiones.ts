import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ValidacionService } from '../../services/validacion.service';
import { RevisionDocumental } from '../../../../shared/models/documento.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ConfidenceBadge } from '../../../../shared/components/confidence-badge/confidence-badge';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-bandeja-revisiones',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    PageHeader,
    ConfidenceBadge,
    StatusChip,
    EmptyState
  ],
  templateUrl: './bandeja-revisiones.html',
  styleUrl: './bandeja-revisiones.scss'
})
export class BandejaRevisiones implements OnInit {
  private readonly validacionService = inject(ValidacionService);

  readonly revisiones = signal<RevisionDocumental[]>([]);
  readonly displayedColumns = ['documento', 'motivo', 'confianza', 'estado', 'fecha', 'acciones'];

  ngOnInit(): void {
    this.cargarRevisiones();
  }

  cargarRevisiones(): void {
    this.validacionService.getRevisiones().subscribe({
      next: page => this.revisiones.set(page.content || [])
    });
  }
}
