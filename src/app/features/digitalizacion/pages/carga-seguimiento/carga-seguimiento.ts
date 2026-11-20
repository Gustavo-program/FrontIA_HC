import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DigitalizacionService } from '../../services/digitalizacion.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentoClinico } from '../../../../shared/models/documento.model';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ConfidenceBadge } from '../../../../shared/components/confidence-badge/confidence-badge';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-carga-seguimiento',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    PageHeader,
    ConfidenceBadge,
    StatusChip,
    EmptyState
  ],
  templateUrl: './carga-seguimiento.html',
  styleUrl: './carga-seguimiento.scss'
})
export class CargaSeguimiento implements OnInit {
  private readonly digService = inject(DigitalizacionService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly documentos = signal<DocumentoClinico[]>([]);
  readonly isUploading = signal(false);
  readonly dragOver = signal(false);

  readonly displayedColumns = [
    'nombreArchivo',
    'fecha',
    'paginas',
    'confiabilidad',
    'estado',
    'resultado',
    'acciones'
  ];

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.digService.getDocumentos().subscribe({
      next: page => this.documentos.set(page.content || [])
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.procesarArchivos(Array.from(files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (event.dataTransfer?.files) {
      this.procesarArchivos(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  private procesarArchivos(files: File[]): void {
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      this.notification.error('Solo se permite cargar documentos en formato PDF.');
      return;
    }

    this.isUploading.set(true);
    let completed = 0;

    pdfFiles.forEach(file => {
      const blobUrl = URL.createObjectURL(file);
      sessionStorage.setItem('hc_last_uploaded_pdf', blobUrl);

      this.digService.subirDocumento(file).subscribe({
        next: doc => {
          doc.urlPdf = blobUrl;
          completed++;
          if (doc.confiabilidadPromedio && doc.confiabilidadPromedio >= 85) {
            this.notification.success(`"${file.name}" digitalizado e incorporado automáticamente a HC (${doc.confiabilidadPromedio}%)`);
          } else {
            this.notification.warning(`"${file.name}" derivado a Validación manual (${doc.confiabilidadPromedio}% < 85%)`);
          }
          if (completed === pdfFiles.length) {
            this.isUploading.set(false);
            this.cargarDocumentos();
          }
        },
        error: () => {
          completed++;
          if (completed === pdfFiles.length) {
            this.isUploading.set(false);
            this.cargarDocumentos();
          }
        }
      });
    });
  }

  reprocesar(doc: DocumentoClinico): void {
    this.digService.reprocesar(doc.documentoClinicoId).subscribe({
      next: () => {
        this.notification.success('Documento reprocesado con éxito.');
        this.cargarDocumentos();
      }
    });
  }

  eliminar(doc: DocumentoClinico): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Eliminar Documento Escaneado',
        message: `¿Está seguro de eliminar el archivo escaneado "${doc.nombreArchivoOriginal}"? Esta acción removerá el documento digitalizado.`,
        confirmText: 'Eliminar Documento',
        color: 'warn',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.digService.eliminarDocumento(doc.documentoClinicoId).subscribe({
          next: () => {
            this.notification.success('Documento escaneado eliminado del sistema.');
            this.cargarDocumentos();
          }
        });
      }
    });
  }
}
