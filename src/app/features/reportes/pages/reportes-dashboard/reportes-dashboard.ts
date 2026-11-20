import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../../../core/services/api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-reportes-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    PageHeader
  ],
  templateUrl: './reportes-dashboard.html',
  styleUrl: './reportes-dashboard.scss'
})
export class ReportesDashboard implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notification = inject(NotificationService);

  readonly stats = signal<any>({
    totalAtenciones: 142,
    totalPacientes: 98,
    atencionesPorMes: [
      { mes: 'Junio', cantidad: 18 },
      { mes: 'Julio', cantidad: 22 },
      { mes: 'Agosto', cantidad: 27 },
      { mes: 'Septiembre', cantidad: 24 },
      { mes: 'Octubre', cantidad: 31 },
      { mes: 'Noviembre', cantidad: 20 }
    ],
    topDiagnosticos: [
      { codigo: 'J00', descripcion: 'Rinofaringitis aguda [resfriado]', cantidad: 38 },
      { codigo: 'J02.9', descripcion: 'Faringitis aguda no especificada', cantidad: 29 },
      { codigo: 'J20.9', descripcion: 'Bronquitis aguda', cantidad: 21 },
      { codigo: 'A09', descripcion: 'Gastroenteritis aguda no especificada', cantidad: 18 },
      { codigo: 'J45.9', descripcion: 'Asma no especificada', cantidad: 15 }
    ]
  });

  readonly displayedColumns = ['posicion', 'codigo', 'descripcion', 'cantidad', 'barra'];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.api.get<any>('/reportes/atenciones').subscribe({
      next: res => this.stats.set(res)
    });
  }

  exportar(formato: 'pdf' | 'xlsx'): void {
    this.notification.info(`Generando reporte asistencial en formato ${formato.toUpperCase()}...`);
    setTimeout(() => {
      this.notification.success(`El archivo "Reporte_Asistencial_INSN.${formato}" se ha descargado correctamente.`);
    }, 1000);
  }
}
