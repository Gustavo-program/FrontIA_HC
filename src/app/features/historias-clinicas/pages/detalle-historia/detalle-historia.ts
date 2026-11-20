import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PacienteService } from '../../../../shared/services/paciente.service';
import { Paciente } from '../../../../shared/models/paciente.model';
import { HistoriaClinica } from '../../../../shared/models/historia-clinica.model';
import { Atencion } from '../../../../shared/models/atencion.model';
import { DocumentoClinico } from '../../../../shared/models/documento.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { NombreCompletoPipe } from '../../../../shared/pipes/nombre-completo.pipe';
import { EdadPipe } from '../../../../shared/pipes/edad.pipe';
import { PdfViewer } from '../../../../shared/components/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-detalle-historia',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    PageHeader,
    NombreCompletoPipe,
    EdadPipe,
    PdfViewer
  ],
  templateUrl: './detalle-historia.html',
  styleUrl: './detalle-historia.scss'
})
export class DetalleHistoria implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pacienteService = inject(PacienteService);

  readonly paciente = signal<Paciente | null>(null);
  readonly historia = signal<HistoriaClinica | null>(null);
  readonly atenciones = signal<Atencion[]>([]);
  readonly documentos = signal<DocumentoClinico[]>([]);

  readonly pdfUrl = computed<string | null>(() => {
    const docs = this.documentos();
    const docConPdf = docs.find(d => !!d.urlPdf);
    if (docConPdf?.urlPdf) {
      return docConPdf.urlPdf;
    }
    return null;
  });

  ngOnInit(): void {
    const num = this.route.snapshot.paramMap.get('numeroHistoria');
    if (num) {
      this.pacienteService.getHistoriaPorNumero(num).subscribe({
        next: res => {
          this.paciente.set(res.paciente);
          this.historia.set(res.historia);
          this.atenciones.set(res.atenciones);
          this.documentos.set(res.documentos);
        }
      });
    }
  }
}
