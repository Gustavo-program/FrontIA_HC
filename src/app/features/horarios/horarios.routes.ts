import { Routes } from '@angular/router';

export const HORARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/gestion-horarios/gestion-horarios').then(m => m.GestionHorarios)
  }
];
