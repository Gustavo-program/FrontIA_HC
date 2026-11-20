import { Routes } from '@angular/router';

export const HISTORIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/consulta-historia/consulta-historia').then(m => m.ConsultaHistoria)
  },
  {
    path: ':numeroHistoria',
    loadComponent: () => import('./pages/detalle-historia/detalle-historia').then(m => m.DetalleHistoria)
  }
];
