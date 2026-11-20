import { Routes } from '@angular/router';

export const ADMISION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'pacientes',
    pathMatch: 'full'
  },
  {
    path: 'pacientes',
    loadComponent: () => import('./pages/pacientes-list/pacientes-list').then(m => m.PacientesList)
  },
  {
    path: 'pacientes/nuevo',
    loadComponent: () => import('./pages/paciente-form/paciente-form').then(m => m.PacienteForm)
  },
  {
    path: 'citas',
    loadComponent: () => import('./pages/citas-gestion/citas-gestion').then(m => m.CitasGestion)
  }
];
