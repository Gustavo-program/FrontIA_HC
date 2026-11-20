import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../core/auth/auth.store';
import { PageHeader } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, PageHeader],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class Inicio {
  readonly store = inject(AuthStore);
  readonly hoy = new Date();
}
