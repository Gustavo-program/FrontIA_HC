import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-confidence-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './confidence-badge.html',
  styleUrl: './confidence-badge.scss'
})
export class ConfidenceBadge {
  @Input({ required: true }) confidence!: number; // 0 - 1 or 0 - 100
  @Input() threshold = 85;

  get percentage(): number {
    return this.confidence <= 1 ? Math.round(this.confidence * 100) : Math.round(this.confidence);
  }

  get isHigh(): boolean {
    return this.percentage >= this.threshold;
  }
}
