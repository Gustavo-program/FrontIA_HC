import { Routes } from '@angular/router';

export const AUDITORIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/visor-auditoria/visor-auditoria').then(m => m.VisorAuditoria)
  }
];
