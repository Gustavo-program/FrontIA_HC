import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/reportes-dashboard/reportes-dashboard').then(m => m.ReportesDashboard)
  }
];
