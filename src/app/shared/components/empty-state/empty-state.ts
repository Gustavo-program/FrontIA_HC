import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss'
})
export class EmptyState {
  @Input() icon = 'inbox';
  @Input() title = 'No hay registros';
  @Input() description = 'No se encontraron elementos para mostrar';
  @Input() actionText?: string;
  @Output() actionClick = new EventEmitter<void>();
}
