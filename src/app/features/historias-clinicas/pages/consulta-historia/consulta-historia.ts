import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PacienteSearch } from '../../../../shared/components/paciente-search/paciente-search';
import { Paciente } from '../../../../shared/models/paciente.model';

@Component({
  selector: 'app-consulta-historia',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    PageHeader,
    PacienteSearch
  ],
  template: `
    <div class="consulta-page">
      <app-page-header
        title="Consulta de Historias Clínicas"
        subtitle="Búsqueda centralizada de expedientes médicos digitales y digitalizados del INSN">
      </app-page-header>

      <div style="max-width: 760px; margin: 0 auto;">
        <mat-card style="border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <app-paciente-search (pacienteSelected)="abrir($event)"></app-paciente-search>

          <div class="mt-4 pt-3" style="border-top: 1px solid #e2e8f0;">
            <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 12px;">
              Expedientes Clínicos Recientes:
            </span>

            <div class="d-flex flex-column gap-2">
              <button
                mat-stroked-button
                class="recent-btn"
                style="text-align: left; height: auto; padding: 12px 16px; border-radius: 8px; justify-content: flex-start;"
                (click)="abrirPorNumero('2024031')">
                <mat-icon color="accent" class="mr-2">verified</mat-icon>
                <div class="d-flex flex-column" style="line-height: 1.3;">
                  <strong>ALARCÓN CASTILLO VALERIA SOFÍA (HC: 2024031)</strong>
                  <span style="font-size: 12px; color: #64748b;">DNI: 78451290 | Edad: 5 años | CIRUGÍA PEDIÁTRICA (Apendicectomía - Digitalizado OK 96%)</span>
                </div>
              </button>

              <button
                mat-stroked-button
                class="recent-btn"
                style="text-align: left; height: auto; padding: 12px 16px; border-radius: 8px; justify-content: flex-start;"
                (click)="abrirPorNumero('2025098')">
                <mat-icon color="warn" class="mr-2">pending_actions</mat-icon>
                <div class="d-flex flex-column" style="line-height: 1.3;">
                  <strong>BENÍTEZ HUAMÁN MATÍAS NICOLÁS (HC: 2025098)</strong>
                  <span style="font-size: 12px; color: #64748b;">DNI: 82390145 | Edad: 3 años | EMERGENCIA PEDIÁTRICA (Crisis Convulsiva Febril - Req. Validación 74%)</span>
                </div>
              </button>

              <button
                mat-stroked-button
                class="recent-btn"
                style="text-align: left; height: auto; padding: 12px 16px; border-radius: 8px; justify-content: flex-start;"
                (click)="abrirPorNumero('2023017')">
                <mat-icon color="warn" class="mr-2">pending_actions</mat-icon>
                <div class="d-flex flex-column" style="line-height: 1.3;">
                  <strong>ROJAS PAREDES CAMILA ESPERANZA (HC: 2023017)</strong>
                  <span style="font-size: 12px; color: #64748b;">DNI: 75128934 | Edad: 7 años | NEUMOLOGÍA PEDIÁTRICA (Asma Bronquial - Req. Validación 68%)</span>
                </div>
              </button>

              <button
                mat-stroked-button
                class="recent-btn"
                style="text-align: left; height: auto; padding: 12px 16px; border-radius: 8px; justify-content: flex-start;"
                (click)="abrirPorNumero('2026009')">
                <mat-icon color="primary" class="mr-2">picture_as_pdf</mat-icon>
                <div class="d-flex flex-column" style="line-height: 1.3;">
                  <strong>NEIRA CARHUAPOMA JHUNIOR ADAEL (HC: 2026009)</strong>
                  <span style="font-size: 12px; color: #64748b;">DNI: 90247117 | Edad: 9 años | CARDIOLOGÍA (Teleinterconsulta con PDF Escaneado Original)</span>
                </div>
              </button>

              <button
                mat-stroked-button
                class="recent-btn"
                style="text-align: left; height: auto; padding: 12px 16px; border-radius: 8px; justify-content: flex-start;"
                (click)="abrirPorNumero('2020891')">
                <mat-icon color="primary" class="mr-2">folder_shared</mat-icon>
                <div class="d-flex flex-column" style="line-height: 1.3;">
                  <strong>QUISPE MAMANI MATEO SEBASTIÁN (HC: 2020891)</strong>
                  <span style="font-size: 12px; color: #64748b;">DNI: 76891234 | Edad: 6 años | PEDIATRÍA GENERAL (Historia Clínica Electrónica Nativa)</span>
                </div>
              </button>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class ConsultaHistoria {
  private readonly router = inject(Router);

  abrir(p: Paciente): void {
    if (p.numeroHistoria) {
      this.router.navigate(['/historias', p.numeroHistoria]);
    }
  }

  abrirPorNumero(numeroHistoria: string): void {
    this.router.navigate(['/historias', numeroHistoria]);
  }
}
