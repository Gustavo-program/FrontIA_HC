import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="notfound-container">
      <mat-icon class="notfound-icon">error_outline</mat-icon>
      <h1>Página No Encontrada (404)</h1>
      <p>La ruta a la que intenta acceder no existe en el sistema de Historias Clínicas INSN.</p>
      <button mat-raised-button color="primary" routerLink="/inicio">
        <mat-icon>home</mat-icon> Ir al Inicio
      </button>
    </div>
  `,
  styles: [`
    .notfound-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      text-align: center;
      padding: 32px;
      .notfound-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #0288d1;
        margin-bottom: 16px;
      }
      h1 { color: #212121; margin-bottom: 8px; }
      p { color: #616161; margin-bottom: 24px; max-width: 450px; }
    }
  `]
})
export class NotFound {}
