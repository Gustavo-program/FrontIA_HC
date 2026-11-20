import { Routes } from '@angular/router';

export const DIGITALIZACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/carga-seguimiento/carga-seguimiento').then(m => m.CargaSeguimiento)
  }
];
