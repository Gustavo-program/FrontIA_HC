import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cupo } from '../../models/cita.model';

@Component({
  selector: 'app-cupo-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './cupo-selector.html',
  styleUrl: './cupo-selector.scss'
})
export class CupoSelector {
  @Input() cupos: Cupo[] = [];
  @Input() cupoSeleccionado?: Cupo | null;
  @Output() cupoChange = new EventEmitter<Cupo>();

  seleccionarCupo(cupo: Cupo): void {
    if (!cupo.disponible) return;
    this.cupoChange.emit(cupo);
  }

  isSelected(cupo: Cupo): boolean {
    return this.cupoSeleccionado?.horaInicio === cupo.horaInicio;
  }
}
