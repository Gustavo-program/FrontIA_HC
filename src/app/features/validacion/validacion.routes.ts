import { Routes } from '@angular/router';

export const VALIDACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/bandeja-revisiones/bandeja-revisiones').then(m => m.BandejaRevisiones)
  },
  {
    path: ':revisionId',
    loadComponent: () => import('./pages/detalle-revision/detalle-revision').then(m => m.DetalleRevision)
  }
];
