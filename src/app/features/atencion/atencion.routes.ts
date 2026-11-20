import { Routes } from '@angular/router';

export const ATENCION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/agenda-dia/agenda-dia').then(m => m.AgendaDia)
  },
  {
    path: ':citaId',
    loadComponent: () => import('./pages/atencion-paciente/atencion-paciente').then(m => m.AtencionPaciente)
  }
];
