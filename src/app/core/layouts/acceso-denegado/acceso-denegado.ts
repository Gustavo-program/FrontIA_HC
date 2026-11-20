import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="denied-container">
      <mat-icon class="denied-icon">gpp_bad</mat-icon>
      <h1>Acceso Denegado (403)</h1>
      <p>No cuenta con los permisos necesarios para acceder a esta sección del sistema INSN.</p>
      <button mat-raised-button color="primary" routerLink="/inicio">
        <mat-icon>home</mat-icon> Volver al Inicio
      </button>
    </div>
  `,
  styles: [`
    .denied-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      text-align: center;
      padding: 32px;
      .denied-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #d32f2f;
        margin-bottom: 16px;
      }
      h1 { color: #212121; margin-bottom: 8px; }
      p { color: #616161; margin-bottom: 24px; max-width: 450px; }
    }
  `]
})
export class AccesoDenegado {}
