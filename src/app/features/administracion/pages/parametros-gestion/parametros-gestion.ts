import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ConfiguracionSistema } from '../../../../shared/models/catalogo.model';

@Component({
  selector: 'app-parametros-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, PageHeader],
  templateUrl: './parametros-gestion.html',
  styleUrl: './parametros-gestion.scss'
})
export class ParametrosGestion implements OnInit {
  private readonly catalogoService = inject(CatalogoService);
  private readonly notification = inject(NotificationService);

  readonly parametros = signal<ConfiguracionSistema[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.catalogoService.getParametros().subscribe({
      next: list => this.parametros.set(list || [])
    });
  }

  guardar(param: ConfiguracionSistema): void {
    this.catalogoService.guardarParametro(param.clave, param.valor).subscribe({
      next: () => this.notification.success(`Parámetro "${param.clave}" guardado con éxito.`)
    });
  }
}
