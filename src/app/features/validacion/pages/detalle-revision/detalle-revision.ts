import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { ValidacionService } from '../../services/validacion.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RevisionDocumental, CampoExtraido } from '../../../../shared/models/documento.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PdfViewer } from '../../../../shared/components/pdf-viewer/pdf-viewer';
import { ConfidenceBadge } from '../../../../shared/components/confidence-badge/confidence-badge';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-detalle-revision',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeader,
    PdfViewer,
    ConfidenceBadge
  ],
  templateUrl: './detalle-revision.html',
  styleUrl: './detalle-revision.scss'
})
export class DetalleRevision implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly validacionService = inject(ValidacionService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly revision = signal<RevisionDocumental | null>(null);
  readonly campos = signal<CampoExtraido[]>([]);
  readonly guardando = signal(false);
  readonly pdfUrl = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('revisionId');
    if (id) {
      this.validacionService.getRevision(id).subscribe({
        next: rev => {
          this.revision.set(rev);
          if (rev.documento?.urlPdf) {
            this.pdfUrl.set(rev.documento.urlPdf);
          } else {
            const lastUploaded = sessionStorage.getItem('hc_last_uploaded_pdf');
            if (lastUploaded) {
              this.pdfUrl.set(lastUploaded);
            }
          }
          this.campos.set(rev.campos.map(c => ({
            ...c,
            valorCorregido: c.valorCorregido !== undefined ? c.valorCorregido : c.valorExtraido
          })));
        }
      });
    }
  }

  // RN-08: En Validación, la palabra o campo ilegible se completa con "-"
  marcarIlegible(campo: CampoExtraido): void {
    campo.valorCorregido = '-';
  }

  esCampoExtenso(campo: CampoExtraido): boolean {
    const n = (campo.nombreCampo || '').toLowerCase();
    const l = (campo.etiqueta || '').toLowerCase();
    return n.includes('plan') || 
           n.includes('tratamiento') || 
           n.includes('dosis') || 
           n.includes('indicaciones') || 
           n.includes('recomendaciones') || 
           n.includes('hallazgos') || 
           n.includes('observaciones') || 
           n.includes('motivo') || 
           n.includes('antecedentes') ||
           l.includes('plan') ||
           l.includes('tratamiento') ||
           l.includes('indicaciones') ||
           l.includes('recomendaciones') ||
           !!(campo.valorExtraido && campo.valorExtraido.length > 45);
  }

  autorizar(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Autorizar e Incorporar a la Historia Clínica',
        message: '¿Confirma que los datos corregidos son fidedignos al expediente físico? Esta acción guardará el registro clínico en la base de datos.',
        confirmText: 'Autorizar Documento',
        color: 'primary',
        icon: 'verified'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado && this.revision()) {
        this.guardando.set(true);
        this.validacionService.autorizar(this.revision()!.revisionId).subscribe({
          next: () => {
            this.guardando.set(false);
            this.notification.success('Historia Clínica autorizada e incorporada exitosamente.');
            this.router.navigate(['/validacion']);
          },
          error: () => this.guardando.set(false)
        });
      }
    });
  }

  devolver(): void {
    const motivo = prompt('Ingrese el motivo obligatorio de devolución o rechazo:');
    if (motivo && motivo.trim().length > 0) {
      this.guardando.set(true);
      this.validacionService.devolver(this.revision()!.revisionId, motivo.trim()).subscribe({
        next: () => {
          this.guardando.set(false);
          this.notification.info('El documento ha sido devuelto para subsanación.');
          this.router.navigate(['/validacion']);
        },
        error: () => this.guardando.set(false)
      });
    }
  }
}
