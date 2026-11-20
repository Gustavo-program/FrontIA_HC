import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Especialidad, ServicioClinico, Cie10 } from '../../../../shared/models/catalogo.model';

@Component({
  selector: 'app-catalogos-gestion',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, MatTableModule, PageHeader],
  template: `
    <div>
      <app-page-header title="Catálogos Clínicos y Servicios" subtitle="Especialidades médicas, servicios del hospital y catálogo CIE-10"></app-page-header>
      <mat-card style="border-radius: 12px;">
        <mat-tab-group>
          <mat-tab label="Especialidades">
            <div class="p-3">
              <table mat-table [dataSource]="especialidades()" class="w-100">
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef>Código</th>
                  <td mat-cell *matCellDef="let e">{{ e.codigo }}</td>
                </ng-container>
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let e"><strong>{{ e.nombre }}</strong></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['codigo', 'nombre']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['codigo', 'nombre'];"></tr>
              </table>
            </div>
          </mat-tab>
          <mat-tab label="Servicios Clínicos">
            <div class="p-3">
              <table mat-table [dataSource]="servicios()" class="w-100">
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef>Código</th>
                  <td mat-cell *matCellDef="let s">{{ s.codigo }}</td>
                </ng-container>
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Servicio</th>
                  <td mat-cell *matCellDef="let s"><strong>{{ s.nombre }}</strong></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['codigo', 'nombre']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['codigo', 'nombre'];"></tr>
              </table>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `
})
export class CatalogosGestion implements OnInit {
  private readonly catalogoService = inject(CatalogoService);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly servicios = signal<ServicioClinico[]>([]);

  ngOnInit(): void {
    this.catalogoService.getEspecialidades().subscribe({ next: l => this.especialidades.set(l) });
    this.catalogoService.getServicios().subscribe({ next: l => this.servicios.set(l) });
  }
}
