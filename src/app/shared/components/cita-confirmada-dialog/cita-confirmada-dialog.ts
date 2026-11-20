import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Cita } from '../../models/cita.model';
import { NombreCompletoPipe } from '../../pipes/nombre-completo.pipe';

export interface CitaConfirmadaData {
  cita: Cita;
  correoDestino: string;
  whatsappDestino: string;
  responsableNombre: string;
  mensajeWhatsApp: string;
  origen: 'ADMISION' | 'DOCTOR' | 'PAGO_ADMIN';
}

@Component({
  selector: 'app-cita-confirmada-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, NombreCompletoPipe],
  templateUrl: './cita-confirmada-dialog.html',
  styleUrl: './cita-confirmada-dialog.scss'
})
export class CitaConfirmadaDialog {
  readonly dialogRef = inject(MatDialogRef<CitaConfirmadaDialog>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: CitaConfirmadaData) {}

  get whatsappUrl(): string {
    const raw = (this.data.whatsappDestino || '').replace(/\D/g, '');
    const cleanPhone = raw.startsWith('51') ? raw : `51${raw}`;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(this.data.mensajeWhatsApp)}`;
  }

  abrirWhatsApp(): void {
    window.open(this.whatsappUrl, '_blank');
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
